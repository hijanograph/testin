import { defineConfig } from 'astro/config';
import astroBookshop from '@bookshop/astro-bookshop';

export default defineConfig({
  site: 'https://rafaelhijano.work',
  integrations: [astroBookshop()]
});
