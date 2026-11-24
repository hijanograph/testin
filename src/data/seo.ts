import type { CollectionEntry } from 'astro:content';
import { name, email, socials, profileImage, withBase } from '../site';

export type JsonLdNode = Record<string, unknown>;

const isGif = (path: string) => /\.gif$/i.test(path);

export const shareImagePath = (image: string) => (isGif(image) ? profileImage : image);

export function siteGraph(site: URL, extra: JsonLdNode[] = []): JsonLdNode[] {
  const siteUrl = site.href;

  return [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}#web`,
      url: siteUrl,
      name: `${name} — Diseñador gráfico y visual`,
      inLanguage: 'es-ES',
      publisher: { '@id': `${siteUrl}#persona` },
    },
    {
      '@type': 'Person',
      '@id': `${siteUrl}#persona`,
      name,
      url: siteUrl,
      email,
      image: new URL(withBase(profileImage), site).href,
      jobTitle: 'Diseñador gráfico y visual',
      description:
        'Diseñador gráfico y visual en Málaga, disponible también en remoto. Especializado en branding, identidad visual, diseño editorial y motion graphics.',
      address: { '@type': 'PostalAddress', addressLocality: 'Málaga', addressRegion: 'Andalucía', addressCountry: 'ES' },
      knowsAbout: ['Branding', 'Identidad visual', 'Diseño gráfico', 'Diseño editorial', 'Packaging', 'Motion graphics', 'UX/UI'],
      alumniOf: [
        { '@type': 'CollegeOrUniversity', name: 'Universidad de Málaga' },
        { '@type': 'EducationalOrganization', name: 'La X Gauss' },
      ],
      sameAs: socials.map((social) => social.href),
    },
    ...extra,
  ];
}

export function projectSchema(project: CollectionEntry<'portfolio'>, site: URL | undefined, pathname: string): JsonLdNode[] {
  if (!site) return [];

  const { title, desc, year, heroImg, coverImg } = project.data;
  const siteUrl = site.href;
  const pageUrl = new URL(pathname, site).href;
  const image = heroImg ?? coverImg;

  return [
    {
      '@type': 'CreativeWork',
      '@id': `${pageUrl}#proyecto`,
      name: title,
      description: desc,
      url: pageUrl,
      inLanguage: 'es-ES',
      creator: { '@id': `${siteUrl}#persona` },
      ...(year ? { dateCreated: year } : {}),
      ...(image && !isGif(image) ? { image: new URL(withBase(image), site).href } : {}),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Proyectos', item: new URL(withBase('proyectos'), site).href },
        { '@type': 'ListItem', position: 3, name: title, item: pageUrl },
      ],
    },
  ];
}
