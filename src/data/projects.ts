import { getCollection, type CollectionEntry } from 'astro:content';

/** Proyectos ordenados por `order`. Con `featured` solo los que aparecen en la home. */
export async function getProjects({ featured = false } = {}) {
  const projects = await getCollection('portfolio', (p) => !featured || p.data.featured);
  return projects.sort((a, b) => a.data.order - b.data.order);
}

export type Area = { slug: string; label: string };

// "Motion Graphics" → "motion-graphics"; "UX/UI" → "ux-ui" (sin tildes ni mayúsculas)
const slugify = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Áreas de un proyecto, a partir de su campo `area` ("Branding — Editorial — UX/UI"). */
export function getAreas(project: CollectionEntry<'portfolio'>): Area[] {
  return project.data.area
    .split('—')
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => ({ slug: slugify(label), label }));
}

/** Áreas únicas de todos los proyectos, en orden de aparición (para los botones del filtro). */
export function getAllAreas(projects: CollectionEntry<'portfolio'>[]): Area[] {
  const areas = new Map<string, Area>();
  projects.flatMap(getAreas).forEach((area) => areas.has(area.slug) || areas.set(area.slug, area));
  return [...areas.values()];
}
