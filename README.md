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
│   ├── cv-rafael-hijano.pdf
│   ├── fonts/
│   │   ├── OverusedGrotesk-Regular.otf
│   │   ├── OverusedGrotesk-Italic.otf
│   │   ├── OverusedGrotesk-Medium.otf
│   │   └── OverusedGrotesk-MediumItalic.otf
│   └── images/
│       └── projects/
│           ├── arbocala-cover.jpg    (ratio 4:3 recomendado)
│           ├── arbocala-hero.jpg     (ratio 16:9)
│           ├── fiambre-cover.jpg
│           ├── fiambre-hero.jpg
│           ├── andaluce-cover.jpg
│           └── andaluce-hero.jpg
├── src/
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   └── ProjectLayout.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── sobre-mi.astro
│   │   ├── curriculum.astro
│   │   ├── 404.astro
│   │   └── portfolio/
│   │       ├── index.astro
│   │       ├── arbocala.astro
│   │       ├── fiambre.astro
│   │       └── andaluce.astro
│   └── styles/
│       └── global.css
├── .github/workflows/deploy.yml
├── .gitignore
└── astro.config.mjs
```

---

## Añadir imágenes reales

En cada página de proyecto busca el bloque comentado y sustituye el placeholder:

```astro
<!-- Antes (placeholder): -->
<div class="img-ph img-ph--wide"></div>

<!-- Después (imagen real): -->
<img src="/images/projects/arbocala-hero.jpg" alt="Bodegas Arbocala" />
```

En la home (`index.astro`) el bloque del hero:
```astro
<!-- Descomenta esto: -->
<img src="/images/hero.jpg" alt="Rafael Hijano trabajando" class="hero__img" />
<!-- Y borra esta línea: -->
<div class="img-ph img-ph--hero hero__img"></div>
```

---

## Deploy en GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

En GitHub: **Settings → Pages → Source → GitHub Actions**.

---

## Añadir un nuevo proyecto

1. Crea `src/pages/portfolio/nuevo-proyecto.astro` usando `ProjectLayout.astro`
2. Añade el proyecto al array en `src/pages/portfolio/index.astro`
3. Añade el proyecto al array en `src/pages/index.astro`

---

## Actualizar a Astro 5

### ¿Cuándo hacerlo?
Astro 5 es más rápido y es la versión con soporte activo a largo plazo.
Para este proyecto el esfuerzo de migración es mínimo — solo hay un cambio
de código necesario (ver paso 2).

### Pasos

**1. Actualiza el paquete**

En Codespaces o terminal local:
```bash
npm install astro@latest
```

**2. `astro.config.mjs` — sin cambios necesarios**

La opción `output: 'static'` ya fue eliminada de este archivo en la versión
actual del proyecto. Astro 5 usa output estático por defecto, así que el
archivo ya es compatible:

```js
// ✅ Correcto — compatible con Astro 4 y 5
export default defineConfig({
  site: 'https://rafaelhijano.work',
  base: '/',
});
```

**3. Comprueba que el build funciona**

```bash
npm run build
```

Si aparece algún error, lo más probable es que sea en un componente concreto.
Los errores de Astro 5 son descriptivos e indican exactamente el archivo y línea.

**4. Haz commit y push**

```bash
git add package.json package-lock.json
git commit -m "Upgrade to Astro 5"
git push
```

El deploy se lanzará automáticamente.

### Cambios de Astro 4 → 5 que NO afectan a este proyecto

Estos son los breaking changes principales de Astro 5 documentados oficialmente.
Ninguno aplica a este portfolio, pero se listan por si en el futuro se amplía:

| Cambio | ¿Afecta? | Detalle |
|--------|----------|---------|
| `output: 'static'` eliminado | ✅ Ya corregido | Era el único cambio necesario |
| Content Collections v2 | ❌ No usadas | Nueva API para colecciones de contenido |
| `Astro.glob()` eliminado | ❌ No usado | Reemplazado por `import.meta.glob()` |
| `getStaticPaths` changes | ❌ No usado | Solo afecta a rutas dinámicas |
| Server islands | ❌ No usado | Feature nueva, sin impacto |
| Node.js mínimo 18.17.1 | ❌ GitHub Actions ya usa Node 20 | Sin impacto |

### Si el build falla tras actualizar

```bash
# Borra caché y node_modules, reinstala limpio
rm -rf node_modules .astro
npm install
npm run build
```

Si el error persiste, compártelo y se puede diagnosticar.
