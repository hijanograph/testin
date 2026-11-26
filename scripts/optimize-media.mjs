#!/usr/bin/env node
// Completa los formatos que faltan en public/images para que solo tengas que subir uno de cada par.
//
//   npm run optimize          revisa public/images y genera lo que falte
//   npm run optimize:watch    se queda vigilando la carpeta y lo hace al añadir o cambiar archivos
//   npm run optimize -- --force   regenera también lo que ya se había generado
//
// Reglas (por nombre y carpeta):
//   imagen .avif sin .jpg  →  crea el .jpg        imagen .jpg sin .avif  →  crea el .avif
//   vídeo  .mp4 sin .av1.mp4  →  crea el .av1.mp4  vídeo .av1.mp4 sin .mp4  →  crea el .mp4 (H.264)
//   vídeo sin .jpg  →  crea el .jpg de póster (un fotograma del vídeo)
// Si junto a un .mp4 o .av1.mp4 hay un .jpg con el mismo nombre, ese .jpg es el póster del vídeo.
//
// Nunca sobrescribe archivos tuyos: solo regenera los que él mismo creó (apuntados en
// scripts/media-manifest.json, que conviene subir al repo) cuando cambia su archivo de origen.
//
// Modo manual para convertir originales (png, webp, tif, gif, mov, webm…), con el resultado junto al archivo:
//   npm run optimize -- <archivo|carpeta>... [--width N] [--quality N] [--poster N] [--share]
// Para los vídeos usa ffmpeg: el de npm (ffmpeg-static + @ffprobe-installer/ffprobe) o, si no, el del PATH.
import { readdir, stat, readFile, writeFile, access } from 'node:fs/promises';
import { chmodSync, watch } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import sharp from 'sharp';

// ffmpeg y ffprobe: los de npm (ffmpeg-static y @ffprobe-installer/ffprobe) si están instalados y, si no, los del PATH
const optional = (name) => {
  try {
    return createRequire(import.meta.url)(name);
  } catch {
    return undefined;
  }
};
const FFMPEG = optional('ffmpeg-static') ?? 'ffmpeg';
const FFPROBE = optional('@ffprobe-installer/ffprobe')?.path ?? 'ffprobe';
// su postinstall (chmod u+x) puede estar bloqueado por allowScripts: se hace aquí por si acaso
if (FFPROBE !== 'ffprobe') {
  try {
    chmodSync(FFPROBE, 0o755);
  } catch {}
}

const IMAGES_DIR = 'public/images';
const MANIFEST = 'scripts/media-manifest.json';
const BACKGROUND = '#fff5e9'; // color de fondo de la web: aplana la transparencia al pasar a JPG
const AVIF_QUALITY = 70;
const JPG_QUALITY = 82;

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : Number(args[i + 1]);
};
const inputs = args.filter((arg, i) => !arg.startsWith('--') && !args[i - 1]?.match(/^--(width|quality|poster)$/));

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const withExt = (file, ext) => file.slice(0, file.length - extname(file).length) + ext;
const posix = (path) => path.split('\\').join('/');
const exists = (path) => access(path).then(() => true, () => false);
const hasFfmpeg = () => spawnSync(FFMPEG, ['-version']).status === 0 && spawnSync(FFPROBE, ['-version']).status === 0;

// SVT-AV1 es mucho más rápido; algunas compilaciones de ffmpeg (p. ej. ffmpeg-static) solo traen libaom
function av1Encoder() {
  const encoders = spawnSync(FFMPEG, ['-hide_banner', '-encoders'], { encoding: 'utf8' }).stdout ?? '';
  if (encoders.includes('libsvtav1')) return ['-c:v', 'libsvtav1', '-preset', '6', '-crf', '36'];
  if (encoders.includes('libaom-av1')) return ['-c:v', 'libaom-av1', '-crf', '36', '-b:v', '0', '-cpu-used', '6', '-row-mt', '1'];
  throw new Error('este ffmpeg no tiene codificador AV1 (libsvtav1 ni libaom-av1)');
}
const sha = async (file) => createHash('sha1').update(await readFile(file)).digest('hex');

