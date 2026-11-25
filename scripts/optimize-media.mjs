#!/usr/bin/env node
// Optimiza imágenes y animaciones para la web.
//
//   node scripts/optimize-media.mjs <archivo|carpeta>... [--width N] [--quality N] [--share]
//
// Imágenes (png, jpg, webp, tif):  →  <nombre>.avif   (con --share, además <nombre>.jpg para og:image)
// Animaciones (gif, mov, webm, mp4): →  <nombre>.mp4 (H.264, compatible con todo)
//                                       <nombre>.av1.mp4 (AV1, ~30-50 % más ligero)
//                                       <nombre>.jpg (póster = primer fotograma, también sirve de og:image)
//
// --width N     reduce (nunca amplía) el resultado a N píxeles de ancho
// --quality N   calidad AVIF 1-100 (70 por defecto; 80 para fotos con grano)
// --poster N    segundo del que se extrae el póster (por defecto, el 20 % de la duración; el primer
//               fotograma de muchas animaciones está en negro o vacío)
// --share       genera también el JPG para compartir en redes
//
// Requiere ffmpeg en el PATH solo para las animaciones. Los originales no se tocan.
import { readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff']);
const MOTION = new Set(['.gif', '.mov', '.webm', '.mp4']);
const BACKGROUND = '#fff5e9'; // color de fondo de la web: aplana la transparencia en los JPG

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : Number(args[i + 1]);
};
const inputs = args.filter((arg, i) => !arg.startsWith('--') && !args[i - 1]?.match(/^--(width|quality|poster)$/));
const width = value('width');
const quality = value('quality') ?? 70;
const posterAt = value('poster');

async function collect(path) {
  const info = await stat(path);
  if (!info.isDirectory()) return [path];
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => collect(join(path, entry.name))));
  return nested.flat();
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const withExt = (file, ext) => file.slice(0, file.length - extname(file).length) + ext;

async function image(file) {
  const resize = (img) => (width ? img.resize({ width, withoutEnlargement: true }) : img);
  const avif = withExt(file, '.avif');
  const info = await resize(sharp(file)).avif({ quality, effort: 6 }).toFile(avif);
  console.log(`  ${avif}  ${info.width}×${info.height}  ${kb(info.size)}`);

  if (flag('share') && !/\.jpe?g$/i.test(file)) {
    const jpg = withExt(file, '.jpg');
    const out = await resize(sharp(file)).flatten({ background: BACKGROUND }).jpeg({ quality: 82, mozjpeg: true }).toFile(jpg);
    console.log(`  ${jpg}  ${out.width}×${out.height}  ${kb(out.size)}`);
  }
}

function ffmpeg(input, output, codec) {
  // el tramado de los GIF es ruido que el vídeo intentaría conservar: se suaviza solo para H.264
  const denoise = codec === 'h264' && extname(input).toLowerCase() === '.gif' ? 'hqdn3d=3:3:6:6,' : '';
  const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', input], { encoding: 'utf8' });
  const fps = probe.stdout.trim().split('\n')[0] || '25/1';
  // dimensiones pares (obligatorio en yuv420p) y, si se pide, ancho máximo sin ampliar
  const scale = width ? `scale='min(${width},iw)':-2` : 'scale=trunc(iw/2)*2:trunc(ih/2)*2';
  const encoder = codec === 'av1'
    ? ['-c:v', 'libsvtav1', '-preset', '6', '-crf', '36']
    : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '30'];
  const run = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', input, '-r', fps, '-vf', `${denoise}${scale},format=yuv420p`, ...encoder, '-an', '-movflags', '+faststart', output], { encoding: 'utf8' });
  if (run.status !== 0) throw new Error(run.stderr || 'ffmpeg falló (¿está instalado?)');
}

async function motion(file) {
  const h264 = withExt(file, '.mp4');
  if (resolve(h264) === resolve(file)) {
    console.log(`  ${file}: el origen ya es .mp4 y se sobrescribiría; cámbiale el nombre (p. ej. nombre-original.mp4)`);
    return;
  }
  const av1 = withExt(file, '.av1.mp4');
  const poster = withExt(file, '.jpg');
  ffmpeg(file, h264, 'h264');
  ffmpeg(file, av1, 'av1');
  const duration = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', h264], { encoding: 'utf8' }).stdout) || 0;
  const at = posterAt ?? Math.round(duration * 0.2 * 100) / 100;
  const frame = spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', String(at), '-i', h264, '-frames:v', '1', '-q:v', '3', poster], { encoding: 'utf8' });
  if (frame.status !== 0) throw new Error(frame.stderr);
  for (const out of [h264, av1, poster]) console.log(`  ${out}  ${kb((await stat(out)).size)}`);
}

if (inputs.length === 0) {
  console.error('Uso: node scripts/optimize-media.mjs <archivo|carpeta>... [--width N] [--quality N] [--share]');
  process.exit(1);
}

const files = (await Promise.all(inputs.map(collect))).flat();
for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (!RASTER.has(ext) && !MOTION.has(ext)) continue;
  console.log(file);
  await (RASTER.has(ext) ? image(file) : motion(file));
}
