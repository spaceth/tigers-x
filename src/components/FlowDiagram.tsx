import { useLayoutEffect, useRef, useState } from 'react';
import channels from '../config/chip-channels.generated.json';
import { stickyProgress, useReducedMotion, useScrollFrame } from '../lib/hooks';

/*
 * Plan-view outline of one of the chip's four channel rows, traced from the flight
 * chip's STL by scripts/extract-channels.mjs. Coordinates are millimetres on the
 * chip. This row has its two inlet ports on the left and its outlet on the right.
 *
 * The card sticks in the viewport while the page scrolls. That scroll fills the
 * channel from the inlets to the outlet and fades the matching explanation.
 *
 * The positions below were read off that outline; re-check them if the chip
 * geometry changes.
 */
const ROW = channels.rows[1];
const PORTS = { inlets: ROW.inlets.map((p) => p.x), outlet: ROW.outlet.x };
/** Where the entry section's two arms enter the Tesla-valve chain. */
const JUNCTION_X = 22;
/** Start of the rectangular observation chamber before the outlet. */
const CHAMBER_X = 54.5;
/** Where the chamber narrows toward the outlet port. */
const OUTLET_X = 67;
/** Left edge of the row, where the first inlet opens. */
const ENTRY_X = 3.75;
/** Past the outlet port, so a finished clip covers the whole channel. */
const EXIT_X = 82;

const VIEW = { x: 1.6, y: 18.6, w: 75.4, h: 18.2 };
const BODY = { x: 2.2, y: 22.4, w: 74.2, h: 13.5 };

/**
 * The second inlet opens into the middle of the wide entry section, so its stream
 * runs between the first inlet's streams along the top and bottom edges.
 */
const secondInlet = (toX: number) => `11.2,26.3 ${toX},25.7 ${toX},32.5 11.2,31.9`;

/** x positions the flow front crosses, one per explanation. */
const BOUNDS = [ENTRY_X, JUNCTION_X, CHAMBER_X, OUTLET_X, EXIT_X];

const stages = [
  {
    title: 'Inlets',
    text: 'Two pumps feed this channel. The water phase, BFluid®, enters along the outer edges, and the oil phase enters down the middle. The two stay side by side.',
  },
  {
    title: 'Tesla valves',
    text: 'The streams enter the Tesla-valve chain, a passive mixer with no moving parts. The pumps only keep the flow moving. Each unit mixes by its shape.',
  },
  {
    title: 'Chamber',
    text: 'The channel opens into a rectangular observation chamber. This is the window the cameras record, where the two phases can still be told apart.',
  },
  {
    title: 'Outlet',
    text: 'The fluid leaves through the outlet fitting and is collected in this channel’s bag.',
  },
] as const;

const zones = [
  { x: (PORTS.inlets[0] + PORTS.inlets[1]) / 2, label: 'Inlets' },
  { x: (JUNCTION_X + CHAMBER_X) / 2, label: 'Tesla valves' },
  { x: CHAMBER_X + 4.6, label: 'Chamber' },
  { x: PORTS.outlet, label: 'Outlet' },
];

function frontAt(t: number) {
  const scaled = Math.min(1, Math.max(0, t)) * (BOUNDS.length - 1);
  const i = Math.min(BOUNDS.length - 2, Math.floor(scaled));
  const local = scaled - i;
  return BOUNDS[i] + (BOUNDS[i + 1] - BOUNDS[i]) * local;
}

export function FlowDiagram() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGRectElement>(null);
  const frontRef = useRef(reduced ? EXIT_X : ENTRY_X);
  const [stage, setStage] = useState(0);
  const id = 'fd';

  useLayoutEffect(() => {
    clipRef.current?.setAttribute('width', String(frontRef.current));
  });

  useScrollFrame(() => {
    const clip = clipRef.current;
    if (reduced) {
      frontRef.current = EXIT_X;
      clip?.setAttribute('width', String(EXIT_X));
      return;
    }
    const track = trackRef.current;
    const card = rootRef.current;
    if (!track || !card || !clip) return;
    const t = stickyProgress(track, card);
    const front = t >= 1 ? EXIT_X : frontAt(t);
    frontRef.current = front;
    clip.setAttribute('width', String(front));
    const next = t >= 1 ? stages.length - 1 : Math.min(stages.length - 1, Math.floor(t * stages.length));
    setStage((prev) => (prev === next ? prev : next));
  }, !reduced);

  const active = reduced ? stages.length - 1 : stage;

  return (
    <div className="flow-stick" ref={trackRef} data-reduced={reduced ? 'true' : 'false'}>
    <div className="flow-pin" ref={rootRef}>
    <p className="flow-diagram__kicker">Conceptual fluid-flow illustration</p>
    <figure className="flow-diagram">
      <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>Oil and water phases flowing through one Tesla-valve channel</title>
        <desc id={`${id}-desc`}>
          Outline of one channel row on the flight chip. The blue water phase and the gray oil phase
          enter from the inlets on the left. After the Tesla valves the stream is orange, through the
          observation chamber and out of the outlet on the right. The motion is illustrative, not a
          measured recording.
        </desc>
        <defs>
          <clipPath id={`${id}-channel`}>
            <path d={ROW.d} clipRule="evenodd" />
          </clipPath>
          <clipPath id={`${id}-progress`}>
            <rect ref={clipRef} x={0} y={0} width={reduced ? EXIT_X : ENTRY_X} height={80} />
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

        {zones.map((z, i) => (
          <text
            key={z.label}
            className={`fd-text${i < active ? ' is-reached' : ''}${i === active ? ' is-current' : ''}`}
            x={z.x}
            y={21.3}
            textAnchor="middle"
          >
            {z.label}
          </text>
        ))}
      </svg>

      <ul className="fd-legend">
        <li>
          <span className="fd-swatch fd-swatch--aqueous" aria-hidden="true" />
          Water phase · BFluid®
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

      <ol className="fd-stage" aria-live={reduced ? 'off' : 'polite'}>
        {stages.map((s, i) => (
          <li key={s.title} className={i === active ? 'is-current' : undefined} aria-hidden={reduced ? undefined : i !== active}>
            <h3 className="fd-stage__title">{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>

      <figcaption>
        One of the chip’s four channel rows, traced from the flight chip’s CAD geometry (channels 1 mm
        deep). The pale stream is the water phase, the blue stream is the oil phase, and the dark stream is
        the fluid after the Tesla valves. The motion is illustrative, not a measured flow.
      </figcaption>
    </figure>
    <p className="flow-diagram__follow">
      They meet in a Tesla-valve mixer — a passive static mixer with no moving parts. The valve lets fluid pass
      one way and resists reverse flow. Its asymmetric branches split the stream, loop it back, and re-join it
      at an angle so the phases drive into one another. The outlet opens into a rectangular chamber where the
      cameras watch what comes out.
    </p>
    </div>
    </div>
  );
}
