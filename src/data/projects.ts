import { getCollection, type CollectionEntry } from 'astro:content';

export async function getProjects({ featured = false } = {}) {
  const projects = await getCollection('portfolio', (p) => !featured || p.data.featured);
  return projects.sort((a, b) => a.data.order - b.data.order);
}

export type Area = { slug: string; label: string };

const slugify = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function getAreas(project: CollectionEntry<'portfolio'>): Area[] {
  return project.data.area
    .split(/\s+[—–-]\s+|\s*[,;|]\s*/)
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => ({ slug: slugify(label), label }));
}

export function getAllAreas(projects: CollectionEntry<'portfolio'>[]): Area[] {
  const areas = new Map<string, Area>();
  projects.flatMap(getAreas).forEach((area) => areas.has(area.slug) || areas.set(area.slug, area));
  return [...areas.values()];
}
