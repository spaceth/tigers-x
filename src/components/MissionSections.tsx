import { campaign, mixingFindings, mixingIndex, verification, type ChannelRowId } from '../config/facts';
import { MediaFigure, MediaGallery, MediaSlideshow } from './Media';
import { Reveal } from './Reveal';

function Qualification() {
  return (
    <div className="qualify">
      <Reveal className="qualify-intro">
        <h3 className="section-title">Three independent checks</h3>
        <p>
          Before handover the cube was verified against the ICE Cubes interface requirements and the safety
          requirements for pressurized ISS payloads.
        </p>
      </Reveal>
      <div className="qualify-grid">
        <Reveal as="section" className="qualify-item" aria-labelledby="qualify-structure" delay={1}>
          <h4 id="qualify-structure">Structure</h4>
          <p>
            Mechanical loading and vibration on all three axes, at Thailand’s Electrical and Electronic Products
            Testing Center (PTEC). Inspection before, during, and after each run found no cracking, loose parts,
            or change in structural signature.
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
                  <td>
                    <span className="qualify-result">{t.final === 'pass' ? 'Pass' : 'Fail'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <Reveal as="section" className="qualify-item" aria-labelledby="qualify-chem" delay={3}>
          <h4 id="qualify-chem">Chemical safety</h4>
          <p>
            NASA assessed every reagent, including the trace colorants, as non-corrosive, non-oxidizing, and
            non-flammable at the quantities flown. If both containment layers failed together, the releasable volume
            would be at most about 60 mL.
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
          <p className="eyebrow">Assembly, integration, and testing</p>
          <h2 id="mission-title" className="chapter-title">
            Qualified before flight.
          </h2>
          <p className="lead">
            The AIIM-X Center of Excellence at Chulabhorn Royal Academy built the cube with ISHA Lab, Panyapiwat
            Institute of Management, and the Thai Microelectronics Center (TMEC), NSTDA. Fluids were prepared under
            sterile conditions in a class II biosafety cabinet, then sealed for flight.
          </p>
        </Reveal>
        <MediaGallery slotId="development-earth" />
        <Qualification />
      </div>
    </section>
  );
}

/** Launch, docking, and installation. Its own anchor so the header can land here. */
export function LaunchJourney() {
  return (
    <section id="launch" className="chapter chapter--launch" aria-labelledby="launch-title">
      <div className="container journey-launch">
        <Reveal className="journey-launch__copy">
          <h2 id="launch-title" className="section-title">
            Launch and installation
          </h2>
          <p>
            The cube was transported unpowered. It launched on {campaign.launch} on {campaign.vehicle} from{' '}
            {campaign.launchSite}.
          </p>
        </Reveal>
      </div>
      <div className="container container--wide">
        <MediaFigure slotId="launch" className="media--full" />
      </div>

      <div className="container journey journey--after-launch">
        <Reveal className="journey-copy">
          <p>
            After docking, a crew member installed the cube in the ICE Cubes Facility in Columbus. That single
            interface provides power, data, and grounding. The User Home Base in Bangkok then completed remote
            commissioning. From that point the science runs required no further crew involvement.
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
        <MediaSlideshow slotId="payload-on-iss" className="media--full" />
      </div>
    </section>
  );
}

const outlet = (id: ChannelRowId) => mixingIndex.find((row) => row.id === id)!.final.toFixed(2);

/** Science operations on the lab-on-chip, between installation and the return. */
export function ScienceOperations() {
  return (
    <section id="operations" className="chapter chapter--operations" aria-labelledby="operations-title">
      <div className="container">
        <Reveal className="chapter-intro">
          <p className="eyebrow">Science operations</p>
          <h2 id="operations-title" className="chapter-title">
            Flow behavior in the channels.
          </h2>
          <p className="lead">
            Over ten days the chip was imaged under sustained microgravity. The sequence is the qualitative record.
            The mixing index is the quantitative one.
          </p>
        </Reveal>
      </div>

      <div className="container container--wide">
        <MediaFigure slotId="science-operations" className="media--full" />
      </div>

      <div className="container">
        <Reveal className="ops-copy">
          <p>
            Every science cycle was commanded from Bangkok through YAMCS. Eight pumps metered the oil and aqueous
            phases into four Tesla-valve channels, CH1 and CH2, each with two rows. Paired camera views were stitched
            into one panorama, and an in-frame color swatch corrected each session. Video and logs were downlinked
            after each cycle and examined the same day.
          </p>
          <p>
            At event 1, both devices showed the same front: oil leading, the downstream channel still empty. By event
            2 they had diverged. Water penetrated the serpentine path of CH1, while CH2 remained largely oil. At
            events 3 and 4 the split was sharper. In CH1 the aqueous phase occupied most of the visible channel and
            oil was confined to the rim. In CH2, oil occupied most of the length and water remained near the inlet.
          </p>
          <p>
            The cumulative mixing index, from 1 for a water hue to 2 for an oil hue, converged within the first{' '}
            {mixingFindings.convergedWithinPct}% of channel length in all four rows and then remained nearly flat. At
            event 4 the outlet values were {outlet('CH1-1')} and {outlet('CH1-2')} on CH1, and {outlet('CH2-1')} and{' '}
            {outlet('CH2-2')} on CH2. The CH1 rows were nearly symmetric. The CH2 rows were not. Pumping maintained
            the flow. The channel geometry set the phase distribution.
          </p>
        </Reveal>
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
            Recovery
          </h2>
          <p>
            After the campaign the crew removed the cube. It was deactivated and returned on a cargo vehicle. On the
            ground it is powered on again so that post-flight measurements can be compared with the on-orbit data.
            That comparison is the third stage of the concept of operations, and it is still in progress.
          </p>
        </Reveal>
        <div className="journey-media">
          <MediaFigure slotId="return-earth" />
        </div>
      </div>
    </section>
  );
}
