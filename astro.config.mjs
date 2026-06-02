import { defineConfig } from 'astro/config';
import cloudcannon from '@cloudcannon/astro';

export default defineConfig({
  site: 'https://rafaelhijano.work',
  integrations: [
    cloudcannon(),
  ],
});
