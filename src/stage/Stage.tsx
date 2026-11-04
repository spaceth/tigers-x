import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { explorerEntries } from '../config/explorer';
import { labels, type LabelId } from '../config/story';
import { assets } from '../config/site';
import { envelope } from '../config/facts';
import { copy } from '../content';
import { hasWebGL, useNarrow, useReducedMotion } from '../lib/hooks';
import { setStory, useStory } from '../lib/storyStore';
import { registerLabel } from './labelRegistry';

const StageCanvas = lazy(() => import('./StageCanvas'));

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported';

const guideLabels: { id: string; text: string }[] = [
  { id: 'guide-x', text: `${envelope.widthMm} mm` },
  { id: 'guide-z', text: `${envelope.depthMm} mm` },
  { id: 'guide-y', text: `${envelope.heightMm} mm` },
];

function Label({ id, text, guide }: { id: string; text: string; guide?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<SVGLineElement>(null);
  useEffect(() => {
    if (box.current && line.current) registerLabel(id, { box: box.current, line: line.current });
    return () => registerLabel(id, null);
  }, [id]);
  return (
    <>
      <svg className="stage-label-line" aria-hidden="true">
        <line ref={line} style={{ opacity: 0 }} />
      </svg>
      <div ref={box} className={guide ? 'stage-label stage-label--guide' : 'stage-label'} style={{ opacity: 0, visibility: 'hidden' }}>
        {text}
      </div>
    </>
  );
}

export function StaticFallback({ reason }: { reason: 'unsupported' | 'error' }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <figure className="stage-fallback">
      {imgOk ? (
        <img
          src={assets.modelSnapshot}
          alt={copy.stage.fallbackAlt}
          onError={() => setImgOk(false)}
        />
      ) : (
        <svg viewBox="0 0 340 220" role="img" aria-label={copy.stage.fallbackAria}>
          <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
            <path d="M40 120 L160 70 L280 120 L160 170 Z" />
            <path d="M40 120 L40 150 L160 200 L280 150 L280 120" />
            <path d="M160 170 L160 200" />
          </g>
          <g fontSize="11" fill="currentColor" fontFamily="inherit">
            <text x="86" y="200">200 mm</text>
            <text x="222" y="200">200 mm</text>
            <text x="286" y="140">100 mm</text>
          </g>
        </svg>
      )}
      <figcaption>
        {reason === 'unsupported' ? copy.stage.unsupported : copy.stage.error}
      </figcaption>
    </figure>
  );
}

export function Stage() {
  const narrow = useNarrow();
  const reducedMotion = useReducedMotion();
  const exploring = useStory((s) => s.exploring);
  const selected = useStory((s) => s.selected);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  // Start loading once the browser is idle so the opening copy is never delayed.
  useEffect(() => {
    if (!hasWebGL()) {
      setStatus('unsupported');
      return;
    }
    const start = () => setStatus((s) => (s === 'idle' ? 'loading' : s));
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 1500 });
    else setTimeout(start, 300);
  }, []);

  // Only render while the stage is on screen.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStory({ stageVisible: e.isIntersecting }), { rootMargin: '100px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onReady = useCallback(() => {
    setStatus('ready');
    setStory({ stageReady: true });
  }, []);
  const onError = useCallback((err: Error) => {
    console.error('[TIGERS-X] 3D stage unavailable:', err);
    setStatus('error');
    setStory({ stageReady: false, exploring: false });
  }, []);
  const onProgress = useCallback((f: number) => setProgress(f), []);

  // Explore mode: modal layer with focus management and Escape to return.
  const exitExplore = useCallback(() => setStory({ exploring: false, selected: null }), []);
  useEffect(() => {
    if (!exploring) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
    html.classList.add('is-exploring');
    panelHeading.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitExplore();
      if (e.key === 'Tab' && frame.current) {
        const focusables = frame.current.querySelectorAll<HTMLElement>('button, [href], [tabindex="0"]');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      html.style.overflow = prevOverflow;
      html.classList.remove('is-exploring');
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [exploring, exitExplore]);

  const selectedEntry = explorerEntries.find((e) => e.id === selected) ?? null;
  const showCanvas = status === 'loading' || status === 'ready';

  return (
    <div
      ref={frame}
      className={`stage-frame${exploring ? ' is-exploring' : ''}`}
      role={exploring ? 'dialog' : undefined}
      aria-modal={exploring || undefined}
      aria-labelledby={exploring ? 'explore-title' : undefined}
    >
      <div className="stage-viewport">
        {showCanvas && (
          <Suspense fallback={null}>
            <StageCanvas narrow={narrow} reducedMotion={reducedMotion} onReady={onReady} onError={onError} onProgress={onProgress} />
          </Suspense>
        )}
        {(status === 'unsupported' || status === 'error') && <StaticFallback reason={status} />}
        {showCanvas && (
          <div className="stage-labels" aria-hidden="true">
            {(Object.keys(labels) as LabelId[]).map((id) => (
              <Label key={id} id={id} text={labels[id].text} />
            ))}
            {guideLabels.map((g) => (
              <Label key={g.id} id={g.id} text={g.text} guide />
            ))}
          </div>
        )}
        {(status === 'idle' || status === 'loading') && (
          <div className="stage-loading" role="status">
            <span>{copy.stage.loading}</span>
            <span className="stage-loading-bar" aria-hidden="true">
              <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
            </span>
            <span className="visually-hidden">{Math.round(progress * 100)} percent</span>
          </div>
        )}      </div>

      {exploring && (
        <div className="explore-panel">
          <h2 id="explore-title" ref={panelHeading} tabIndex={-1}>
            {copy.stage.exploreTitle}
          </h2>
          <p className="explore-hint">{copy.stage.exploreHint}</p>
          <div className="explore-list" role="group" aria-label={copy.stage.subsystemsAria}>
            {explorerEntries.map((e) => (
              <button
                key={e.id}
                type="button"
                className="explore-chip"
                aria-pressed={selected === e.id}
                onClick={() => setStory({ selected: selected === e.id ? null : e.id })}
              >
                {e.title}
              </button>
            ))}
          </div>
          <div className="explore-detail" aria-live="polite">
            {selectedEntry ? (
              <>
                <h3>{selectedEntry.title}</h3>
                <p>{selectedEntry.description}</p>
              </>
            ) : (
              <p>{copy.stage.selectPrompt}</p>
            )}
          </div>
          <button type="button" className="button button--primary explore-return" onClick={exitExplore}>
            {copy.stage.close}
          </button>
        </div>
      )}
    </div>
  );
}

export function ExploreButton() {
  const ready = useStory((s) => s.stageReady);
  if (!ready) return <p className="beat-note">{copy.stage.explorePending}</p>;
  return (
    <button type="button" className="button explore-open" onClick={() => setStory({ exploring: true, selected: null })}>
      {copy.stage.exploreButton}
    </button>
  );
}
