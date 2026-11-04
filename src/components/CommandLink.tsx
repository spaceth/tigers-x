import { useRef, useState } from 'react';
import { copy } from '../content';
import { stickyProgress, useReducedMotion, useScrollFrame } from '../lib/hooks';

/**
 * Scroll-driven path of one command. The signal travels Bangkok → Belgium →
 * the facility → the cube, holds while the experiment runs, then returns.
 * The packet position is written on the diagram each frame; React state changes
 * only when the explanation changes.
 */
const nodes = copy.command.nodes;
const stages = copy.command.stages;

/** Node index at each stage boundary. The cube holds, then the path reverses. */
const KEYS = [0, 1, 2, 3, 3, 1, 0];

function nodeAt(progress: number) {
  const x = Math.min(1, Math.max(0, progress)) * (KEYS.length - 1);
  const i = Math.min(KEYS.length - 2, Math.floor(x));
  return KEYS[i] + (KEYS[i + 1] - KEYS[i]) * (x - i);
}

export function CommandLink() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [hot, setHot] = useState(0);

  useScrollFrame(() => {
    const diagram = diagramRef.current;
    if (reduced) {
      diagram?.style.setProperty('--t', '0');
      return;
    }
    const track = trackRef.current;
    const pin = pinRef.current;
    if (!track || !pin || !diagram) return;
    const progress = stickyProgress(track, pin);
    const pos = nodeAt(progress);
    const next = Math.min(stages.length - 1, Math.floor(progress * stages.length));
    diagram.style.setProperty('--t', (pos / (nodes.length - 1)).toFixed(4));
    diagram.dataset.dir = progress < 4 / stages.length ? 'up' : 'down';
    setStage((prev) => (prev === next ? prev : next));
    const nearest = Math.round(Math.min(nodes.length - 1, Math.max(0, pos)));
    setHot((prev) => (prev === nearest ? prev : nearest));
  }, !reduced);

  const active = reduced ? -1 : stage;

  return (
    <div className="link-stick" ref={trackRef} data-reduced={reduced ? 'true' : 'false'}>
      <div className="link-pin" ref={pinRef}>
        <h3 id="command-title" className="section-title">
          {copy.command.title}
        </h3>
        <p className="cmd-lead">{copy.command.lead}</p>

        <div className="cmd" ref={diagramRef} data-dir="up">
          <div className="cmd-path">
          <div className="cmd-rail" aria-hidden="true">
            <span className="cmd-packet" />
          </div>
          <ol className="cmd-nodes">
            {nodes.map((node, i) => (
              <li key={node.title} className={i === (reduced ? -1 : hot) ? 'cmd-node is-current' : 'cmd-node'}>
                <span className="cmd-dot" aria-hidden="true" />
                <span className="cmd-title">{node.title}</span>
                <span className="cmd-sub">{node.sub}</span>
              </li>
            ))}
          </ol>
          </div>
          <ul className="cmd-legend">
            <li>
              <span className="cmd-swatch cmd-swatch--up" aria-hidden="true" />
              {copy.command.uplinkLegend}
            </li>
            <li>
              <span className="cmd-swatch cmd-swatch--down" aria-hidden="true" />
              {copy.command.downlinkLegend}
            </li>
          </ul>
        </div>

        <ol className="cmd-stage" aria-live={reduced ? 'off' : 'polite'}>
          {stages.map((s, i) => (
            <li key={s.title} className={i === active ? 'is-current' : undefined} aria-hidden={reduced ? undefined : i !== active}>
              <p className="cmd-dir">{s.dir === 'up' ? copy.command.uplink : copy.command.downlink}</p>
              <h4 className="cmd-stage__title">{s.title}</h4>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="figure-note">{copy.command.note}</p>
      </div>
    </div>
  );
}
