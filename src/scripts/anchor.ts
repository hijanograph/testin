// Al llegar a una página con ancla (/proyectos/arbocala#soneto) se salta directamente a ella. Con
// `scroll-behavior: smooth` el navegador recorría toda la página animando el scroll y, si algo cambiaba por el camino,
// se quedaba a medias. Además se reajusta un momento mientras termina de cargar el contenido.

document.addEventListener('astro:before-swap', (event) => {
  const { to, newDocument } = event as unknown as { to: URL; newDocument: Document };
  // el salto al ancla lo hace el navegador justo después del cambio de página: tiene que ser instantáneo
  if (to.hash) newDocument.documentElement.style.scrollBehavior = 'auto';
});

const settle = (target: HTMLElement) => {
  const root = document.documentElement;
  root.style.scrollBehavior = 'auto';
  const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;

  let cancelled = false;
  const cancel = () => (cancelled = true);
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((type) =>
    addEventListener(type, cancel, { once: true, passive: true }),
  );

  const end = performance.now() + 1500;
  const step = () => {
    if (cancelled || performance.now() > end) {
      root.style.removeProperty('scroll-behavior');
      return;
    }
    if (Math.abs(target.getBoundingClientRect().top - offset) > 1) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    requestAnimationFrame(step);
  };
  step();
};

document.addEventListener('astro:page-load', () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (target) settle(target);
  else document.documentElement.style.removeProperty('scroll-behavior');
});