async function collect(path) {
  const info = await stat(path);
  if (!info.isDirectory()) return [path];
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => collect(join(path, entry.name))))).flat();
}

// ---- conversiones ----

async function toAvif(src, out, { width, quality = AVIF_QUALITY } = {}) {
  let img = sharp(src);
  if (width) img = img.resize({ width, withoutEnlargement: true });
  const info = await img.avif({ quality, effort: 6 }).toFile(out);
  console.log(`  ${out}  ${info.width}×${info.height}  ${kb(info.size)}`);
}

async function toJpg(src, out, { width } = {}) {
  let img = sharp(src).flatten({ background: BACKGROUND });
  if (width) img = img.resize({ width, withoutEnlargement: true });
  const info = await img.jpeg({ quality: JPG_QUALITY, mozjpeg: true }).toFile(out);
  console.log(`  ${out}  ${info.width}×${info.height}  ${kb(info.size)}`);
}

function encode(input, output, codec, { width } = {}) {
  const probe = spawnSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', input], { encoding: 'utf8' });
  const fps = probe.stdout.trim().split('\n')[0] || '25/1';
  // dimensiones pares (obligatorio en yuv420p) y, si se pide, ancho máximo sin ampliar
  const scale = width ? `scale='min(${width},iw)':-2` : 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
  const encoder = codec === 'av1'
    ? av1Encoder()
    : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '30'];
  const run = spawnSync(FFMPEG, ['-loglevel', 'error', '-y', '-i', input, '-r', fps, '-vf', `${scale},format=yuv420p`, ...encoder, '-an', '-movflags', '+faststart', output], { encoding: 'utf8' });
  if (run.status !== 0) throw new Error(run.stderr || 'ffmpeg falló (¿está instalado?)');
}

async function toVideo(src, out, codec, opts) {
  encode(src, out, codec, opts);
  console.log(`  ${out}  ${kb((await stat(out)).size)}`);
}

async function toPoster(video, out, at) {
  const duration = Number(spawnSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], { encoding: 'utf8' }).stdout) || 0;
  const second = at ?? Math.round(duration * 0.2 * 100) / 100;
  const run = spawnSync(FFMPEG, ['-loglevel', 'error', '-y', '-ss', String(second), '-i', video, '-frames:v', '1', '-q:v', '3', out], { encoding: 'utf8' });
  if (run.status !== 0) throw new Error(run.stderr || 'ffmpeg falló');
  console.log(`  ${out}  ${kb((await stat(out)).size)}`);
}

// ---- modo manual (originales en cualquier formato) ----

async function manual() {
  const opts = { width: value('width'), quality: value('quality') ?? AVIF_QUALITY };
  const files = (await Promise.all(inputs.map(collect))).flat();
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    const stem = withExt(file, '');
    if (['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff'].includes(ext)) {
      console.log(file);
      await toAvif(file, `${stem}.avif`, opts);
      if (flag('share') && !/^\.jpe?g$/.test(ext)) await toJpg(file, `${stem}.jpg`, opts);
    } else if (['.gif', '.mov', '.webm', '.mp4'].includes(ext)) {
      if (resolve(`${stem}.mp4`) === resolve(file)) {
        console.log(`${file}: el origen ya es .mp4; para completar los formatos usa el modo automático (sin rutas)`);
        continue;
      }
      console.log(file);
      await toVideo(file, `${stem}.mp4`, 'h264', opts);
      await toVideo(file, `${stem}.av1.mp4`, 'av1', opts);
      await toPoster(`${stem}.mp4`, `${stem}.jpg`, value('poster'));
    }
  }
}

// ---- modo automático: completar lo que falta en public/images ----

const readManifest = () => readFile(MANIFEST, 'utf8').then(JSON.parse, () => ({}));

