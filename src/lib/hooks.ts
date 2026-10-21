import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

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
