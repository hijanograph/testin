import { astroBookshop } from '@cloudcannon/astro-bookshop';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rafaelhijano.work',
  integrations: [astroBookshop()]
});
