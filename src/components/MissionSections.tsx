import { campaign, mixingFindings, mixingIndex, verification, type ChannelRowId } from '../config/facts';
import { copy, fill } from '../content';
import { MediaFigure, MediaGallery, MediaSlideshow } from './Media';
import { Reveal } from './Reveal';

function Qualification() {
  return (
    <div className="qualify">
      <Reveal className="qualify-intro">
        <h3 className="section-title">{copy.mission.qualifyTitle}</h3>
        <p>{copy.mission.qualifyIntro}</p>
      </Reveal>
      <div className="qualify-grid">
        <Reveal as="section" className="qualify-item" aria-labelledby="qualify-structure" delay={1}>
          <h4 id="qualify-structure">{copy.mission.structureTitle}</h4>
          <p>{copy.mission.structure}</p>
          <p className="qualify-result">{copy.mission.passed}</p>
        </Reveal>
        <Reveal as="section" className="qualify-item" aria-labelledby="qualify-emc" delay={2}>
          <h4 id="qualify-emc">{copy.mission.emcTitle}</h4>
          <table className="qualify-table">
            <caption className="visually-hidden">{copy.mission.emcCaption}</caption>
            <thead>
              <tr>
                <th scope="col">{copy.mission.emcTest}</th>
                <th scope="col">{copy.mission.emcResult}</th>
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
                    <span className="qualify-result">{t.final === 'pass' ? copy.mission.pass : copy.mission.fail}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <Reveal as="section" className="qualify-item" aria-labelledby="qualify-chem" delay={3}>
          <h4 id="qualify-chem">{copy.mission.chemTitle}</h4>
          <p>{copy.mission.chem}</p>
          <p className="qualify-result">{copy.mission.approved}</p>
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
          <p className="eyebrow">{copy.mission.eyebrow}</p>
          <h2 id="mission-title" className="chapter-title">
            {copy.mission.title}
          </h2>
          <p className="lead">{copy.mission.lead}</p>
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
            {copy.launch.title}
          </h2>
          <p>
            {fill(copy.launch.transport, {
              launch: campaign.launch,
              vehicle: campaign.vehicle,
              launchSite: campaign.launchSite,
            })}
          </p>
        </Reveal>
      </div>
      <div className="container container--wide">
        <MediaFigure slotId="launch" className="media--full" />
      </div>

      <div className="container journey journey--after-launch">
        <Reveal className="journey-copy">
          <p>{copy.launch.afterDocking}</p>
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
    <section className="chapter chapter--pause" aria-label={copy.station.pauseAria}>
      <div className="container container--wide">
        <MediaSlideshow slotId="payload-on-iss" className="media--full" />
      </div>
    </section>
  );
}

const outlet = (id: ChannelRowId) => mixingIndex.find((row) => row.id === id)!.final.toFixed(2);

/** Science operations on the lab-on-chip, between installation and the return. */
export function ScienceOperations() {
  const [first, second, third] = copy.operations.paragraphs;
  return (
    <section id="operations" className="chapter chapter--operations" aria-labelledby="operations-title">
      <div className="container">
        <Reveal className="chapter-intro">
          <p className="eyebrow">{copy.operations.eyebrow}</p>
          <h2 id="operations-title" className="chapter-title">
            {copy.operations.title}
          </h2>
          <p className="lead">{copy.operations.lead}</p>
        </Reveal>
      </div>

      <div className="container container--wide">
        <MediaFigure slotId="science-operations" className="media--full" />
      </div>

      <div className="container">
        <Reveal className="ops-copy">
          <p>{first}</p>
          <p>{second}</p>
          <p>
            {fill(third, {
              convergedWithinPct: mixingFindings.convergedWithinPct,
              ch11: outlet('CH1-1'),
              ch12: outlet('CH1-2'),
              ch21: outlet('CH2-1'),
              ch22: outlet('CH2-2'),
            })}
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
            {copy.return.title}
          </h2>
          <p>{copy.return.body}</p>
        </Reveal>
        <div className="journey-media">
          <MediaFigure slotId="return-earth" />
        </div>
      </div>
    </section>
  );
}
