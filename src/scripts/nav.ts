import { isActivePath } from '../utils/path';

export function initNav() {
  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !overlay) return;

  const home = document.querySelector<HTMLAnchorElement>('.nav__logo')!.pathname;
  document.querySelectorAll<HTMLAnchorElement>('.nav__link[href]').forEach((link) => {
    if (link.origin !== location.origin) return;

    const active = isActivePath(location.pathname, link.pathname, home);
    link.classList.toggle('nav__link--active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (document.activeElement === toggle) toggle.blur();
  if (toggle.dataset.initialized) return;
  toggle.dataset.initialized = 'true';

  const setOpen = (open: boolean) => {
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    overlay.inert = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    document.body.classList.toggle('is-menu-open', open);
    if (open) overlay.querySelector('a')?.focus();
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  overlay.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => event.key === 'Escape' && setOpen(false));
  matchMedia('(min-width: 1072px)').addEventListener('change', (event) => event.matches && setOpen(false));
  setOpen(false);
}
