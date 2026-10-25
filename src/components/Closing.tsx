import { publication } from '../config/facts';
import { assets, DOCS_URL, partners } from '../config/site';
import { Reveal } from './Reveal';

export function Closing() {
  return (
    <section id="documentation" className="chapter chapter--closing" aria-labelledby="docs-title">
      <div className="container closing">
        <Reveal className="closing-copy">
          <p className="eyebrow">Continue into the science</p>
          <h2 id="docs-title" className="chapter-title">
            The full technical story.
          </h2>
          <p className="lead">
            The paper covers the design, ground verification and on-orbit results in full. The CAD model, the
            experiment videos and the image-analysis software are openly available.
          </p>
          <div className="closing-actions">
            <a className="button button--primary" href={publication.url} target="_blank" rel="noreferrer">
              Read the paper
            </a>
            <a className="button button--secondary" href={publication.dataUrl} target="_blank" rel="noreferrer">
              Videos, CAD and analysis code
            </a>
          </div>
          <p className="closing-cite">
            {publication.authors}. “{publication.title}.” {publication.venue}. doi:{publication.doi}
          </p>
          {DOCS_URL ? (
            <a className="text-link" href={DOCS_URL}>
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
      <div className="partner-bar">
        <ul className="partner-bar__list container" aria-label="Partners">
          {partners.map((partner) => (
            <li key={partner.id}>
              <img
                className={
                  'mark' in partner
                    ? `partner-logo partner-logo--${partner.id} partner-logo--${partner.mark}`
                    : `partner-logo partner-logo--${partner.id}`
                }
                src={partner.src}
                width={partner.width}
                height={partner.height}
                alt={partner.alt}
              />
            </li>
          ))}
        </ul>
      </div>
      <footer className="site-footer-band theme-navy">
        <div className="container site-footer">
          <img src={assets.patch} alt="" width={56} height={56} loading="lazy" />
          <p>
            TIGERS-X — Thailand Innovative G-force Varied Emulsification Research for Space Exploration. Developed by
            the AIIM-X Center of Excellence, Chulabhorn Royal Academy, with ISHA Lab, Panyapiwat Institute of Management
            and TMEC, NSTDA. Operated in the ICE Cubes Facility aboard the International Space Station.
          </p>
        </div>
      </footer>
    </section>
  );
}
