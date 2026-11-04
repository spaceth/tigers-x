import { copy } from '../content';
import { CommandLink } from './CommandLink';
import { MediaFigure } from './Media';
import { StationModel } from './StationModel';

export function StationChapter() {
  return (
    <section id="station" className="chapter chapter--station theme-night" aria-labelledby="station-title">
      <div className="container scroller">
        <div className="scroller-figure">
          <StationModel />
        </div>
        <div className="scroller-steps">
          {copy.station.steps.map((s, i) => (
            <article key={s.title} className="scroller-step" data-step={i}>
              {i === 0 ? (
                <>
                  <p className="eyebrow">{copy.station.eyebrow}</p>
                  <h2 id="station-title" className="chapter-title">
                    {s.title}
                  </h2>
                </>
              ) : (
                <h3 className="beat-title">{s.title}</h3>
              )}
              {s.body.map((p, k) => (
                <p key={k} className={k === 0 ? 'beat-lead' : undefined}>
                  {p}
                </p>
              ))}
              {i === 2 && <MediaFigure slotId="crew-installation" className="media--inline" />}
            </article>
          ))}
        </div>
      </div>

      <div className="container network-block">
        <CommandLink />
      </div>
    </section>
  );
}
