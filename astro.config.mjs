import { defineConfig } from 'astro/config';

export default defineConfig({
  // Cambia esto por tu usuario y nombre de repo de GitHub:
  // Si el repo se llama "rafael-hijano" → site: 'https://tuusuario.github.io', base: '/'
  // Si el repo se llama "portfolio" → site: 'https://tuusuario.github.io', base: '/portfolio'
  site: 'https://rafaelhijano.work',
  base: '/',
  output: 'static',
});
