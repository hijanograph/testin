import { cancelAnimations, prefersReducedMotion } from './motion';

export function initProjectBrowser() {
  const browser = document.querySelector<HTMLElement>('.project-browser');
  if (!browser) return;

  const filter = browser.querySelector<HTMLElement>('.project-filter')!;
  const grid = browser.querySelector<HTMLElement>('.project-grid')!;
  const numberInput = browser.querySelector<HTMLInputElement>('.project-filter__input');
  const emptyMessage = browser.querySelector<HTMLElement>('.project-browser__empty');
  const cards = [...browser.querySelectorAll<HTMLElement>('.project-card')];
  const buttons = [...filter.querySelectorAll<HTMLButtonElement>('.project-filter__btn')];
  const hideExcluded = browser.dataset.mode === 'hide';
  const reducedMotion = prefersReducedMotion();

  const tokens = getComputedStyle(document.documentElement);
  const token = (name: string) => tokens.getPropertyValue(name).trim();
  const duration = (name: string) => {
    const value = token(name);
    return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
  };
  const easing = { out: token('--ease'), in: token('--ease-in'), glide: token('--ease-glide') };

  let run = 0;
  filter.hidden = false;
  if (numberInput) numberInput.value = '';

  const pressArea = (area: string) =>
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.area === area)));

  const leave = (card: HTMLElement) =>
    card.animate(
      reducedMotion
        ? [{ opacity: 1 }, { opacity: 0 }]
        : [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.97)' },
          ],
      { duration: duration('--dur-1'), easing: easing.in, fill: 'forwards' },
    ).finished;

  const enter = (card: HTMLElement, position: number) =>
    card.animate(
      reducedMotion
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: 'translateY(16px)' },
            { opacity: 1, transform: 'none' },
          ],
      { duration: duration('--dur-3'), delay: position * 80, easing: easing.out, fill: 'backwards' },
    );

  const glide = (card: HTMLElement, from: DOMRect) => {
    const to = card.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    if (!dx && !dy) return;

    card.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
      { duration: duration('--dur-4'), easing: easing.glide },
    );
  };

  const resizeGrid = (from: number, to: number) => {
    if (from === to) return;
    grid.animate([{ height: `${from}px` }, { height: `${to}px` }], {
      duration: duration('--dur-3'),
      easing: easing.glide,
    });
  };

  const showCards = async (matches: (card: HTMLElement) => boolean, animate = true) => {
    const id = ++run;
    const firstRects = new Map(cards.filter((card) => !card.hidden).map((card) => [card, card.getBoundingClientRect()]));
    const heightBefore = grid.offsetHeight;
    const filtering = cards.some((card) => !matches(card));
    const leaving: HTMLElement[] = [];
    let visible = 0;

    cancelAnimations(grid);
    cards.forEach((card, i) => {
      card.classList.remove('reveal');
      cancelAnimations(card);
      const ok = matches(card);
      if (ok) visible++;

      if (hideExcluded) {
        if (ok) card.hidden = false;
        else if (!card.hidden) animate ? leaving.push(card) : (card.hidden = true);
      } else {
        card.classList.toggle('is-dimmed', !ok);
      }
      card.style.order = filtering ? String(ok ? i : cards.length + i) : '';
    });

    if (emptyMessage) emptyMessage.hidden = visible > 0;
    if (!animate) return;

    const heightAfter = grid.offsetHeight;
    let entering = 0;
    cards.forEach((card) => {
      if (card.hidden) return;
      const first = firstRects.get(card);
      if (!first) enter(card, entering++);
      else if (!reducedMotion) glide(card, first);
    });
    if (!reducedMotion) resizeGrid(heightBefore, heightAfter);

    if (!leaving.length) return;
    await Promise.allSettled(leaving.map(leave));
    if (id !== run) return;

    leaving.forEach((card) => {
      cancelAnimations(card);
      card.hidden = true;
    });
    if (!reducedMotion) resizeGrid(heightAfter, grid.offsetHeight);
  };

  const selectArea = (area: string, animate = true) => {
    pressArea(area);
    if (numberInput) numberInput.value = '';
    showCards((card) => area === 'all' || !!card.dataset.areas?.split(' ').includes(area), animate);
  };

  filter.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.project-filter__btn');
    if (!button) return;

    const area = button.dataset.area!;
    selectArea(area);
    if (hideExcluded) {
      history.replaceState(history.state, '', area === 'all' ? location.pathname + location.search : `#${area}`);
    }
  });

  numberInput?.addEventListener('input', () => {
    const value = numberInput.value.trim();
    pressArea('all');
    showCards((card) => !value || card.dataset.number === String(Number(value)));
  });

  const applyHash = (animate = true) => {
    const area = location.hash.slice(1);
    if (!buttons.some((button) => button.dataset.area === area)) return false;

    selectArea(area, animate);
    if (!hideExcluded) history.replaceState(history.state, '', location.pathname + location.search);
    return true;
  };

  if (applyHash(false)) {
    browser.closest('section')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  const onHashChange = () => applyHash();
  window.addEventListener('hashchange', onHashChange);
  document.addEventListener('astro:before-swap', () => window.removeEventListener('hashchange', onHashChange), {
    once: true,
  });
}
