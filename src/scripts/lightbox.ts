import { cancelAnimations, prefersReducedMotion } from './motion';

const SWIPE = 50;
const SHIFT = 48;

export function initLightbox() {
  const dialog = document.querySelector<HTMLDialogElement>('.lightbox');
  if (!dialog) return;

  const items = [...document.querySelectorAll<HTMLElement>('[data-lightbox-item]')];
  if (!items.length) return;

  const stage = dialog.querySelector<HTMLElement>('[data-lightbox-stage]')!;
  const current = dialog.querySelector<HTMLElement>('[data-lightbox-current]')!;
  const total = items.length;
  let index = 0;
  let run = 0;
  let closing = false;

  dialog.querySelector<HTMLElement>('[data-lightbox-total]')!.textContent = String(total);
  dialog.classList.toggle('lightbox--single', total === 1);

  const tokens = getComputedStyle(document.documentElement);
  const token = (name: string) => tokens.getPropertyValue(name).trim();
  const duration = (name: string) => {
    const value = token(name);
    return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
  };
  const easing = { out: token('--ease'), in: token('--ease-in') };

  const source = (i: number) => items[(i + total) % total].querySelector<HTMLImageElement>('img')!;
  const layers = () => [...stage.querySelectorAll<HTMLImageElement>('.lightbox__img')];

  const place = (target: HTMLImageElement, i: number) => {
    const { currentSrc, src, alt } = source(i);
    target.src = currentSrc || src;
    target.alt = alt;
  };

  // Pasa a la foto `i`. Con `dir` (1 siguiente, -1 anterior) la foto actual sale con fade y desplazamiento
  // y la nueva entra desde ese lado; sin `dir` (al abrir) se cambia sin animación.
  const show = async (i: number, dir = 0) => {
    index = (i + total) % total;
    current.textContent = String(index + 1);
    [index - 1, index + 1].forEach((n) => {
      const neighbour = source(n);
      new Image().src = neighbour.currentSrc || neighbour.src;
    });

    const id = ++run;
    layers().filter((layer) => layer.dataset.leaving).forEach((layer) => layer.remove());
    const old = layers().pop()!;

    if (!dir) {
      layers().slice(0, -1).forEach((layer) => layer.remove());
      cancelAnimations(old);
      place(old, index);
      return;
    }

    const fresh = old.cloneNode() as HTMLImageElement;
    place(fresh, index);
    try {
      await fresh.decode();
    } catch {}
    if (id !== run) return;

    const shift = prefersReducedMotion() ? 0 : SHIFT * dir;
    old.dataset.leaving = 'true';
    stage.append(fresh);

    old
      .animate(
        [
          { opacity: 1, transform: 'none' },
          { opacity: 0, transform: `translateX(${-shift}px)` },
        ],
        { duration: duration('--dur-1'), easing: easing.in, fill: 'forwards' },
      )
      .finished.then(() => old.remove())
      .catch(() => {});

    fresh.animate(
      [
        { opacity: 0, transform: `translateX(${shift}px)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: duration('--dur-2'), easing: easing.out },
    );
  };

  // Abrir y cerrar solo con fade
  const open = (i: number) => {
    if (dialog.open) return;
    show(i);
    dialog.showModal();
    dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration('--dur-1'), easing: easing.out });
  };

  const close = async () => {
    if (closing || !dialog.open) return;
    closing = true;
    try {
      await dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: duration('--dur-1'),
        easing: easing.in,
        fill: 'forwards',
      }).finished;
    } catch {}
    cancelAnimations(dialog);
    dialog.close();
    closing = false;
  };

  const go = (to: number, dir: number) => {
    if (!closing) show(to, dir);
  };

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  dialog.querySelector('[data-lightbox-prev]')!.addEventListener('click', () => go(index - 1, -1));
  dialog.querySelector('[data-lightbox-next]')!.addEventListener('click', () => go(index + 1, 1));
  dialog.querySelector('[data-lightbox-close]')!.addEventListener('click', close);

  // Esc: que el cierre pase también por el fade
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  // clic en el fondo (no en la foto ni en los botones) cierra
  dialog.addEventListener('click', (event) => {
    if ((event.target as Element).matches('.lightbox, .lightbox__bar, .lightbox__body, .lightbox__stage')) close();
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') go(index - 1, -1);
    else if (event.key === 'ArrowRight') go(index + 1, 1);
    else if (event.key === 'Home') go(0, -1);
    else if (event.key === 'End') go(total - 1, 1);
    else return;
    event.preventDefault();
  });

  let startX: number | undefined;
  stage.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') startX = event.clientX;
  });
  stage.addEventListener('pointerup', (event) => {
    if (startX === undefined) return;
    const dx = event.clientX - startX;
    startX = undefined;
    if (Math.abs(dx) >= SWIPE) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => (startX = undefined));
}
