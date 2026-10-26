import { academicResources } from '../config/facts';
import { assets, DOCS_URL, partners } from '../config/site';
import { Reveal } from './Reveal';

export function Closing() {
  const resources = academicResources.map((item) =>
    item.id === 'manual' ? { ...item, href: DOCS_URL } : item,
  );

  return (
    <section id="documentation" className="chapter chapter--closing" aria-labelledby="docs-title">
      <div className="container closing">
        <Reveal className="closing-copy">
          <p className="eyebrow">Academic resources</p>
          <h2 id="docs-title" className="chapter-title">
            Papers, data and the manual.
          </h2>
          <p className="lead">
            The flight paper, the parabolic-flight study that came before it, and the recordings and CAD from the
            station.
          </p>
        </Reveal>
        <Reveal>
          <div className="resource-scroll">
            <table className="resource-table">
              <caption className="visually-hidden">Academic resources</caption>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Description</th>
                  <th scope="col">Link</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">{item.name}</th>
                    <td>{item.type}</td>
                    <td>{item.description}</td>
                    <td>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noreferrer">
                          {item.linkLabel}
                          <span className="visually-hidden"> {item.name}</span>
                        </a>
                      ) : (
                        <span className="resource-soon">Coming soon</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="resource-note">More scientific resources are on the way.</p>
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
