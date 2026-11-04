import { academicResources } from '../config/facts';
import { assets, DOCS_URL, partners } from '../config/site';
import { copy } from '../content';
import { Reveal } from './Reveal';

export function Closing() {
  const resources = academicResources.map((item) =>
    item.id === 'manual' ? { ...item, href: DOCS_URL } : item,
  );

  return (
    <section id="documentation" className="chapter chapter--closing" aria-labelledby="docs-title">
      <div className="container closing">
        <Reveal className="closing-copy">
          <p className="eyebrow">{copy.closing.eyebrow}</p>
          <h2 id="docs-title" className="chapter-title">
            {copy.closing.title}
          </h2>
          <p className="lead">{copy.closing.lead}</p>
        </Reveal>
        <Reveal>
          <div className="resource-scroll">
            <table className="resource-table">
              <caption className="visually-hidden">{copy.closing.caption}</caption>
              <thead>
                <tr>
                  <th scope="col">{copy.closing.name}</th>
                  <th scope="col">{copy.closing.type}</th>
                  <th scope="col">{copy.closing.description}</th>
                  <th scope="col">{copy.closing.link}</th>
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
                        <a
                          className="button button--primary"
                          href={item.href}
                          {...(/^https?:\/\//.test(item.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                        >
                          {item.linkLabel}
                          <span className="visually-hidden"> {item.name}</span>
                        </a>
                      ) : (
                        <span className="resource-soon">{copy.closing.soon}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="resource-note">{copy.closing.note}</p>
        </Reveal>
      </div>
      <div className="partner-bar">
        <ul className="partner-bar__list container" aria-label={copy.closing.partnersAria}>
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
          <div>
            <p>{copy.closing.footer}</p>
            <p className="site-footer__copy">{copy.closing.copyright}</p>
          </div>
        </div>
      </footer>
    </section>
  );
}
