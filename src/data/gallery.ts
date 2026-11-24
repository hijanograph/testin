import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { imageSize, type ImageSize } from '../utils/image-size';

export type GalleryImage = { src: string } & Partial<ImageSize>;

const DIR = 'images/projects';
const EXT = '(?:png|jpe?g|webp|gif|avif)';
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fileName = (path: string) => path.split('/').pop()!.toLowerCase();

export async function getGallery(slug: string, used: (string | undefined)[] = []): Promise<GalleryImage[]> {
  const taken = new Set(used.filter(Boolean).map((path) => fileName(path!)));
  const pattern = new RegExp(`^${escapeRegExp(slug)}-\\d+\\.${EXT}$`, 'i');

  try {
    const files = await readdir(join(process.cwd(), 'public', DIR));
    const sources = files
      .filter((file) => pattern.test(file) && !taken.has(file.toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((file) => `${DIR}/${file}`);

    return Promise.all(sources.map(async (src) => ({ src, ...(await imageSize(src)) })));
  } catch {
    return [];
  }
}
