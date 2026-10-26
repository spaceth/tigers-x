import { useRef, useState } from 'react';
import { stickyProgress, useReducedMotion, useScrollFrame } from '../lib/hooks';

/**
 * Scroll-driven path of one command. The signal travels Bangkok → Belgium →
 * the facility → the cube, holds while the experiment runs, then returns.
 * The packet position is written on the diagram each frame; React state changes
 * only when the explanation changes.
 */
const nodes = [
  { title: 'User Home Base', sub: 'Bangkok · YAMCS' },
  { title: 'Mission Control Centre', sub: 'Belgium' },
  { title: 'ICE Cubes Facility', sub: 'On the station' },
  { title: 'TIGERS-X', sub: 'Columbus' },
] as const;

const stages = [
  {
    dir: 'up' as const,
    title: 'A command leaves Bangkok',
    text: 'At the Chulabhorn Royal Academy User Home Base, the team sends a telecommand through YAMCS. A VPN carries it to the ICE Cubes Mission Control Centre in Belgium. The cube has no radio of its own.',
  },
  {
    dir: 'up' as const,
    title: 'Up on the station link',
    text: 'Space Applications Services relays the command onto the station’s space-to-ground link. That link is open only during a signal window, so a command waits when the station is out of contact.',
  },
  {
    dir: 'up' as const,
    title: 'The cube takes the instruction',
    text: 'In Columbus, the ICE Cubes Facility delivers the command over Gigabit Ethernet, on the same connection that supplies the cube’s 12 V.',
  },
  {
    dir: 'up' as const,
    title: 'The experiment runs on board',
    text: 'TIGERS-X runs the experiment from that command. No astronaut is needed.',
  },
  {
    dir: 'down' as const,
    title: 'Recordings start back down',
    text: 'When the cycle ends, video and logs leave the cube along the same path. Between signal windows, a YAMCS instance on the cube stores the files and keeps the experiment state.',
  },
  {
    dir: 'down' as const,
    title: 'Bangkok reads them the same day',
    text: 'The files arrive over secure transfer at the User Home Base. The team begins analysis the same day.',
  },
] as const;

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
          Commanded from Thailand
        </h3>
        <p className="cmd-lead">
          From the User Home Base in Bangkok, YAMCS sent every command up to the cube and brought the recordings
          back down.
        </p>

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
              Uplink · command
            </li>
            <li>
              <span className="cmd-swatch cmd-swatch--down" aria-hidden="true" />
              Downlink · video and logs
            </li>
          </ul>
        </div>

        <ol className="cmd-stage" aria-live={reduced ? 'off' : 'polite'}>
          {stages.map((s, i) => (
            <li key={s.title} className={i === active ? 'is-current' : undefined} aria-hidden={reduced ? undefined : i !== active}>
              <p className="cmd-dir">{s.dir === 'up' ? 'Uplink' : 'Downlink'}</p>
              <h4 className="cmd-stage__title">{s.title}</h4>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="figure-note">
          The moving point follows that path. It is not a trace of the radio signal.
        </p>
      </div>
    </div>
  );
}
