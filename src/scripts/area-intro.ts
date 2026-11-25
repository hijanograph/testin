// Textos de la introducción (y, si los hay, apartados con data-areas) según la categoría de la URL (#slug).
// Los textos salen de <script type="application/json" id="intro-variants">; sin hash o con uno
// desconocido se usa la variante "default".
const applyAreaIntro = () => {
  const intro = document.querySelector<HTMLElement>('.page-intro');
  const data = document.getElementById('intro-variants');
  if (!intro || !data) return;

  const variants = JSON.parse(data.textContent ?? '{}');
  const area = location.hash.slice(1);
  const { title, lead, body } = variants[area] ?? variants.default;
  intro.querySelector('.page-title')!.textContent = title;
  intro.querySelector('.t-lead')!.textContent = lead;
  intro.querySelector('.t-body')!.textContent = body;

  // Apartados con data-areas: solo el de la categoría; si ninguno coincide, todos.
  const rows = [...document.querySelectorAll<HTMLElement>('[data-areas]:not(.hero-carousel__slide)')];
  const belongs = (row: HTMLElement) => row.dataset.areas?.split(' ').includes(area);
  const matches = rows.some(belongs);
  rows.forEach((row) => (row.hidden = matches && !belongs(row)));
};

document.addEventListener('astro:page-load', applyAreaIntro);
window.addEventListener('hashchange', applyAreaIntro);
