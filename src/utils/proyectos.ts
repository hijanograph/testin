import { getCollection, type CollectionEntry } from 'astro:content';

export type Proyecto = CollectionEntry<'proyectos'>;

export const getProyectos = async (): Promise<Proyecto[]> =>
  (await getCollection('proyectos')).sort((a, b) => a.data.order - b.data.order);

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
