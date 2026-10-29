import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { envelope } from '../config/facts';
import { labels, type LabelId } from '../config/story';
import { hasWebGL, useNarrow, useReducedMotion } from '../lib/hooks';
import { setStory } from '../lib/storyStore';
import { registerLabel } from '../stage/labelRegistry';

const StageCanvas = lazy(() => import('../stage/StageCanvas'));

const guideLabels = [
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

/** The flight model, driven by the film clock rather than scroll. */
export function PayloadView({ storyT }: { storyT: number | null }) {
  const narrow = useNarrow();
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unsupported'>('loading');
  const [progress, setProgress] = useState(0);
  const webgl = useRef(hasWebGL());

  useEffect(() => {
    setStory({ exploring: false, selected: null, stageVisible: true, t: 0 });
    return () => setStory({ stageVisible: false, exploring: false });
  }, []);

  useEffect(() => {
    if (storyT == null) return;
    setStory({ t: storyT, stageVisible: true, exploring: false });
  }, [storyT]);

  if (!webgl.current || status === 'unsupported' || status === 'error') {
    return (
      <figure className="film-model-fallback">
        <img
          src="/media/mission/payload-development-2.jpg"
          alt="The open TIGERS-X enclosure on a workbench, showing circuit boards and wiring inside, with the labelled outer panels laid out beside it."
        />
        <figcaption>The open cube during integration. The interactive model is not available in this browser.</figcaption>
      </figure>
    );
  }

  return (
    <div className="stage-frame film-stage">
      <div className="stage-viewport">
        <Suspense fallback={null}>
          <StageCanvas
            narrow={narrow}
            reducedMotion={reduced}
            onReady={() => {
              setStatus('ready');
              setStory({ stageReady: true, stageVisible: true });
            }}
            onError={() => setStatus('error')}
            onProgress={setProgress}
          />
        </Suspense>
        <div className="stage-labels" aria-hidden="true">
          {(Object.keys(labels) as LabelId[]).map((id) => (
            <Label key={id} id={id} text={labels[id].text} />
          ))}
          {guideLabels.map((guide) => (
            <Label key={guide.id} id={guide.id} text={guide.text} guide />
          ))}
        </div>
        {status !== 'ready' && (
          <div className="stage-loading" role="status">
            <span>Loading the flight model</span>
            <span className="stage-loading-bar" aria-hidden="true">
              <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
