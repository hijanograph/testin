import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rafaelhijano.work',
  integrations: [
    // Las páginas privadas (noindex) no deben aparecer en el sitemap.
    sitemap({ filter: (page) => !/\/(servicios|mecontratas)\/?$/.test(page) }),
  ],
});
