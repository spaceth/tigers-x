import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

/** 0 at the start of a sticky track, 1 when the pin has travelled its full distance. */
export function stickyProgress(track: HTMLElement, pin: HTMLElement) {
  const stickyTop = Number.parseFloat(getComputedStyle(pin).top) || 0;
  const scrolled = stickyTop - track.getBoundingClientRect().top;
  const travel = Math.max(1, track.offsetHeight - pin.offsetHeight);
  return Math.min(1, Math.max(0, scrolled / travel));
}

/**
 * Runs `update` on scroll and resize, at most once per frame.
 * When `active` is false, `update` runs once so the caller can reset.
 */
export function useScrollFrame(update: () => void, active = true) {
  const updateRef = useRef(update);
  updateRef.current = update;
  useEffect(() => {
    if (!active) {
      updateRef.current();
      return;
    }
    let frame = 0;
    const run = () => {
      frame = 0;
      updateRef.current();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [active]);
}

function mediaStore(query: string) {
  return {
    subscribe(cb: () => void) {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    get: () => window.matchMedia(query).matches,
  };
}

const stores = new Map<string, ReturnType<typeof mediaStore>>();

export function useMediaQuery(query: string) {
  let s = stores.get(query);
  if (!s) {
    s = mediaStore(query);
    stores.set(query, s);
  }
  return useSyncExternalStore(s.subscribe, s.get, () => false);
}

export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
export const NARROW = '(max-width: 860px)';

export const useReducedMotion = () => useMediaQuery(REDUCED_MOTION);
export const useNarrow = () => useMediaQuery(NARROW);

/** Theme class of the coloured band currently under the fixed nav. */
export function useSectionTheme() {
  const [theme, setTheme] = useState<string | null>(null);
  useScrollFrame(() => {
    const probe = (document.querySelector('.site-nav') as HTMLElement | null)?.offsetHeight ?? 56;
    let next: string | null = null;
    for (const el of document.querySelectorAll<HTMLElement>('main .theme-night, main .theme-navy')) {
      const r = el.getBoundingClientRect();
      if (r.top <= probe / 2 && r.bottom > probe / 2) {
        next = el.classList.contains('theme-night') ? 'theme-night' : 'theme-navy';
        break;
      }
    }
    setTheme(next);
  });
  return theme;
}

/** Becomes true once the element has come within `margin` of the viewport (or stays live with `once: false`). */
export function useInView<T extends Element>(options: { margin?: string; once?: boolean; threshold?: number } = {}) {
  const { margin = '0px', once = true, threshold = 0 } = options;
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin: margin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, once, threshold]);
  return [ref, inView] as const;
}

let webglSupport: boolean | null = null;
export function hasWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    if (new URLSearchParams(window.location.search).has('nowebgl')) return (webglSupport = false);
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    webglSupport = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}
