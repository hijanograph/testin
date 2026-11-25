import { prefersReducedMotion } from './motion';

const AUTOPLAY_MS = 5000;
const pad2 = (n: number) => String(n).padStart(2, '0');

export function initHeroCarousel() {
  const hero = document.querySelector<HTMLElement>('.hero-carousel');
  if (!hero) return;

  const track = hero.querySelector<HTMLElement>('.hero-carousel__track')!;
  const slides = [...hero.querySelectorAll<HTMLElement>('.hero-carousel__slide')];
  const count = hero.querySelector<HTMLElement>('.hero-carousel__count')!;
  const current = hero.querySelector<HTMLElement>('.hero-carousel__current')!;
  const total = hero.querySelector<HTMLElement>('.hero-carousel__total')!;
  const reducedMotion = prefersReducedMotion();

  let timer: number | undefined;
  const visible = () => slides.filter((slide) => !slide.hidden);
  const index = () => Math.round(track.scrollLeft / track.clientWidth) || 0;

  const stop = () => window.clearInterval(timer);
  const start = () => {
    stop();
    if (reducedMotion || visible().length < 2) return;
    timer = window.setInterval(() => {
      const next = (index() + 1) % visible().length;
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
    }, AUTOPLAY_MS);
  };

  const update = () => {
    const shown = visible().length;
    count.hidden = shown < 2;
    total.textContent = pad2(shown);
    current.textContent = pad2(Math.min(index() + 1, shown));
  };

  // Sin hash: carrusel con todos los proyectos. Con #categoria: solo el primer proyecto de esa categoría.
  const applyHash = () => {
    const area = location.hash.slice(1);
    const match = slides.find((slide) => slide.dataset.areas?.split(' ').includes(area));
    slides.forEach((slide) => (slide.hidden = !!match && slide !== match));
    track.scrollTo({ left: 0 });
    update();
    start();
  };

  track.addEventListener('scroll', update, { passive: true });
  for (const type of ['pointerenter', 'focusin', 'touchstart']) hero.addEventListener(type, stop, { passive: true });
  for (const type of ['pointerleave', 'focusout', 'touchend']) hero.addEventListener(type, start, { passive: true });

  applyHash();
  window.addEventListener('hashchange', applyHash);
  document.addEventListener(
    'astro:before-swap',
    () => {
      stop();
      window.removeEventListener('hashchange', applyHash);
    },
    { once: true },
  );
}
