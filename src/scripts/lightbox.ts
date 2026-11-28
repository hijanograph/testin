import { cancelAnimations, prefersReducedMotion } from './motion';

type Slide = { src: string; alt: string };

const SWIPE = 50;
const MAX_ZOOM = 4;
const CLICK_ZOOM = 2.5;
const DOUBLE_TAP = 300;
const GRID = 40;

let controller: AbortController | undefined;

const keyOf = (src: string) => new URL(src, location.href).pathname.replace(/\.[^.]+$/, '').toLowerCase();

export function initLightbox() {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const dialog = document.querySelector<HTMLDialogElement>('.lightbox');
  if (!dialog) return;

  const slides: Slide[] = JSON.parse(dialog.dataset.slides || '[]');
  const total = slides.length;
  if (!total) return;

  const stage = dialog.querySelector<HTMLElement>('[data-lightbox-stage]')!;
  const counter = dialog.querySelector<HTMLElement>('[data-lightbox-current]')!;
  const toneTargets = [...dialog.querySelectorAll<HTMLElement>('[data-lightbox-tone]')];

  dialog.querySelector<HTMLElement>('[data-lightbox-total]')!.textContent = String(total);
  dialog.classList.toggle('lightbox--single', total === 1);

  const tokens = getComputedStyle(document.documentElement);
  const token = (name: string) => tokens.getPropertyValue(name).trim();
  const duration = (name: string) => {
    const value = token(name);
    return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
  };
  const easing = { out: token('--ease'), in: token('--ease-in') };

  const wrap = (i: number) => (i + total) % total;
  const layers = () => [...stage.querySelectorAll<HTMLImageElement>('.lightbox__img')];
  const current = () => layers().filter((layer) => !layer.dataset.leaving).pop()!;

  let index = 0;
  let run = 0;
  let closing = false;

  /* ---------- precarga ---------- */

  const preloaded = new Map<number, HTMLImageElement>();
  const preload = (i: number) => {
    const n = wrap(i);
    if (preloaded.has(n)) return;
    const image = new Image();
    image.src = slides[n].src;
    image.decode().catch(() => {});
    preloaded.set(n, image);
  };

  const place = (target: HTMLImageElement, i: number) => {
    target.src = slides[i].src;
    target.alt = slides[i].alt;
  };

  /* ---------- color de los controles según lo que hay detrás ---------- */

  // luminancia de cada foto en baja resolución, para decidir si el control va en cream (fondo oscuro) o en ink
  const luminance = new Map<number, { w: number; h: number; values: Float32Array }>();

  const luminanceOf = (i: number, image: HTMLImageElement) => {
    let grid = luminance.get(i);
    if (grid || !image.naturalWidth) return grid;
    const w = GRID;
    const h = Math.max(1, Math.round((w * image.naturalHeight) / image.naturalWidth));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    try {
      // las fotos con fondo transparente se ven sobre cream
      context.fillStyle = token('--cream') || '#fff5e9';
      context.fillRect(0, 0, w, h);
      context.drawImage(image, 0, 0, w, h);
      const { data } = context.getImageData(0, 0, w, h);
      const values = new Float32Array(w * h);
      for (let p = 0; p < values.length; p++) {
        values[p] = (0.2126 * data[p * 4] + 0.7152 * data[p * 4 + 1] + 0.0722 * data[p * 4 + 2]) / 255;
      }
      grid = { w, h, values };
      luminance.set(i, grid);
    } catch {}
    return grid;
  };

  /* ---------- zoom ---------- */

  let scale = 1;
  let tx = 0;
  let ty = 0;

  // tamaño de la foto ajustada al visor (sin zoom)
  const fit = () => {
    const image = current();
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const k = Math.min(W / (image.naturalWidth || W), H / (image.naturalHeight || H));
    return { W, H, w: (image.naturalWidth || W) * k, h: (image.naturalHeight || H) * k };
  };

  let toneFrame = 0;
  const scheduleTones = () => {
    if (!toneFrame) toneFrame = requestAnimationFrame(updateTones);
  };

  function updateTones() {
    toneFrame = 0;
    if (!dialog!.open) return;
    const grid = luminanceOf(index, current());
    const area = stage.getBoundingClientRect();
    const { w, h } = fit();
    const width = w * scale;
    const height = h * scale;
    const left = area.left + area.width / 2 + tx - width / 2;
    const top = area.top + area.height / 2 + ty - height / 2;

    const arrows = new Set<HTMLElement>();
    const sums = new Map<HTMLElement, number>();
    toneTargets.forEach((element) => {
      const box = element.getBoundingClientRect();
      let sum = 0;
      for (let a = 0; a < 5; a++) {
        for (let b = 0; b < 5; b++) {
          const u = (box.left + (box.width * (a + 0.5)) / 5 - left) / width;
          const v = (box.top + (box.height * (b + 0.5)) / 5 - top) / height;
          const inside = grid && u >= 0 && u < 1 && v >= 0 && v < 1;
          // fuera de la foto el fondo es cream (claro)
          sum += inside ? grid.values[Math.floor(v * grid.h) * grid.w + Math.floor(u * grid.w)] : 0.97;
        }
      }
      sums.set(element, sum / 25);
      if (element.closest('.lightbox__nav')) arrows.add(element);
    });
    // Las dos flechas comparten siempre el mismo tono (el de su media).
    const arrowMean = arrows.size ? [...arrows].reduce((t, el) => t + sums.get(el)!, 0) / arrows.size : 0;
    sums.forEach((value, element) => {
      element.dataset.tone = (arrows.has(element) ? arrowMean : value) < 0.5 ? 'dark' : 'light';
    });
  }

  const clampPan = () => {
    const { W, H, w, h } = fit();
    const maxX = Math.max(0, (w * scale - W) / 2);
    const maxY = Math.max(0, (h * scale - H) / 2);
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  };

  const apply = (smooth: boolean) => {
    const image = current();
    stage.classList.toggle('is-zoomed', scale > 1);
    stage.classList.toggle('is-smooth', smooth);
    if (scale > 1) {
      image.style.scale = String(scale);
      image.style.translate = `${tx}px ${ty}px`;
    } else {
      image.style.removeProperty('scale');
      image.style.removeProperty('translate');
    }
    scheduleTones();
  };

  // Zoom manteniendo fijo el punto (x, y) de pantalla; sin punto, el centro
  const zoomAt = (to: number, x?: number, y?: number, smooth = true) => {
    const next = Math.min(MAX_ZOOM, Math.max(1, to));
    const area = stage.getBoundingClientRect();
    const cx = (x ?? area.left + area.width / 2) - (area.left + area.width / 2);
    const cy = (y ?? area.top + area.height / 2) - (area.top + area.height / 2);
    const k = next / scale;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    scale = next;
    if (scale <= 1.001) {
      scale = 1;
      tx = ty = 0;
    } else clampPan();
    apply(smooth);
  };

  const resetZoom = () => {
    scale = 1;
    tx = ty = 0;
    stage.classList.remove('is-zoomed', 'is-smooth');
  };

  /* ---------- cambio de foto ---------- */

  // Pasa a la foto `i`. Con `dir` (1 siguiente, -1 anterior) la foto actual sale con fade y desplazamiento y la
  // nueva entra desde ese lado; sin `dir` (al abrir) se cambia sin animación.
  const show = async (i: number, dir = 0) => {
    index = wrap(i);
    counter.textContent = String(index + 1);
    preload(index - 1);
    preload(index + 1);
    resetZoom();

    const id = ++run;
    layers().filter((layer) => layer.dataset.leaving).forEach((layer) => layer.remove());
    const old = current();

    if (!dir) {
      layers().filter((layer) => layer !== old).forEach((layer) => layer.remove());
      cancelAnimations(old);
      old.style.removeProperty('scale');
      old.style.removeProperty('translate');
      place(old, index);
      old.decode().catch(() => {}).then(() => id === run && scheduleTones());
      return;
    }

    const fresh = old.cloneNode() as HTMLImageElement;
    fresh.style.removeProperty('scale');
    fresh.style.removeProperty('translate');
    place(fresh, index);
    try {
      await fresh.decode();
    } catch {}
    if (id !== run) return;

    // el desplazamiento se queda dentro de la pantalla (en móvil, 48px de más provocaban un salto)
    const shift = prefersReducedMotion() ? 0 : Math.min(48, innerWidth * 0.1) * dir;
    old.dataset.leaving = 'true';
    stage.append(fresh);
    scheduleTones();

    old
      .animate(
        [
          { opacity: 1, transform: 'none' },
          { opacity: 0, transform: `translateX(${-shift}px)` },
        ],
        { duration: duration('--dur-0'), easing: easing.out, fill: 'forwards' },
      )
      .finished.then(() => old.remove())
      .catch(() => {});

    fresh.animate(
      [
        { opacity: 0, transform: `translateX(${shift}px)` },
        { opacity: 1, transform: 'none' },
      ],
      // entra cuando la anterior ya casi se ha ido: con fotos de distinta proporción, cruzarlas dejaba un bloque gris detrás
      { duration: duration('--dur-2'), delay: duration('--dur-0') * 0.6, easing: easing.out, fill: 'backwards' },
    );
  };

  /* ---------- abrir y cerrar (solo fade) ---------- */

  const open = (i: number) => {
    if (dialog.open) return;
    show(i);
    dialog.showModal();
    dialog.focus();
    dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: duration('--dur-1'), easing: easing.out });
    scheduleTones();
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

  /* ---------- desde dónde se abre ---------- */

  // fotos del grid
  document.querySelectorAll<HTMLElement>('[data-lightbox-index]').forEach((item) => {
    item.addEventListener('click', () => open(Number(item.dataset.lightboxIndex)), { signal });
  });

  // fotos que acompañan al texto (hero y bloques): no se repiten en el grid, pero abren el visor en su foto
  const indexByKey = new Map(slides.map((slide, i) => [keyOf(slide.src), i]));
  document.querySelectorAll<HTMLImageElement>('img.hero-frame__img, img.project-block__img').forEach((image) => {
    const i = indexByKey.get(keyOf(image.getAttribute('src') || ''));
    if (i === undefined) return;
    image.classList.add('is-zoomable');
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-haspopup', 'dialog');
    image.addEventListener('click', () => open(i), { signal });
    image.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open(i);
      },
      { signal },
    );
  });

  /* ---------- controles ---------- */

  dialog.querySelector('[data-lightbox-prev]')!.addEventListener('click', () => go(index - 1, -1), { signal });
  dialog.querySelector('[data-lightbox-next]')!.addEventListener('click', () => go(index + 1, 1), { signal });
  dialog.querySelector('[data-lightbox-close]')!.addEventListener('click', close, { signal });

  // Esc: que el cierre pase también por el fade
  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault();
      close();
    },
    { signal },
  );

  dialog.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'ArrowLeft') go(index - 1, -1);
      else if (event.key === 'ArrowRight') go(index + 1, 1);
      else if (event.key === 'Home') go(0, -1);
      else if (event.key === 'End') go(total - 1, 1);
      else if (event.key === '+' || event.key === '=') zoomAt(scale * 1.5);
      else if (event.key === '-') zoomAt(scale / 1.5);
      else if (event.key === '0') zoomAt(1);
      else return;
      event.preventDefault();
    },
    { signal },
  );

  addEventListener(
    'resize',
    () => {
      clampPan();
      apply(false);
    },
    { signal },
  );

  /* ---------- gestos sobre la foto: zoom con rueda y pellizco, arrastre, clic/doble toque, deslizar ---------- */

  const pointers = new Map<number, { x: number; y: number }>();
  let pinch = 0;
  let press: { x: number; y: number; moved: boolean; onPhoto: boolean; touch: boolean } | undefined;
  let pressedPhoto = false;
  let lastTap = { time: 0, x: 0, y: 0 };

  const onPhoto = (x: number, y: number) => {
    const area = stage.getBoundingClientRect();
    const { w, h } = fit();
    return (
      Math.abs(x - (area.left + area.width / 2 + tx)) <= (w * scale) / 2 &&
      Math.abs(y - (area.top + area.height / 2 + ty)) <= (h * scale) / 2
    );
  };

  stage.addEventListener(
    'pointerdown',
    (event) => {
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
      if (pointers.size === 1) {
        pressedPhoto = onPhoto(event.clientX, event.clientY);
        press = { x: event.clientX, y: event.clientY, moved: false, onPhoto: pressedPhoto, touch: event.pointerType === 'touch' };
      } else {
        press = undefined;
        const [a, b] = [...pointers.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    },
    { signal },
  );

  stage.addEventListener(
    'pointermove',
    (event) => {
      const pointer = pointers.get(event.pointerId);
      if (!pointer) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer.x = event.clientX;
      pointer.y = event.clientY;

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) zoomAt((scale * distance) / pinch, (a.x + b.x) / 2, (a.y + b.y) / 2, false);
        pinch = distance;
        return;
      }

      if (!press) return;
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press.moved = true;
      if (scale > 1) {
        tx += dx;
        ty += dy;
        clampPan();
        apply(false);
      }
    },
    { signal },
  );

  const release = (event: PointerEvent, cancelled: boolean) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = 0;
    if (!pointers.size) stage.classList.remove('is-dragging');

    const start = press;
    press = undefined;
    if (!start || cancelled) return;

    if (start.moved) {
      const dx = event.clientX - start.x;
      if (start.touch && scale === 1 && Math.abs(dx) >= SWIPE) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      return;
    }
    if (!start.onPhoto) return;

    if (!start.touch) {
      zoomAt(scale > 1 ? 1 : CLICK_ZOOM, event.clientX, event.clientY);
      return;
    }
    // en táctil, doble toque
    const now = performance.now();
    if (now - lastTap.time < DOUBLE_TAP && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 30) {
      lastTap.time = 0;
      zoomAt(scale > 1 ? 1 : CLICK_ZOOM, event.clientX, event.clientY);
    } else lastTap = { time: now, x: event.clientX, y: event.clientY };
  };

  stage.addEventListener('pointerup', (event) => release(event, false), { signal });
  stage.addEventListener('pointercancel', (event) => release(event, true), { signal });

  stage.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      zoomAt(scale * Math.exp(-delta * (event.ctrlKey ? 0.01 : 0.0015)), event.clientX, event.clientY, false);
    },
    { passive: false, signal },
  );

  // clic fuera de la foto (en el fondo): cierra
  stage.addEventListener('click', () => !pressedPhoto && close(), { signal });
}
