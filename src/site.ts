const rawBase = import.meta.env.BASE_URL;
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
export const withBase = (path = '') => `${base}${path.replace(/^\/+/, '')}`;

export const externalLinkProps = { target: '_blank', rel: 'noopener noreferrer' } as const;

export type Link = { label: string; href: string };

export const name = 'Rafael Hijano';
export const email = 'hey@rafaelhijano.work';
export const profileImage = 'images/index/hero-profile.jpg';
export const homeImage = 'images/index/hero-profile.avif';
export const defaultDescription =
  'Rafael Hijano, diseñador gráfico y visual en Málaga y en remoto. Branding, diseño visual, diseño editorial y motion graphics.';

export const socials: Link[] = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/rafaelhijano' },
  { label: 'Behance', href: 'https://behance.net/rafaelhijano' },
  { label: 'Instagram', href: 'https://www.instagram.com/rafaelhijano.work' },
];

export const pickSocials = (...labels: string[]) =>
  labels.map((label) => socials.find((social) => social.label === label)!);

export const professionalSocials = pickSocials('LinkedIn', 'Behance');

const drive = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;
export const cvUrl = drive('16K_kHrIxXQuXzdytIGrX46_dsheItNwA');

export const cvDownload: Link = { label: 'Currículum en PDF', href: cvUrl };
export const portfolioDownload: Link = {
  label: 'Portfolio en PDF',
  href: drive('1p5WQXuLPW-kFGgMLAzbrCEaSUpG7zqYD'),
};
export const downloads = [cvDownload, portfolioDownload];

export const pages: Link[] = [
  { label: 'Inicio', href: withBase() },
  { label: 'Proyectos', href: withBase('proyectos') },
  { label: 'Sobre mí', href: withBase('sobre-mi') },
  { label: 'Contacto', href: withBase('contacto') },
];
