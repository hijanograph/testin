# Rafael Hijano — Portfolio

Portfolio personal construido con **Astro 4** (output estático) y desplegado en **GitHub Pages**.
Tipografía: **Overused Grotesk** (fuente local, archivos OTF propios).

---

## Instalación y desarrollo local

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera /dist
npm run preview  # preview del build
```

---

## Estructura

```
portfolio/
├── public/
│   ├── favicon.svg
│   ├── cv-rafael-hijano.pdf          ← AÑADE TU CV AQUÍ
│   ├── fonts/                        ← AÑADE LOS OTF DE OVERUSED GROTESK AQUÍ
│   │   ├── OverusedGrotesk-Book.otf
│   │   ├── OverusedGrotesk-Medium.otf
│   │   ├── OverusedGrotesk-Bold.otf
│   │   ├── OverusedGrotesk-Black.otf
│   │   └── ... (Light, SemiBold, ExtraBold, BookItalic, MediumItalic)
│   └── images/
│       └── projects/                 ← AÑADE TUS IMÁGENES AQUÍ
│           ├── arbocala-cover.jpg    (ratio 4:3 recomendado)
│           ├── arbocala-hero.jpg     (ratio 16:9 o wider)
│           ├── fiambre-cover.jpg
│           ├── fiambre-hero.jpg
│           ├── andaluce-cover.jpg
│           └── andaluce-hero.jpg
├── src/
│   ├── components/
│   │   ├── Nav.astro           — Barra de navegación (desktop + overlay móvil)
│   │   ├── Footer.astro        — Footer 3 columnas
│   │   └── ProjectLayout.astro — Layout compartido páginas de proyecto
│   ├── layouts/
│   │   └── Layout.astro        — HTML base
│   ├── pages/
│   │   ├── index.astro          — Inicio
│   │   ├── sobre-mi.astro       — Sobre mí
│   │   ├── curriculum.astro     — Currículum
│   │   ├── 404.astro
│   │   └── portfolio/
│   │       ├── index.astro      — Portfolio (grid)
│   │       ├── arbocala.astro
│   │       ├── fiambre.astro
│   │       └── andaluce.astro
│   └── styles/
│       └── global.css           — Tokens, reset, tipografía, helpers
├── .github/workflows/deploy.yml — Deploy automático en push a main
└── astro.config.mjs
```

---

## Pasos antes de subir a GitHub

### 1. Imágenes de proyectos
Añade tus imágenes en `public/images/projects/`. Luego en cada página de proyecto
(p.ej. `arbocala.astro`) busca el bloque comentado y sustituye el placeholder:

```astro
<!-- Antes (placeholder): -->
<div class="img-ph img-ph--wide"></div>

<!-- Después (imagen real): -->
<img src="/images/projects/arbocala-proceso.jpg" alt="Proceso Arbocala" />
```

En la **home** (`index.astro`) el hero también tiene un bloque comentado:
```astro
<!-- <img src="/images/hero.jpg" alt="Rafael Hijano trabajando" class="hero__img" /> -->
<div class="img-ph img-ph--hero hero__img"></div>  ← borrar esta línea
```

---

## Deploy en GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main

---

## Añadir un nuevo proyecto de portfolio

1. Crea `src/pages/portfolio/nuevo-proyecto.astro` usando `ProjectLayout.astro`
2. Añade una entrada al array `projects` en `src/pages/portfolio/index.astro`
3. Añade la misma entrada en `src/pages/index.astro`
