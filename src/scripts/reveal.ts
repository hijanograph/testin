import { prefersReducedMotion } from './motion';

const TARGETS = [
  '.section__title', '.section__head', '.split', '.project-card', '.project-block', '.project-wip',
  '.project-prose', '.banner', '.section__media', '.cv__col', '.cv__img', '.facts__item',
  '.big-email', '.link-list', '.contact__methods', '.project-nav', '.footer__grid',
].join(', ');

let stop: (() => void) | undefined;

const init = () => {
  stop?.();
  if (prefersReducedMotion()) return;

  const items = [...document.querySelectorAll<HTMLElement>(TARGETS)].filter(
    (element) => element.getBoundingClientRect().top > innerHeight,
  );
  if (!items.length) return;

  items.forEach((element) => element.classList.add('reveal'));

  const progress = new WeakMap<HTMLElement, number>();
  let frame = 0;

  const update = () => {
    frame = 0;
    const range = innerHeight * 0.3;
    const rowCount = new Map<number, number>();
    let pending = 0;

    items.forEach((element) => {
      if (!element.classList.contains('reveal') || element.classList.contains('is-revealed')) return;

      const top = element.getBoundingClientRect().top;
      const row = Math.round(top / 8);
      const position = rowCount.get(row) ?? 0;
      rowCount.set(row, position + 1);

      const linear = Math.min(1, Math.max(0, (innerHeight - top - position * 36) / range));
      const eased = 1 - Math.pow(1 - linear, 3);
      const value = Math.max(progress.get(element) ?? 0, eased);
      progress.set(element, value);

      if (value >= 1) {
        element.classList.add('is-revealed');
        element.style.removeProperty('--reveal');
      } else {
        element.style.setProperty('--reveal', value.toFixed(3));
        pending++;
      }
    });

    if (!pending) stop?.();
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  stop = () => {
    removeEventListener('scroll', schedule);
    removeEventListener('resize', schedule);
    cancelAnimationFrame(frame);
    stop = undefined;
  };

  update();
};

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => stop?.());