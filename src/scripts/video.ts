import { prefersReducedMotion } from './motion';

let observer: IntersectionObserver | undefined;

// Las animaciones solo se reproducen mientras se ven; con "reducir movimiento" se queda el póster.
export function initVideos() {
  observer?.disconnect();
  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-loop]');
  if (videos.length === 0) return;

  if (prefersReducedMotion()) {
    videos.forEach((video) => {
      video.removeAttribute('autoplay');
      video.pause();
    });
    return;
  }

  observer = new IntersectionObserver(
    (entries) =>
      entries.forEach(({ target, isIntersecting }) => {
        const video = target as HTMLVideoElement;
        if (isIntersecting) video.play().catch(() => {});
        else video.pause();
      }),
    { threshold: 0.1 }
  );
  videos.forEach((video) => observer!.observe(video));
}
