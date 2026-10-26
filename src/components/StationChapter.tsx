import { CommandLink } from './CommandLink';
import { MediaFigure } from './Media';
import { StationModel } from './StationModel';

const steps = [
  {
    title: 'A small laboratory. Inside a much larger one.',
    body: [
      'TIGERS-X operated aboard the International Space Station, inside Columbus, the European Space Agency’s laboratory module.',
      'Columbus is attached to the starboard side of the Harmony node, at the forward end of the station.',
    ],
  },
  {
    title: 'Columbus, Europe’s laboratory.',
    body: [
      'Research facilities are mounted in equipment racks inside Columbus, which supplies them with power, temperature regulation and communications. One of these facilities is ICE Cubes.',
    ],
  },
  {
    title: 'ICE Cubes: a plug-in research facility.',
    body: [
      'The ICE Cubes Facility, run by Space Applications Services, hosts compact experiment cubes inside the pressurised module. Each cube plugs into the facility for power and a data connection.',
    ],
    media: true,
  },
  {
    title: 'TIGERS-X, twenty centimetres across.',
    body: [
      'Crew install the payload and remove it at the end of operations. In between, no astronaut is needed: the research team commands the experiment from Earth.',
    ],
  },
];

export function StationChapter() {
  return (
    <section id="station" className="chapter chapter--station theme-night" aria-labelledby="station-title">
      <div className="container scroller">
        <div className="scroller-figure">
          <StationModel />
        </div>
        <div className="scroller-steps">
          {steps.map((s, i) => (
            <article key={s.title} className="scroller-step" data-step={i}>
              {i === 0 ? (
                <>
                  <p className="eyebrow">Aboard the ISS</p>
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
              {s.media && <MediaFigure slotId="crew-installation" className="media--inline" />}
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
