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
      'Crew install the payload and remove it at the end of operations. In between, no astronaut is needed: the research team commands the experiment from Earth.',
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
    <section id="station" className="chapter chapter--station theme-night" aria-labelledby="station-title">
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
            Every experiment ran under ground control from the Chulabhorn Royal Academy User Home Base in Bangkok,
            using YAMCS telecommand and telemetry. The traffic passes through the facility and the station’s
            infrastructure — a hosted service, not a dedicated payload radio link — and the ICE Cubes Mission Control
            Centre in Belgium relays it to Bangkok.
          </p>
          <p>
            After each experiment cycle, video and logs were sent down over secure file transfer in near real time,
            and analysis began the same day.
          </p>
          <p className="muted">
            Ground contact is only possible in signal windows, so a YAMCS instance on the payload’s own computer
            buffers data and keeps the experiment state in between.
          </p>
        </Reveal>
        <Reveal as="ol" className="network" delay={1}>
          <li className="network-node network-node--accent">
            <span className="network-title">TIGERS-X</span>
            <span className="network-sub">Experiment cube, Columbus</span>
          </li>
          <li className="network-link">
            <span>+12 V and Gigabit Ethernet</span>
          </li>
          <li className="network-node">
            <span className="network-title">ICE Cubes Facility</span>
            <span className="network-sub">Station data infrastructure</span>
          </li>
          <li className="network-link">
            <span>Space-to-ground link</span>
          </li>
          <li className="network-node">
            <span className="network-title">ICE Cubes Mission Control Centre</span>
            <span className="network-sub">Space Applications Services, Belgium</span>
          </li>
          <li className="network-link">
            <span>VPN</span>
          </li>
          <li className="network-node">
            <span className="network-title">User Home Base</span>
            <span className="network-sub">Chulabhorn Royal Academy, Bangkok · YAMCS</span>
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
