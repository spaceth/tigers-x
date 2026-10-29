import { useLayoutEffect, useRef } from 'react';
import channels from '../config/chip-channels.generated.json';

/**
 * The same flight-chip outline as the site diagram, played on a clock instead of
 * a scroll. Colours follow the flight fluids: teal water, orange oil.
 */
const ROW = channels.rows[1];
const JUNCTION_X = 22;
const CHAMBER_X = 54.5;
const OUTLET_X = 67;
const ENTRY_X = 3.75;
const EXIT_X = 82;
const VIEW = { x: 1.6, y: 18.6, w: 75.4, h: 18.2 };
const BODY = { x: 2.2, y: 22.4, w: 74.2, h: 13.5 };
const BOUNDS = [ENTRY_X, JUNCTION_X, CHAMBER_X, OUTLET_X, EXIT_X];

const secondInlet = (toX: number) => `11.2,26.3 ${toX},25.7 ${toX},32.5 11.2,31.9`;

const zones = [
  { x: (ROW.inlets[0].x + ROW.inlets[1].x) / 2, label: 'Inlets' },
  { x: (JUNCTION_X + CHAMBER_X) / 2, label: 'Tesla valves' },
  { x: CHAMBER_X + 4.6, label: 'Chamber' },
  { x: ROW.outlet.x, label: 'Outlet' },
];

function frontAt(t: number) {
  const scaled = Math.min(1, Math.max(0, t)) * (BOUNDS.length - 1);
  const i = Math.min(BOUNDS.length - 2, Math.floor(scaled));
  const local = scaled - i;
  return BOUNDS[i] + (BOUNDS[i + 1] - BOUNDS[i]) * local;
}

export function ChannelView({ progress }: { progress: number }) {
  const clipRef = useRef<SVGRectElement>(null);
  const front = progress >= 1 ? EXIT_X : frontAt(progress);
  const active = progress >= 1 ? zones.length - 1 : Math.min(zones.length - 1, Math.floor(progress * zones.length));
  const id = 'film-fd';

  useLayoutEffect(() => {
    clipRef.current?.setAttribute('width', String(front));
  }, [front]);

  return (
    <figure className="flow-diagram film-diagram">
      <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>Oil and water phases flowing through one Tesla-valve channel</title>
        <desc id={`${id}-desc`}>
          Outline of one channel row on the flight chip. The aqueous and oil phases enter from the inlets on the
          left, pass the Tesla valves, cross the observation chamber, and leave through the outlet on the right.
          The motion is illustrative, not a measured velocity field.
        </desc>
        <defs>
          <clipPath id={`${id}-channel`}>
            <path d={ROW.d} clipRule="evenodd" />
          </clipPath>
          <clipPath id={`${id}-progress`}>
            <rect ref={clipRef} x={0} y={0} width={front} height={80} />
          </clipPath>
        </defs>
        <rect className="fd-chip" x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={1.2} />
        <path className="fd-channel-empty" d={ROW.d} />
        <g clipPath={`url(#${id}-channel)`}>
          <g clipPath={`url(#${id}-progress)`}>
            <rect className="fd-fill-mixed" x={JUNCTION_X} y={20} width={78 - JUNCTION_X} height={18} />
            <rect className="fd-fill-water" x={0} y={20} width={JUNCTION_X} height={18} />
            <polygon className="fd-fill-oil" points={secondInlet(JUNCTION_X)} />
          </g>
        </g>
        {zones.map((zone, i) => (
          <text
            key={zone.label}
            className={`fd-text${i < active ? ' is-reached' : ''}${i === active ? ' is-current' : ''}`}
            x={zone.x}
            y={21.3}
            textAnchor="middle"
          >
            {zone.label}
          </text>
        ))}
      </svg>
      <ul className="fd-legend">
        <li>
          <span className="fd-swatch fd-swatch--aqueous" aria-hidden="true" />
          Aqueous phase · BFluid®
        </li>
        <li>
          <span className="fd-swatch fd-swatch--lipid" aria-hidden="true" />
          Oil phase
        </li>
        <li>
          <span className="fd-swatch fd-swatch--mixed" aria-hidden="true" />
          Mixed through the Tesla valves
        </li>
      </ul>
      <figcaption>One of four channel rows, traced from the flight chip. The fill is illustrative, not a measured flow.</figcaption>
    </figure>
  );
}
