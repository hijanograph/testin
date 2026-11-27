import { readdir } from 'node:fs/promises';
import { join, posix } from 'node:path';
import type { CollectionEntry } from 'astro:content';
import { imageSize, type ImageSize } from '../utils/image-size';

export type GalleryImage = { src: string; alt?: string } & Partial<ImageSize>;

const ROOT = 'images/projects';
// Si hay varios formatos de la misma foto (p. ej. .avif y .jpg) se usa el primero de esta lista.
const FORMATS = ['avif', 'webp', 'jpg', 'jpeg', 'png', 'gif'];
const IMAGE = new RegExp(`\\.(?:${FORMATS.join('|')})$`, 'i');
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const stem = (path: string) => path.replace(/\.[^.]+$/, '').toLowerCase();
const format = (path: string) => FORMATS.indexOf(path.split('.').pop()!.toLowerCase());

/**
 * Todas las fotos de un proyecto, en este orden: hero, imágenes de los bloques y el resto de fotos
 * numeradas (`<slug>-01.avif`, `<slug>-02.avif`…) que haya junto al hero, en `images/projects/<slug>/`
 * o en `images/projects/`. Una misma foto en varios formatos cuenta una sola vez. Los vídeos no entran.
 */
export async function getGallery(project: CollectionEntry<'portfolio'>): Promise<GalleryImage[]> {
  const { heroImg, heroAlt, blocks, title } = project.data;
  const slug = project.id;

  const listed: GalleryImage[] = [
    { src: heroImg ?? '', alt: heroAlt || title },
    ...blocks.map((block) => ({ src: block.image, alt: block.alt })),
  ].filter((image) => IMAGE.test(image.src));

  const dirs = [
    ...new Set([
      ...(heroImg ? [posix.dirname(heroImg)] : []),
      ...blocks.map((block) => posix.dirname(block.image)),
      `${ROOT}/${slug}`,
      ROOT,
    ]),
  ];
  const pattern = new RegExp(`^${escapeRegExp(slug)}-\\d+\\.(?:${FORMATS.join('|')})$`, 'i');
  const seen = new Set(listed.map(({ src }) => stem(src)));
  const extras = new Map<string, string>();

  for (const dir of dirs) {
    let files: string[] = [];
    try {
      files = await readdir(join(process.cwd(), 'public', dir));
    } catch {
      continue;
    }
    for (const file of files.filter((name) => pattern.test(name))) {
      const src = `${dir}/${file}`;
      const key = stem(src);
      if (seen.has(key)) continue;
      const current = extras.get(key);
      if (!current || format(src) < format(current)) extras.set(key, src);
    }
  }

  const sorted = [...extras.values()].sort((a, b) =>
    posix.basename(a).localeCompare(posix.basename(b), undefined, { numeric: true, sensitivity: 'base' }),
  );
  const all = [...listed, ...sorted.map((src) => ({ src, alt: undefined }))];

  return Promise.all(all.map(async (image) => ({ ...image, ...(await imageSize(image.src)) })));
}
