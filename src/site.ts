const raw = import.meta.env.BASE_URL;
export const base = raw.endsWith('/') ? raw : `${raw}/`;
export const withBase = (path = '') => `${base}${path.replace(/^\/+/, '')}`;

export const email = 'hey@rafaelhijano.work';

export const social = {
  linkedin: 'https://linkedin.com/in/rafaelhijano',
  behance: 'https://behance.net/rafaelhijano',
  instagram: 'https://www.instagram.com/rafaelhijano.work',
};

// Los PDF viven en Google Drive; solo hace falta el id.
const drive = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;
export const cvUrl = drive('16K_kHrIxXQuXzdytIGrX46_dsheItNwA');
export const portfolioUrl = drive('1p5WQXuLPW-kFGgMLAzbrCEaSUpG7zqYD');

// Páginas internas: las usan Nav, Footer y 404.
export const pages = [
  { label: 'Inicio', href: withBase() },
  { label: 'Proyectos', href: withBase('proyectos') },
  { label: 'Sobre mí', href: withBase('sobre-mi') },
  { label: 'Contacto', href: withBase('contacto') },
];
