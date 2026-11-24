export const trimSlash = (path: string) => path.replace(/\/$/, '') || '/';

export const isActivePath = (current: string, target: string, home: string) => {
  const here = trimSlash(current);
  const there = trimSlash(target);
  return there === trimSlash(home) ? here === there : here === there || here.startsWith(`${there}/`);
};
