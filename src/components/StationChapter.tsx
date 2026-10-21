import { useEffect, useRef, useState } from 'react';
import { MediaFigure } from './Media';
import { Reveal } from './Reveal';
import { StationSchematic } from './StationSchematic';

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
      'Crew install the payload and remove it at the end of operations. In between, the research team commands the experiment from Earth.',
    ],
  },
];

export function StationChapter() {
  const [active, setActive] = useState(0);
  const stepEls = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: '-48% 0px -48% 0px' },
    );
    stepEls.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="station" className="chapter chapter--station" aria-labelledby="station-title">
      <div className="container scroller">
        <div className="scroller-figure">
          <StationSchematic active={active} />
        </div>
        <div className="scroller-steps">
          {steps.map((s, i) => (
            <article
              key={s.title}
              className="scroller-step"
              data-step={i}
              ref={(n) => {
                if (n) stepEls.current[i] = n;
              }}
            >
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
        <Reveal className="network-intro">
          <h3 className="section-title">Commanded from Thailand</h3>
          <p>
            Commands and experiment data travel through the facility and the station’s infrastructure — a hosted
            service, not a dedicated payload radio link. Space Applications Services in Belgium connects the payload
            to the research team’s mission control in Thailand.
          </p>
          <p className="muted">
            Ground contact is not continuous, so recordings are also stored onboard and returned when the link allows.
          </p>
        </Reveal>
        <Reveal as="ol" className="network" delay={1}>
          <li className="network-node network-node--accent">
            <span className="network-title">TIGERS-X</span>
            <span className="network-sub">Experiment cube, Columbus</span>
          </li>
          <li className="network-link">
            <span>Power and data</span>
          </li>
          <li className="network-node">
            <span className="network-title">ICE Cubes Facility</span>
            <span className="network-sub">Station data infrastructure</span>
          </li>
          <li className="network-link">
            <span>Space-to-ground link</span>
          </li>
          <li className="network-node">
            <span className="network-title">Space Applications Services</span>
            <span className="network-sub">ICE Cubes mission control, Belgium</span>
          </li>
          <li className="network-link">
            <span>Ground connection</span>
          </li>
          <li className="network-node">
            <span className="network-title">TIGERS-X mission control</span>
            <span className="network-sub">Research team, Thailand</span>
          </li>
        </Reveal>
        <p className="network-legend">
          Each link carries traffic both ways: commands from Thailand toward the payload, experiment data back to the
          team.
        </p>
      </div>
    </section>
  );
}
