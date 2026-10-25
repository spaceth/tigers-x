import { useRef, type CSSProperties } from 'react';
import { useReducedMotion, useScrollFrame } from '../lib/hooks';

type Star = { x: number; y: number; size: number; duration: number; delay: number };

/** Main stars of Orion, as percentages inside the constellation box. No connecting lines. */
const orion: Star[] = [
  { x: 20, y: 14, size: 4.4, duration: 3.8, delay: 0.2 },
  { x: 74, y: 18, size: 3.4, duration: 2.9, delay: 1.1 },
  { x: 38, y: 48, size: 3.2, duration: 4.2, delay: 0.6 },
  { x: 50, y: 45, size: 3.4, duration: 3.3, delay: 1.8 },
  { x: 62, y: 42, size: 3.1, duration: 2.7, delay: 0.9 },
  { x: 26, y: 80, size: 3.1, duration: 3.6, delay: 2.2 },
  { x: 78, y: 84, size: 4.6, duration: 4.5, delay: 0.4 },
];

const field: Star[] = [
  { x: 8, y: 12, size: 1.6, duration: 4.8, delay: 1.4 },
  { x: 16, y: 28, size: 1.4, duration: 3.5, delay: 2.6 },
  { x: 28, y: 8, size: 1.8, duration: 5.2, delay: 0.7 },
  { x: 72, y: 10, size: 1.5, duration: 3.9, delay: 1.9 },
  { x: 88, y: 22, size: 1.7, duration: 4.4, delay: 0.3 },
  { x: 93, y: 38, size: 1.3, duration: 3.1, delay: 2.8 },
  { x: 6, y: 42, size: 1.4, duration: 4.1, delay: 1.6 },
];

function StarDot({ x, y, size, duration, delay }: Star) {
  const style = {
    left: `${x}%`,
    top: `${y}%`,
    width: size,
    height: size,
    '--d': `${duration}s`,
    '--delay': `${delay}s`,
  } as CSSProperties;
  return <span className="hero-star" style={style} />;
}

/** Decorative Earth, atmosphere and stars behind the hero copy. */
export function HeroSky() {
  const reduced = useReducedMotion();
  const earth = useRef<HTMLDivElement>(null);
  const stars = useRef<HTMLDivElement>(null);

  useScrollFrame(() => {
    const earthEl = earth.current;
    const starsEl = stars.current;
    if (reduced || !earthEl || !starsEl) return;
    const y = window.scrollY;
    earthEl.style.transform = `translate3d(0, ${y * 0.32}px, 0)`;
    starsEl.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
  }, !reduced);

  return (
    <div className="hero-sky__scene" aria-hidden="true">
      <div ref={stars} className="hero-stars">
        <div className="hero-orion">
          {orion.map((star, i) => (
            <StarDot key={i} {...star} />
          ))}
        </div>
        {field.map((star, i) => (
          <StarDot key={i} {...star} />
        ))}
      </div>
      <div ref={earth} className="hero-earth-track">
        <div className="hero-earth" />
      </div>
    </div>
  );
}
