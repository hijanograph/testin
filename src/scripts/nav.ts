import { navigate } from 'astro:transitions/client';
import { isActivePath, trimSlash } from '../utils/path';
import { prefersReducedMotion } from './motion';

// por si el navegador restaura desde caché una página que se estaba abandonando
addEventListener('pageshow', (event) => event.persisted && document.body.classList.remove('is-leaving'));

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
  // Al pulsar un enlace del menú que lleva a otra página, la página actual se desvanece (salvo el nav) mientras el menú
  // se cierra, y solo entonces se navega: así la transición no congela una página a medio desvanecer y la nueva aparece
  // con normalidad.
  overlay.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
    const leaves =
      link &&
      !modified &&
      link.origin === location.origin &&
      link.target !== '_blank' &&
      !link.hasAttribute('download') &&
      !(trimSlash(link.pathname) === trimSlash(location.pathname) && link.search === location.search);

    if (!leaves) return setOpen(false);

    event.preventDefault();
    if (document.body.classList.contains('is-leaving')) return;
    document.body.classList.add('is-leaving');
    setOpen(false);

    const fade = prefersReducedMotion() ? 0 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-0'));
    setTimeout(() => navigate(link.href), fade);
  });
  document.addEventListener('keydown', (event) => event.key === 'Escape' && setOpen(false));
  matchMedia('(min-width: 1072px)').addEventListener('change', (event) => event.matches && setOpen(false));
  setOpen(false);
}
