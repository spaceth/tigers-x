import { useRef, type CSSProperties } from 'react';
import { goalCards } from '../config/science';
import { stickyProgress, useNarrow, useReducedMotion, useScrollFrame } from '../lib/hooks';
import { Hero } from './Hero';
import { PlatformComparison } from './PlatformComparison';
import { Reveal } from './Reveal';

type Dot = { size: number; x: string; y: string; opacity: number };

/** Flat dots behind the opening copy. The near set rises faster as the page scrolls. */
const farDots: Dot[] = [
  { size: 8, x: '6%', y: '16%', opacity: 0.7 },
  { size: 6, x: '14%', y: '58%', opacity: 0.55 },
  { size: 10, x: '24%', y: '34%', opacity: 0.5 },
  { size: 6, x: '37%', y: '78%', opacity: 0.55 },
  { size: 8, x: '46%', y: '22%', opacity: 0.45 },
  { size: 5, x: '55%', y: '66%', opacity: 0.5 },
  { size: 7, x: '64%', y: '14%', opacity: 0.65 },
  { size: 6, x: '73%', y: '48%', opacity: 0.55 },
  { size: 8, x: '82%', y: '26%', opacity: 0.6 },
  { size: 5, x: '91%', y: '70%', opacity: 0.55 },
  { size: 7, x: '18%', y: '108%', opacity: 0.5 },
  { size: 6, x: '68%', y: '102%', opacity: 0.55 },
  { size: 9, x: '88%', y: '116%', opacity: 0.6 },
];

const nearDots: Dot[] = [
  { size: 16, x: '78%', y: '24%', opacity: 0.85 },
  { size: 12, x: '3%', y: '42%', opacity: 0.7 },
  { size: 18, x: '92%', y: '52%', opacity: 0.8 },
  { size: 11, x: '70%', y: '74%', opacity: 0.65 },
  { size: 14, x: '12%', y: '92%', opacity: 0.6 },
  { size: 9, x: '40%', y: '112%', opacity: 0.55 },
  { size: 15, x: '84%', y: '108%', opacity: 0.75 },
  { size: 8, x: '58%', y: '40%', opacity: 0.5 },
];

/** On a phone, vertical scroll slides the goal cards from right to left. */
function GoalCards() {
  const swipe = useNarrow() && !useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useScrollFrame(() => {
    const trackEl = track.current;
    const pinEl = pin.current;
    const listEl = list.current;
    if (!listEl) return;
    if (!swipe || !trackEl || !pinEl) {
      listEl.style.transform = '';
      return;
    }
    const shift = Math.max(0, listEl.scrollWidth - pinEl.clientWidth);
    const x = -stickyProgress(trackEl, pinEl) * shift;
    listEl.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
  }, swipe);

  return (
    <div ref={track} className={swipe ? 'science-cards-track is-swipe' : 'science-cards-track'}>
      <div ref={pin} className="science-cards-pin">
        <ul ref={list} className="science-cards">
          {goalCards.map((card) => (
            <li key={card.id}>
              <div className="science-card__art" aria-hidden="true">
                <img src={card.icon} alt="" width={1600} height={1600} />
              </div>
              <div className="science-card__body">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DotField({ dots }: { dots: readonly Dot[] }) {
  return dots.map((dot) => (
    <span
      key={`${dot.x}-${dot.y}`}
      className="droplet"
      style={{ width: dot.size, height: dot.size, left: dot.x, top: dot.y, opacity: dot.opacity } as CSSProperties}
    />
  ));
}

/**
 * Opening chapter: black sky hero, then the navy science band
 * (why the work exists, three goal cards, parabolic flight vs ISS).
 */
export function ScienceChapter() {
  const reduced = useReducedMotion();
  const band = useRef<HTMLDivElement>(null);
  const far = useRef<HTMLDivElement>(null);
  const near = useRef<HTMLDivElement>(null);

  useScrollFrame(() => {
    const bandEl = band.current;
    const farEl = far.current;
    const nearEl = near.current;
    if (reduced || !bandEl || !farEl || !nearEl) return;
    const entered = Math.max(0, window.innerHeight - bandEl.getBoundingClientRect().top);
    farEl.style.transform = `translate3d(0, ${(entered * -0.16).toFixed(1)}px, 0)`;
    nearEl.style.transform = `translate3d(0, ${(entered * -0.38).toFixed(1)}px, 0)`;
  }, !reduced);

  return (
    <section id="question" className="chapter chapter--question" aria-labelledby="question-title">
      <Hero />

      <div ref={band} id="overview" className="theme-navy science-band">
        <div className="science-drift" aria-hidden="true">
          <div ref={far} className="science-drift__layer">
            <DotField dots={farDots} />
          </div>
          <div ref={near} className="science-drift__layer">
            <DotField dots={nearDots} />
          </div>
        </div>
        <div className="container science-grid">
          <Reveal className="science-copy">
            <h2 className="science-heading">Emulsification without buoyancy</h2>
            <p>
              Lipid emulsions used in intravenous nutrition are made on Earth by high-shear mixing. Turbulence breaks
              the oil into droplets, and buoyancy separates or stabilizes the phases. Neither mechanism is available
              in microgravity, where interfacial tension and capillary forces dominate. TIGERS-X tested whether a
              passive Tesla-valve mixer can still redistribute an immiscible oil–water pair under those conditions.
              The flight measured mixing behavior. It did not manufacture a medicine.
            </p>
          </Reveal>

          <div className="science-aims">
            <Reveal delay={1}>
              <h2 className="science-heading">What the flight was built to answer</h2>
              <p>
                The campaign links three results: a cube qualified for the station, a record of oil–water flow over
                days rather than seconds, and a teleoperated platform later experiments can reuse.
              </p>
            </Reveal>
            <GoalCards />
          </div>
        </div>

        <PlatformComparison />
      </div>
    </section>
  );
}
