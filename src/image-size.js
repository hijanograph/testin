import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

/** @typedef {{ width: number, height: number }} ImageSize */

/** @type {Map<string, Promise<ImageSize | undefined>>} */
const cache = new Map();

/**
 * Dimensiones de una imagen de `public/` (ruta relativa, p. ej. "images/projects/x.png").
 * Devuelve `undefined` si el archivo no existe todavía.
 * @param {string} [path]
 * @returns {Promise<ImageSize | undefined>}
 */
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

  return /** @type {Promise<ImageSize | undefined>} */ (cache.get(file));
}
