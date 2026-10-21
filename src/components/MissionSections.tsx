import { MediaFigure, MediaGallery } from './Media';
import { Reveal } from './Reveal';

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
            TIGERS-X was developed on the ground by Chulabhorn Royal Academy and ISHA Lab, with engineering and
            institutional partners, before it was prepared for flight.
          </p>
        </Reveal>
        <MediaGallery slotId="development-earth" />
      </div>

      <div className="container journey">
        <Reveal className="journey-copy">
          <h3 className="section-title">The journey up</h3>
          <p>
            Packed for launch, the payload travelled to the International Space Station, arriving with a Dragon
            spacecraft before crew moved it to its place in Columbus.
          </p>
        </Reveal>
        <div className="journey-media">
          <MediaFigure slotId="launch" />
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
            After operations, the payload was removed by the crew and returned to Earth aboard Dragon. Its onboard
            recordings came home with it, for the research team to retrieve after landing.
          </p>
        </Reveal>
        <div className="journey-media">
          <MediaFigure slotId="return-earth" />
        </div>
      </div>
    </section>
  );
}
