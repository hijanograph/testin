import { trimSlash } from '../utils/path';
import { prefersReducedMotion } from './motion';

document.addEventListener(
  'click',
  (event) => {
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    const url = new URL(link.href, location.href);
    const samePage =
      url.origin === location.origin &&
      !url.hash &&
      url.search === location.search &&
      trimSlash(url.pathname) === trimSlash(location.pathname);
    if (!samePage) return;

    event.preventDefault();
    scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  },
  true,
);
