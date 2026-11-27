import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from '../site';

type Project = CollectionEntry<'portfolio'>;

const featuredPosition = (p: Project) =>
  typeof p.data.featured === 'number' ? p.data.featured : Number.POSITIVE_INFINITY;

const byOrder = (a: Project, b: Project) => a.data.order - b.data.order;

async function validateParents() {
  const all = await getCollection('portfolio');
  const ids = new Map(all.map((p) => [p.id, p]));

  all.forEach((p) => {
    const { parent } = p.data;
    if (!parent) return;
    if (!ids.has(parent)) throw new Error(`El subproyecto "${p.id}" apunta a un "parent" que no existe: "${parent}".`);
    if (ids.get(parent)!.data.parent) throw new Error(`"${p.id}": un subproyecto no puede colgar de otro subproyecto ("${parent}").`);
  });

  return all;
}

// Proyectos visibles (los hidden no se publican). Incluye los subproyectos, que se listan con su propia cover.
export async function getProjects({ featured = false } = {}) {
  await validateParents();
  const projects = await getCollection('portfolio', (p) => !p.data.hidden && (!featured || !!p.data.featured));
  const visible = new Set((await getCollection('portfolio', (p) => !p.data.hidden)).map((p) => p.id));
  const listed = projects.filter((p) => !p.data.parent || visible.has(p.data.parent));

  return listed.sort((a, b) =>
    featured ? featuredPosition(a) - featuredPosition(b) || byOrder(a, b) : byOrder(a, b)
  );
}

// Proyectos que tienen su propia página (los subproyectos viven dentro de la de su parent).
export async function getProjectPages() {
  return (await getProjects()).filter((p) => !p.data.parent);
}

export async function getSubprojects(parentId: string) {
  return (await getProjects()).filter((p) => p.data.parent === parentId);
}

export const isSubproject = (p: Project) => !!p.data.parent;

export const projectHref = (p: Project) =>
  p.data.parent ? withBase(`proyectos/${p.data.parent}#${p.id}`) : withBase(`proyectos/${p.id}`);

export type Area = { slug: string; label: string };

const slugify = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function getAreas(project: Project): Area[] {
  return project.data.area
    .split(/\s+[—–-]\s+|\s*[,;|]\s*/)
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => ({ slug: slugify(label), label }));
}

export function getAllAreas(projects: Project[]): Area[] {
  const areas = new Map<string, Area>();
  projects.flatMap(getAreas).forEach((area) => areas.has(area.slug) || areas.set(area.slug, area));
  return [...areas.values()];
}
