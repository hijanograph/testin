import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

export type ImageSize = { width: number; height: number };

const cache = new Map<string, Promise<ImageSize | undefined>>();

const readSize = async (file: string): Promise<ImageSize | undefined> => {
  try {
    const buffer = await readFile(join(process.cwd(), 'public', file));
    const { width, height, pageHeight } = await sharp(buffer, { animated: true }).metadata();
    const frameHeight = pageHeight ?? height;
    return width && frameHeight ? { width, height: frameHeight } : undefined;
  } catch {
    return undefined;
  }
};

export function imageSize(path?: string): Promise<ImageSize | undefined> {
  if (!path) return Promise.resolve(undefined);

  const file = path.replace(/^\/+/, '');
  if (!cache.has(file)) cache.set(file, readSize(file));
  return cache.get(file)!;
}