async function runAuto() {
  const manifest = await readManifest();
  const ffmpegOk = hasFfmpeg();
  const force = flag('force');
  const files = (await collect(IMAGES_DIR)).filter((file) => /\.(avif|jpe?g|mp4)$/i.test(file));
  const present = new Set(files.map((file) => resolve(file)));
  const has = (path) => present.has(resolve(path));

  // agrupa por carpeta + nombre sin extensión (quitando .av1 de los vídeos AV1)
  const groups = new Map();
  for (const file of files) {
    const stem = file.replace(/\.av1\.mp4$/i, '').replace(/\.(avif|jpe?g|mp4)$/i, '');
    if (!groups.has(stem)) groups.set(stem, {});
    const group = groups.get(stem);
    if (/\.av1\.mp4$/i.test(file)) group.av1 = file;
    else if (/\.mp4$/i.test(file)) group.mp4 = file;
    else if (/\.avif$/i.test(file)) group.avif = file;
    else group.jpg = file;
  }

  let changed = false;
  let processed = 0;

  // genera `out` a partir de `src` si no existe, o si lo generamos nosotros y su origen ha cambiado
  const ensure = async (out, src, make, needsFfmpeg = false) => {
    const key = posix(relative(IMAGES_DIR, out));
    const hash = await sha(src);
    const mine = manifest[key]?.from === posix(relative(IMAGES_DIR, src));
    const missing = !has(out);
    if (!missing && !(mine && (manifest[key].hash !== hash || force))) return;
    if (needsFfmpeg && !ffmpegOk) {
      console.log(`${out}: se omite, falta ffmpeg en el PATH`);
      return;
    }
    console.log(`${src}`);
    try {
      await make();
      manifest[key] = { from: posix(relative(IMAGES_DIR, src)), hash };
      present.add(resolve(out));
      changed = true;
      processed++;
    } catch (error) {
      console.error(`  error: ${error.message}`);
    }
  };

  for (const [stem, group] of groups) {
    if (group.mp4 || group.av1) {
      // vídeo: completa el par H.264 / AV1 y el póster
      const h264 = `${stem}.mp4`;
      const av1 = `${stem}.av1.mp4`;
      if (group.mp4 && !group.av1) await ensure(av1, group.mp4, () => toVideo(group.mp4, av1, 'av1'), true);
      if (group.av1 && !group.mp4) await ensure(h264, group.av1, () => toVideo(group.av1, h264, 'h264'), true);
      const source = group.mp4 ?? group.av1;
      await ensure(`${stem}.jpg`, source, () => toPoster(source, `${stem}.jpg`), true);
    } else if (group.avif && !group.jpg) {
      await ensure(`${stem}.jpg`, group.avif, () => toJpg(group.avif, `${stem}.jpg`));
    } else if (group.jpg && !group.avif) {
      await ensure(`${stem}.avif`, group.jpg, () => toAvif(group.jpg, `${stem}.avif`));
    } else if (group.avif && group.jpg) {
      // par completo: si uno de los dos lo generamos nosotros y su origen cambió, se regenera
      await ensure(`${stem}.jpg`, group.avif, () => toJpg(group.avif, `${stem}.jpg`));
      await ensure(`${stem}.avif`, group.jpg, () => toAvif(group.jpg, `${stem}.avif`));
    }
  }

  if (changed) await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(processed ? `Listo: ${processed} archivo(s) generado(s).` : 'Todo al día.');
}

let running = false;
let again = false;
async function auto() {
  if (running) {
    again = true;
    return;
  }
  running = true;
  try {
    do {
      again = false;
      await runAuto();
    } while (again);
  } finally {
    running = false;
  }
}

if (inputs.length > 0) {
  await manual();
} else if (flag('watch')) {
  await auto();
  console.log(`Vigilando ${IMAGES_DIR}/ (Ctrl+C para salir)…`);
  let timer;
  watch(IMAGES_DIR, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(auto, 1500);
  });
} else {
  await auto();
}