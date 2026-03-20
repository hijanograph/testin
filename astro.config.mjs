import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rafaelhijano.work',
  base: '/',
  // output: 'static' eliminado — es el valor por defecto en Astro 4
  // y fue eliminado como opción en Astro 5 (causaría error de build)
});
