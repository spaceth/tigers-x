import { campaign, verification } from '../config/facts';
import { MediaFigure, MediaGallery } from './Media';
import { Reveal } from './Reveal';

function Qualification() {
  return (
    <div className="qualify">
      <Reveal className="qualify-intro">
        <h3 className="section-title">Qualified for the station</h3>
        <p>
          Before flight, the cube had to meet the ICE Cubes interface requirements and the safety rules for
          pressurised ISS payloads, across three independent checks.
        </p>
      </Reveal>
      <div className="qualify-grid">
        <Reveal as="section" className="qualify-item" aria-labelledby="qualify-structure" delay={1}>
          <h4 id="qualify-structure">Structure</h4>
          <p>
            Mechanical loading and vibration along all three axes, at Thailand’s Electrical and Electronic Products
            Testing Center (PTEC). Resonance searches before and after each run found no cracking, damage, loose
            parts or change in structural signature.
          </p>
          <p className="qualify-result">Passed</p>
        </Reveal>
        <Reveal as="section" className="qualify-item" aria-labelledby="qualify-emc" delay={2}>
          <h4 id="qualify-emc">Electromagnetic compatibility</h4>
          <table className="qualify-table">
            <caption className="visually-hidden">EMC test results</caption>
            <thead>
              <tr>
                <th scope="col">Test</th>
                <th scope="col">Result</th>
              </tr>
            </thead>
            <tbody>
              {verification.emc.map((t) => (
                <tr key={t.test}>
                  <th scope="row">
                    {t.test}
                    <span>{t.what}</span>
                  </th>
                  <td>{t.final === 'pass' ? 'Pass' : 'Fail'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="qualify-result">Passed</p>
        </Reveal>
        <Reveal as="section" className="qualify-item" aria-labelledby="qualify-chem" delay={3}>
          <h4 id="qualify-chem">Chemical safety</h4>
          <p>
            Assessed by NASA: every reagent, including the trace colourants, is non-corrosive, non-oxidising and
            non-flammable at the quantities flown. Even if both containment layers failed at once, at most about 60 mL
            could be released.
          </p>
          <p className="qualify-result">Approved</p>
        </Reveal>
      </div>
    </div>
  );
}

/** Chapter 6, part one: development on Earth, launch and arrival. Follows the chip chapter. */
export function MissionJourney() {
  return (
    <section id="mission" className="chapter chapter--mission" aria-labelledby="mission-title">
      <div className="container">
        <Reveal className="chapter-intro">
          <p className="eyebrow">Real hardware, real mission</p>
          <h2 id="mission-title" className="chapter-title">
            Built and tested on Earth first.
          </h2>
          <p className="lead">
            TIGERS-X was developed by the AIIM-X Center of Excellence at Chulabhorn Royal Academy with ISHA Lab,
            Panyapiwat Institute of Management and the Thai Microelectronics Center (TMEC) of NSTDA. Fluids were
            prepared in a biosafety cabinet before the cube was sealed for flight.
          </p>
        </Reveal>
        <MediaGallery slotId="development-earth" />
        <Qualification />
      </div>

      <div className="container journey-launch">
        <Reveal className="journey-launch__copy">
          <h3 className="section-title">The journey up</h3>
          <p>
            Packed unpowered, TIGERS-X launched on {campaign.launch} aboard {campaign.vehicle}, a Dragon cargo flight
            to the International Space Station, lifting off from {campaign.launchSite} in Florida.
          </p>
        </Reveal>
      </div>
      <div className="container container--wide">
        <MediaFigure slotId="launch" className="media--full" />
      </div>

      <div className="container journey journey--after-launch">
        <Reveal className="journey-copy">
          <p>
            After Dragon docked, a crew member installed the cube in the ICE Cubes Facility in Columbus, which connects
            power, data and grounding in one step, and the team in Bangkok commissioned it remotely.
          </p>
        </Reveal>
        <div className="journey-media">
          <MediaFigure slotId="dragon-docking" />
        </div>
      </div>
    </section>
  );
}

/** Full-width visual pause after the station context. */
export function PayloadOnStation() {
  return (
    <section className="chapter chapter--pause" aria-label="TIGERS-X aboard the station">
      <div className="container container--wide">
        <MediaFigure slotId="payload-on-iss" className="media--full" />
      </div>
    </section>
  );
}

export function ReturnToEarth() {
  return (
    <section className="chapter chapter--return" aria-labelledby="return-title">
      <div className="container journey journey--reverse">
        <Reveal className="journey-copy">
          <h2 id="return-title" className="section-title">
            Back to Earth
          </h2>
          <p>
            After operations, the crew removed the payload and it was deactivated for the return to Earth aboard a
            cargo vehicle. On the ground the cube is recovered and powered on again, its hardware examined, and the
            post-flight findings benchmarked against the data already sent down from orbit.
          </p>
        </Reveal>
        <div className="journey-media">
          <MediaFigure slotId="return-earth" />
        </div>
      </div>
    </section>
  );
}
