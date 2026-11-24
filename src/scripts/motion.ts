export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export const cancelAnimations = (element: Element) => element.getAnimations().forEach((animation) => animation.cancel());
