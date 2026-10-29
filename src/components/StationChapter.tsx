import { CommandLink } from './CommandLink';
import { MediaFigure } from './Media';
import { StationModel } from './StationModel';

const steps = [
  {
    title: 'Installed in Columbus.',
    body: [
      'TIGERS-X operated in Columbus, the European Space Agency laboratory module, on the starboard side of the Harmony node.',
    ],
  },
  {
    title: 'A rack-mounted laboratory.',
    body: [
      'Columbus supplies power, thermal control, and communications to the facilities in its racks. ICE Cubes is one of those facilities.',
    ],
  },
  {
    title: 'The ICE Cubes Facility.',
    body: [
      'Operated by Space Applications Services, the facility accepts compact experiment cubes inside the pressurized module. Each cube connects once, for power and data.',
    ],
    media: true,
  },
  {
    title: 'Crew time limited to two events.',
    body: [
      'The crew installed the cube and removed it at the end of the campaign. Between those events the experiment was commanded from the ground, as the path below shows.',
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
