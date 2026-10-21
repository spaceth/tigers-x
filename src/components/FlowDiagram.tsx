import { useEffect, useRef, type ReactNode } from 'react';
import channels from '../config/chip-channels.generated.json';
import { useInView, useReducedMotion } from '../lib/hooks';

export type FlowStage = 'deliver' | 'mix' | 'watch' | 'time';

/*
 * Plan-view outline of one of the chip's four channel networks, traced from the
 * design model by scripts/extract-channels.mjs (both channel sheets together).
 * Coordinates are millimetres on the chip. This network has its two ports on the
 * left and its single port on the right, so it reads left to right.
 *
 * The positions below were read off that outline; re-check them if the chip
 * geometry changes.
 */
const NETWORK = channels.networks[1];
const CHANNEL_PATHS = [NETWORK.paths.upper, NETWORK.paths.lower];
const PORTS = { inlets: [4.9, 13.4], outlet: 72.6, z: 29.2 };
/** Where the two inlet streams meet, at the start of each branch. */
const JUNCTION_X = 22.5;
/** Each branch is built from repeating Tesla-valve units; the folds get finer at each one. */
const UNIT_EDGES = [JUNCTION_X, 31.9, 38.5, 45, 51.4, 57.6, 64];
const STRIPE_PERIODS = [2.2, 1.4, 0.95, 0.65, 0.45, 0.32];
/** Streams from the second inlet occupy this band until the junction (clipped to the channel). */
const SECOND_INLET = '10.5,25.4 22.5,26.1 22.5,32.1 10.5,33';

const VIEW = { x: 1, y: 19.4, w: 76 };
const BODY = { x: 1.4, y: 22.5, w: 75.2, h: 13.6 };

interface Inset {
  /** Region of the chip to magnify, in chip millimetres. */
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
}

const insets: Partial<Record<FlowStage, Inset>> = {
  mix: { x: 19.4, y: 29, w: 18.4, h: 6.9, title: 'One Tesla-valve unit, magnified' },
  watch: { x: 37, y: 22.9, w: 18.4, h: 6.9, title: 'Inside the camera view, magnified' },
};
const INSET_SCALE = 2.35;

const titles: Record<FlowStage, string> = {
  deliver: 'The two phases enter the chip through separate inlets',
  mix: 'Tesla-valve units fold the two phases into one another',
  watch: 'Cameras record the region where the phases interact',
  time: 'After mixing, a dispersion can evolve in different ways',
};

const descriptions: Record<FlowStage, string> = {
  deliver:
    'Outline of one channel network on the chip. Two inlet ports on the left each feed an upper and a lower branch. The aqueous and lipid phases fill the inlet channels and meet side by side where each branch begins; the rest of the channel is still empty.',
  mix: 'The same channel network filled with fluid. After the junction, each branch passes through a chain of Tesla-valve units: angled branches ending in rounded pockets. Along the channel, the coloured bands of the two phases become progressively thinner, and near the outlet the lipid phase appears as fine droplets. A magnified view shows one Tesla-valve unit.',
  watch:
    'The filled channel network with a shaded rectangle marking an illustrative camera field of view over one branch, and a magnified view of that region showing the folded bands of the two phases.',
  time: 'Three containers show possible states over time: a fine dispersion of droplets, fewer larger droplets after merging, and a partly separated layer.',
};

function Patterns({ id, animate }: { id: string; animate: boolean }) {
  return (
    <>
      {STRIPE_PERIODS.map((p, i) => (
        <pattern key={i} id={`${id}-fold-${i}`} patternUnits="userSpaceOnUse" width={4} height={p} patternTransform="rotate(62)">
          <rect className="fd-fill-aqueous" width={4} height={p / 2} />
          <rect className="fd-fill-lipid" y={p / 2} width={4} height={p / 2} />
          {animate && (
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              additive="sum"
              from="0 0"
              to={`0 ${-p}`}
              dur={`${(p / 1.6).toFixed(2)}s`}
              repeatCount="indefinite"
            />
          )}
        </pattern>
      ))}
      <pattern id={`${id}-drops`} patternUnits="userSpaceOnUse" width={1.3} height={1.1}>
        <rect className="fd-fill-aqueous" width={1.3} height={1.1} />
        <circle className="fd-fill-lipid" cx={0.32} cy={0.3} r={0.2} />
        <circle className="fd-fill-lipid" cx={0.98} cy={0.84} r={0.17} />
        {animate && (
          <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="1.3 0" dur="0.9s" repeatCount="indefinite" />
        )}
      </pattern>
    </>
  );
}

