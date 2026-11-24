export function trackTitleHeight() {
  const intro = document.querySelector<HTMLElement>('.page-intro');
  const title = intro?.querySelector<HTMLElement>('.page-title');
  if (!intro || !title) return;

  new ResizeObserver(() => intro.style.setProperty('--title-h', `${title.offsetHeight}px`)).observe(title);
}
