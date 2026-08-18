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
    }),
  ],
  output: 'server',
});