/** Fluid inside the channel outline. `filled` false shows only the inlets primed. */
function ChannelFluid({ id, filled }: { id: string; filled: boolean }) {
  return (
    <g clipPath={`url(#${id}-channel)`}>
      <rect className="fd-fill-empty" x={0} y={20} width={78} height={18} />
      {filled && (
        <>
          {STRIPE_PERIODS.map((_, i) => (
            <rect
              key={i}
              x={UNIT_EDGES[i]}
              y={20}
              width={UNIT_EDGES[i + 1] - UNIT_EDGES[i] + 0.02}
              height={18}
              fill={`url(#${id}-fold-${i})`}
            />
          ))}
          <rect x={UNIT_EDGES[UNIT_EDGES.length - 1]} y={20} width={14} height={18} fill={`url(#${id}-drops)`} />
        </>
      )}
      <rect className="fd-fill-aqueous" x={0} y={20} width={JUNCTION_X} height={18} />
      <polygon className="fd-fill-lipid" points={SECOND_INLET} />
    </g>
  );
}

function ChannelView({ stage, animate }: { stage: Exclude<FlowStage, 'time'>; animate: boolean }) {
  const id = `fd-${stage}`;
  const inset = insets[stage];
  const insetW = inset ? inset.w * INSET_SCALE : 0;
  const insetH = inset ? inset.h * INSET_SCALE : 0;
  const insetX = VIEW.x + (VIEW.w - insetW) / 2;
  const insetY = BODY.y + BODY.h + 4.6;
  const height = inset ? insetY + insetH + 0.6 - VIEW.y : BODY.y + BODY.h + 0.6 - VIEW.y;

  return (
    <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${height}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
      <title id={`${id}-title`}>{titles[stage]}</title>
      <desc id={`${id}-desc`}>{descriptions[stage]}</desc>
      <defs>
        <clipPath id={`${id}-channel`}>
          {CHANNEL_PATHS.map((d) => (
            <path key={d.length} d={d} />
          ))}
        </clipPath>
        <Patterns id={id} animate={animate} />
        <g id={`${id}-fluid`}>
          <ChannelFluid id={id} filled={stage !== 'deliver'} />
        </g>
        {inset && (
          <clipPath id={`${id}-inset`}>
            <rect x={inset.x} y={inset.y} width={inset.w} height={inset.h} rx={0.5} />
          </clipPath>
        )}
      </defs>

      <rect className="fd-chip" x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={1.2} />
      {inset && <rect className="fd-focus" x={inset.x} y={inset.y} width={inset.w} height={inset.h} rx={0.5} />}
      <use href={`#${id}-fluid`} />

      <text className="fd-text" x={(PORTS.inlets[0] + PORTS.inlets[1]) / 2} y={21.3} textAnchor="middle">
        Inlets
      </text>
      <text className="fd-text" x={PORTS.outlet} y={21.3} textAnchor="middle">
        Outlet
      </text>
      {stage === 'watch' && inset && (
        <text className="fd-text" x={inset.x + inset.w / 2} y={21.3} textAnchor="middle">
          Camera view · illustrative
        </text>
      )}

      {inset && (
        <>
          <text className="fd-text fd-text--strong" x={VIEW.x + VIEW.w / 2} y={insetY - 1.3} textAnchor="middle">
            {inset.title}
          </text>
          <g transform={`translate(${insetX} ${insetY}) scale(${INSET_SCALE}) translate(${-inset.x} ${-inset.y})`}>
            <g clipPath={`url(#${id}-inset)`}>
              <rect className="fd-chip" x={inset.x} y={inset.y} width={inset.w} height={inset.h} />
              <use href={`#${id}-fluid`} />
            </g>
          </g>
        </>
      )}
    </svg>
  );
}

