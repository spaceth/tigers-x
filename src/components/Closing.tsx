import { assets, DOCS_URL } from '../config/site';
import { Reveal } from './Reveal';

export function Closing() {
  return (
    <section id="documentation" className="chapter chapter--closing" aria-labelledby="docs-title">
      <div className="container closing">
        <Reveal className="closing-copy">
          <p className="eyebrow">Continue into the engineering</p>
          <h2 id="docs-title" className="chapter-title">
            The full technical story.
          </h2>
          <p className="lead">
            The technical documentation collects the detail this page leaves out: specifications, subsystem
            descriptions, source material and engineering documentation for TIGERS-X.
          </p>
          {DOCS_URL ? (
            <a className="button button--primary" href={DOCS_URL}>
              Explore technical documentation
            </a>
          ) : (
            <p className="cta-pending">
              <span className="cta-pending-title">Explore technical documentation</span>
              <span className="cta-pending-note">The documentation site is forthcoming.</span>
            </p>
          )}
        </Reveal>
      </div>
      <footer className="container site-footer">
        <img src={assets.patch} alt="" width={56} height={56} loading="lazy" />
        <p>
          TIGERS-X — Thailand Innovative G-force Varied Emulsification Research for Space Exploration. Developed by
          Chulabhorn Royal Academy and ISHA Lab with engineering and institutional partners. Operated in the ICE Cubes
          Facility aboard the International Space Station.
        </p>
      </footer>
    </section>
  );
}
