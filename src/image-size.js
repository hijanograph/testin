import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const cache = new Map();

export function imageSize(path) {
  if (!path) return Promise.resolve(undefined);

  const file = path.replace(/^\/+/, '');

  if (!cache.has(file)) {
    cache.set(
      file,
      readFile(join(process.cwd(), 'public', file))
        .then((buffer) => sharp(buffer, { animated: true }).metadata())
        .then(({ width, height, pageHeight }) => {
          const h = pageHeight ?? height;
          return width && h ? { width, height: h } : undefined;
        })
        .catch(() => undefined)
    );
  }

  return  (cache.get(file));
}
