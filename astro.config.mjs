import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import { loadEnv } from 'vite';

// Carga las variables de entorno necesarias
const env = loadEnv(import.meta.env.MODE, process.cwd(), '');

export default defineConfig({
  site: 'https://rafaelhijano.work',
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_DELIVERY_API_TOKEN,
      apiOptions: {
        region: 'eu',
      },
      components: {
        // ── Content types (root, un story por cada uno) ──────────────
        portfolio_project: 'storyblok/PortfolioProject', // arbocala, fiambre, andaluce
        site_config:       'storyblok/SiteConfig',       // reemplaza content/config/site.md

        // ── Bloques anidables dentro de site_config ───────────────────
        experience_item: 'storyblok/ExperienceItem', // Batterylight, Freepik, Ertheo
        task_item:       'storyblok/TaskItem',        // cada bullet dentro de una experiencia
        education_item:  'storyblok/EducationItem',   // La Gauss, GADE, UMA
        bio_paragraph:    'storyblok/BioParagraph',    // los 5 párrafos de "Sobre mí"
        skill_chip:       'storyblok/SkillChip',       // Illustrator, Figma, etc.
        nav_link:         'storyblok/NavLink',         // Inicio, Sobre mí, Currículum, Portfolio
        social_link:      'storyblok/SocialLink',      // LinkedIn, Behance
      },
    }),
  ],
  output: 'server',
});
