import { defineConfig } from 'astro/config';
import cloudcannon from '@cloudcannon/astro-connector';

export default defineConfig({
  site: 'https://rafaelhijano.work',
  integrations: [
    cloudcannon(),
  ],
});
