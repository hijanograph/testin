import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = 'images/projects';
const EXT = '(?:png|jpe?g|webp|gif|avif)';
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const baseName = (path: string) => path.split('/').pop()!.toLowerCase();

/**
 * Imágenes extra de un proyecto: public/images/projects/<slug>-NN.<ext>
 * que no se usen ya en el hero, la portada o los bloques. Orden alfabético
 * (numérico, así que -10 va después de -9). Si no hay ninguna, devuelve [].
 */
export async function getGallery(slug: string, used: (string | undefined)[] = []): Promise<string[]> {
  const taken = new Set(used.filter(Boolean).map((p) => baseName(p!)));
  const pattern = new RegExp(`^${escapeRe(slug)}-\\d+\\.${EXT}$`, 'i');

  try {
    const files = await readdir(join(process.cwd(), 'public', DIR));
    return files
      .filter((f) => pattern.test(f) && !taken.has(f.toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((f) => `${DIR}/${f}`);
  } catch {
    return [];
  }
}
