import { Fragment, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { beats, type Beat } from '../config/story';
import { envelope } from '../config/facts';
import { useNarrow, useReducedMotion } from '../lib/hooks';
import { setStory, useStory } from '../lib/storyStore';
import { ExploreButton, Stage } from '../stage/Stage';
import { FlowDiagram } from './FlowDiagram';

gsap.registerPlugin(ScrollTrigger);

const chapterTitles: Record<NonNullable<Beat['chapter']>, string> = {
  payload: 'The payload',
  subsystems: 'Inside the payload',
  chip: 'The lab-on-a-chip',
};

function EnvelopeFacts() {
  return (
    <dl className="spec-line">
      <div>
        <dt>Envelope</dt>
        <dd>
          {envelope.widthMm} × {envelope.depthMm} × {envelope.heightMm} mm
        </dd>
      </div>
      <div>
        <dt>Volume</dt>
        <dd>{envelope.formFactor}</dd>
      </div>
      <div>
        <dt>Mass</dt>
        <dd>{envelope.massKg} kg</dd>
      </div>
      <div>
        <dt>Power</dt>
        <dd>{envelope.peakPowerW} W peak</dd>
      </div>
    </dl>
  );
}

function ComputingRoles() {
  return (
    <>
      <dl className="role-list">
        <div>
          <dt>Orange Pi single-board computer</dt>
          <dd>Higher-level operation and commanding</dd>
        </div>
        <div>
          <dt>STM32 microcontroller</dt>
          <dd>Pump control</dd>
        </div>
        <div>
          <dt>SSD</dt>
          <dd>Onboard recording</dd>
        </div>
      </dl>
      <p className="beat-note">The microcontroller and the SSD are described here rather than labelled in the model.</p>
    </>
  );
}

function BeatExtra({ extra }: { extra: Beat['extra'] }) {
  switch (extra) {
    case 'envelope':
      return <EnvelopeFacts />;
    case 'computing-roles':
      return <ComputingRoles />;
    case 'flow-deliver':
      return <FlowDiagram stage="deliver" />;
    case 'flow-mix':
      return <FlowDiagram stage="mix" />;
    case 'flow-watch':
      return <FlowDiagram stage="watch" />;
    case 'flow-time':
      return <FlowDiagram stage="time" />;
    case 'explore':
      return <ExploreButton />;
    default:
      return null;
  }
}

function BeatCopy({ beat, index, active }: { beat: Beat; index: number; active: boolean }) {
  const Heading = beat.chapter ? 'h2' : 'h3';
  return (
    <div className={`beat-copy${active ? ' is-active' : ''}`} data-beat={index}>
      {beat.eyebrow && <p className="eyebrow">{beat.eyebrow}</p>}
      <Heading className={beat.headline ? 'chapter-title' : 'beat-title'}>{beat.title}</Heading>
      {beat.body.map((p, i) => (
        <p key={i} className={i === 0 ? 'beat-lead' : undefined}>
          {p}
        </p>
      ))}
      <BeatExtra extra={beat.extra} />
    </div>
  );
}

/** Groups beats into their chapters so each chapter is a real section with an anchor. */
function groupByChapter() {
  const groups: { chapter: NonNullable<Beat['chapter']>; items: { beat: Beat; index: number }[] }[] = [];
  beats.forEach((beat, index) => {
    if (beat.chapter || !groups.length) groups.push({ chapter: beat.chapter ?? 'payload', items: [] });
    groups[groups.length - 1].items.push({ beat, index });
  });
  return groups;
}

const groups = groupByChapter();

export function PayloadStory() {
  const container = useRef<HTMLDivElement>(null);
  const beatEls = useRef<HTMLElement[]>([]);
  const narrow = useNarrow();
  const reduced = useReducedMotion();
  const activeBeat = useStory((s) => s.activeBeat);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let tops: number[] = [];
    let heights: number[] = [];

    const measure = () => {
      const y = window.scrollY;
      tops = beatEls.current.map((b) => b.getBoundingClientRect().top + y);
      heights = beatEls.current.map((b) => Math.max(1, b.offsetHeight));
    };

    // The line at which copy is "being read": mid-viewport on wide screens, the middle of the
    // copy area beneath the sticky stage on narrow screens.
    const readingLine = () => {
      const vh = window.innerHeight;
      if (!narrow) return vh * 0.5;
      const stage = el.querySelector<HTMLElement>('.story-stage .stage-frame');
      const stageBottom = stage ? stage.getBoundingClientRect().bottom : vh * 0.5;
      return Math.max(stageBottom, 0) + (vh - Math.max(stageBottom, 0)) * 0.4;
    };

    const update = () => {
      if (!tops.length) return;
      const line = window.scrollY + readingLine();
      let t: number;
      if (line < tops[0]) t = Math.max(-1, (line - tops[0]) / heights[0]);
      else {
        let i = tops.length - 1;
        while (i > 0 && tops[i] > line) i--;
        t = i + Math.min(1, (line - tops[i]) / heights[i]);
      }
      setStory({ t, activeBeat: Math.min(beats.length - 1, Math.max(0, Math.floor(t))) });
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: update,
      onToggle: update,
      onRefresh: () => {
        measure();
        update();
      },
    });
    measure();
    update();
    // Layout settles after web fonts load; re-measure so deep links land on the right state.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    ro.observe(el);
    return () => {
      st.kill();
      ro.disconnect();
    };
  }, [narrow, reduced]);

  return (
    <div ref={container} className="story" data-reduced={reduced ? 'true' : 'false'}>
      <div className="story-stage">
        <Stage />
      </div>
      <div className="story-copy">
        {groups.map((g) => (
          <section key={g.chapter} id={g.chapter} className="story-chapter" aria-label={chapterTitles[g.chapter]}>
            {g.items.map(({ beat, index }) => (
              <Fragment key={beat.id}>
                <article
                  ref={(node) => {
                    if (node) beatEls.current[index] = node;
                  }}
                  className={`beat beat--${beat.id}${beat.headline ? ' beat--headline' : ''}`}
                >
                  <BeatCopy beat={beat} index={index} active={activeBeat === index} />
                </article>
              </Fragment>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