function TimeView() {
  const vessel = (x: number, label: string, note: string, body: ReactNode) => (
    <g transform={`translate(${x} 34)`}>
      <rect className="fd-vessel" width={132} height={150} rx={12} />
      {body}
      <text className="fd-label" x={0} y={176}>
        {label}
      </text>
      <text className="fd-label fd-label--sub" x={0} y={194}>
        {note}
      </text>
    </g>
  );
  const drops = (pts: [number, number, number][]) => pts.map(([cx, cy, r], i) => <circle key={i} className="fd-fill-lipid" cx={cx} cy={cy} r={r} />);
  return (
    <svg viewBox="0 0 490 292" role="img" aria-labelledby="fd-time-title fd-time-desc">
      <title id="fd-time-title">{titles.time}</title>
      <desc id="fd-time-desc">{descriptions.time}</desc>
      <text className="fd-label fd-label--sub" x={14} y={20}>
        Possible outcomes over time
      </text>
      {vessel(14, 'Just formed', 'A dispersion of droplets', (
        <>
          <rect className="fd-fill-aqueous fd-soft" x={8} y={8} width={116} height={134} rx={7} />
          {drops([[22, 30, 4], [46, 52, 4], [70, 26, 4], [98, 44, 4], [114, 78, 4], [30, 86, 4], [58, 98, 4], [86, 84, 4], [108, 118, 4], [40, 124, 4], [72, 132, 4], [20, 60, 4]])}
        </>
      ))}
      {vessel(174, 'Later — merging?', 'Droplets may coalesce', (
        <>
          <rect className="fd-fill-aqueous fd-soft" x={8} y={8} width={116} height={134} rx={7} />
          {drops([[34, 40, 10], [92, 58, 7], [58, 104, 12], [106, 116, 6], [24, 124, 4]])}
        </>
      ))}
      {vessel(334, 'Later — separating?', 'Phases may begin to part', (
        <>
          <rect className="fd-fill-aqueous fd-soft" x={8} y={8} width={116} height={134} rx={7} />
          <rect className="fd-fill-lipid" x={8} y={8} width={116} height={30} rx={7} />
          {drops([[30, 72, 4], [86, 96, 5], [60, 126, 3]])}
        </>
      ))}
      <text className="fd-label fd-label--sub" x={14} y={262}>
        Which of these occur, and how quickly,
      </text>
      <text className="fd-label fd-label--sub" x={14} y={280}>
        is what the recordings help reveal.
      </text>
    </svg>
  );
}

function Legend({ stage }: { stage: FlowStage }) {
  return (
    <ul className="fd-legend">
      <li>
        <span className="fd-swatch fd-swatch--aqueous" aria-hidden="true" />
        Aqueous phase · BFluid® glucose–electrolyte
      </li>
      <li>
        <span className="fd-swatch fd-swatch--lipid" aria-hidden="true" />
        Lipid phase
      </li>
      {stage !== 'deliver' && stage !== 'time' && (
        <>
          <li>
            <span className="fd-swatch fd-swatch--folded" aria-hidden="true" />
            Folded together
          </li>
          <li>
            <span className="fd-swatch fd-swatch--drops" aria-hidden="true" />
            Dispersed droplets
          </li>
        </>
      )}
    </ul>
  );
}

const teslaSteps = [
  { title: 'Split', text: 'At each unit, an angled branch divides the stream.' },
  { title: 'Turn', text: 'Part of the flow sweeps around a rounded pocket and doubles back.' },
  { title: 'Re-join', text: 'It meets the main stream again at an angle, folding the two phases together.' },
];

export function FlowDiagram({ stage }: { stage: FlowStage }) {
  const [ref, playing] = useInView<HTMLElement>({ once: false, margin: '0px' });
  const reduced = useReducedMotion();
  const svgHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const svg = svgHost.current?.querySelector('svg');
    if (!svg) return;
    if (playing) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [playing]);

  return (
    <figure ref={ref} className="flow-diagram">
      <p className="flow-diagram__kicker">Conceptual fluid-flow illustration</p>
      <div ref={svgHost}>{stage === 'time' ? <TimeView /> : <ChannelView stage={stage} animate={!reduced} />}</div>
      <Legend stage={stage} />
      {stage === 'mix' && (
        <ol className="fd-steps" aria-label="How a Tesla-valve unit mixes the phases">
          {teslaSteps.map((s, i) => (
            <li key={s.title}>
              <span className="fd-step-index" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <strong>{s.title}.</strong> {s.text}
              </span>
            </li>
          ))}
        </ol>
      )}
      <figcaption>
        {stage === 'time'
          ? 'Illustrative only: possible behaviours, not measured results.'
          : 'Channel outline: one of the chip’s four channel networks, traced from the design model. Colours are illustrative: they show how mixing progresses, not a measured flow, and which inlet carries which phase is not specified.'}
      </figcaption>
    </figure>
  );
}
