import { lazy, Suspense, useEffect, useState, type MouseEvent } from 'react';
import { assets } from '../config/site';
import { specCopy } from '../content';
import { LanguageSwitch } from './LanguageSwitch';
import '../styles/specification.css';

const SpecModel = lazy(() => import('./SpecModel'));

const toc = specCopy.toc;
type SectionId = (typeof toc)[number]['id'];

function SpecFigure({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="spec-figure">
      <img src={src} width={1123} height={794} alt={alt} />
    </figure>
  );
}

function showSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : behavior, block: 'start' });
}

export function SpecificationPage() {
  const [active, setActive] = useState<SectionId>('overview');
  const page = specCopy;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = page.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDesc = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', page.meta.description);
    return () => {
      document.title = previousTitle;
      if (previousDesc !== null) meta?.setAttribute('content', previousDesc);
    };
  }, [page.meta.description, page.meta.title]);

  useEffect(() => {
    const els = toc.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const current = toc.find((item) => visible.has(item.id));
        if (current) setActive(current.id);
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    if (Math.abs(el.getBoundingClientRect().top) > 80) showSection(id, 'auto');
  }, []);

  function selectSection(event: MouseEvent<HTMLAnchorElement>, id: SectionId) {
    event.preventDefault();
    showSection(id);
    history.pushState(null, '', `#${id}`);
    setActive(id);
  }

  return (
    <div className="spec-page">
      <a className="skip-link" href="#overview">
        {page.chrome.skip}
      </a>
      <div className="spec-wrap">
        <header className="spec-header">
          <a className="spec-home" href="/">
            <img src={assets.patch} alt="" width={28} height={28} />
            <span>{page.chrome.wordmark}</span>
          </a>
          <div className="spec-header-tools">
            <a className="spec-back" href="/">
              {page.chrome.back}
            </a>
            <LanguageSwitch label={page.chrome.language} unavailableLabel={page.chrome.languageUnavailable} />
          </div>
        </header>
        <div className="spec-layout">
          <nav className="spec-toc" aria-label={page.chrome.tocLabel}>
            <p className="spec-toc-label">{page.chrome.tocLabel}</p>
            <ol>
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'location' : undefined}
                    onClick={(event) => selectSection(event, item.id)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <article className="spec-main">
            <p className="spec-kicker">{page.header.kicker}</p>
            <h1 className="spec-title">{page.header.title}</h1>
            <p className="spec-lead">{page.header.lead}</p>
            <ul className="spec-sources">
              {page.header.sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>

            <section className="spec-section" id="overview" aria-labelledby="overview-title">
              <h2 id="overview-title">{page.overview.title}</h2>
              {page.overview.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.overview.identityCaption}</caption>
                  <tbody>
                    {page.overview.identity.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3>{page.overview.featuresTitle}</h3>
              <ul>
                {page.overview.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>

            <section className="spec-section" id="mechanical" aria-labelledby="mechanical-title">
              <h2 id="mechanical-title">{page.mechanical.title}</h2>
              <Suspense
                fallback={
                  <p className="spec-model-status" role="status">
                    {page.chrome.modelLoading}
                  </p>
                }
              >
                <SpecModel />
              </Suspense>
              <p>{page.mechanical.intro}</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.mechanical.envelopeCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{page.mechanical.parameter}</th>
                      <th scope="col">{page.mechanical.value}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.mechanical.envelope.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.mechanical.partsCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{page.mechanical.item}</th>
                      <th scope="col">{page.mechanical.part}</th>
                      <th scope="col">{page.mechanical.qty}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.mechanical.parts.map((row) => (
                      <tr key={row.item}>
                        <th scope="row">{row.item}</th>
                        <td>{row.part}</td>
                        <td>{row.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="spec-section" id="electrical" aria-labelledby="electrical-title">
              <h2 id="electrical-title">{page.electrical.title}</h2>
              <figure className="spec-figure spec-figure--connector">
                <img
                  src="/media/spec/DB13W3.svg"
                  width={300}
                  height={81}
                  alt={page.electrical.connectorAlt}
                />
              </figure>
              <p>{page.electrical.intro}</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.electrical.contactsCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{page.electrical.contact}</th>
                      <th scope="col">{page.electrical.function}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.electrical.contacts.map((row) => (
                      <tr key={row.pin}>
                        <th scope="row">{row.pin}</th>
                        <td>{row.function}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3>{page.electrical.phasesTitle}</h3>
              <p>{page.electrical.phasesIntro}</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.electrical.phasesCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{page.electrical.mode}</th>
                      <th scope="col">{page.electrical.duration}</th>
                      <th scope="col">{page.electrical.consumption}</th>
                      <th scope="col">{page.electrical.peak}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.electrical.phases.map((row) => (
                      <tr key={row.mode}>
                        <th scope="row">{row.mode}</th>
                        <td>{row.duration}</td>
                        <td>{row.consumption}</td>
                        <td>{row.peak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3>{page.electrical.limitsTitle}</h3>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.electrical.limitsCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{page.mechanical.parameter}</th>
                      <th scope="col">{page.electrical.minimum}</th>
                      <th scope="col">{page.electrical.nominal}</th>
                      <th scope="col">{page.electrical.maximum}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.electrical.limits.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        <td>{row.min}</td>
                        <td>{row.nominal}</td>
                        <td>{row.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="spec-section" id="imaging" aria-labelledby="imaging-title">
              <h2 id="imaging-title">{page.imaging.title}</h2>
              <SpecFigure src="/media/spec/Cam_View1.svg" alt={page.imaging.figureAlt} />
              <p>{page.imaging.intro}</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.imaging.processingCaption}</caption>
                  <tbody>
                    {page.imaging.processing.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.imaging.cameraCaption}</caption>
                  <tbody>
                    {page.imaging.camera.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="spec-section" id="data" aria-labelledby="data-title">
              <h2 id="data-title">{page.data.title}</h2>
              <SpecFigure src="/media/spec/EE_View1.svg" alt={page.data.figureAlt} />
              <p>{page.data.intro}</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.data.linkCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{page.data.parameter}</th>
                      <th scope="col">{page.data.downlink}</th>
                      <th scope="col">{page.data.uplink}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.data.link.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        <td>{row.downlink}</td>
                        <td>{row.uplink}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3>{page.data.pathTitle}</h3>
              <p>{page.data.path}</p>
              <h3>{page.data.bulkTitle}</h3>
              <p>{page.data.bulk}</p>
            </section>

            <section className="spec-section" id="fluidics" aria-labelledby="fluidics-title">
              <h2 id="fluidics-title">{page.fluidics.title}</h2>
              <p>{page.fluidics.intro}</p>
              <h3>{page.fluidics.pumpsTitle}</h3>
              <SpecFigure src="/media/spec/Pump_View1.svg" alt={page.fluidics.pumpsAlt} />
              <p>{page.fluidics.pumps}</p>
              <h3>{page.fluidics.storageTitle}</h3>
              <SpecFigure src="/media/spec/Res_View1.svg" alt={page.fluidics.storageAlt} />
              <p>{page.fluidics.storage}</p>
              <h3>{page.fluidics.mixerTitle}</h3>
              <SpecFigure src="/media/spec/Fluidic_View1.svg" alt={page.fluidics.mixerAlt} />
              <p>{page.fluidics.mixer}</p>
            </section>

            <section className="spec-section" id="safety" aria-labelledby="safety-title">
              <h2 id="safety-title">{page.safety.title}</h2>
              <p>{page.safety.intro}</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.safety.emcCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{page.safety.test}</th>
                      <th scope="col">{page.safety.description}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.safety.emc.map((row) => (
                      <tr key={row.test}>
                        <th scope="row">{row.test}</th>
                        <td>{row.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3>{page.safety.crewTitle}</h3>
              <p>{page.safety.crewIntro}</p>
              <div className="spec-scroll">
                <table className="spec-table">
                  <caption>{page.safety.crewCaption}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{page.safety.hazard}</th>
                      <th scope="col">{page.safety.standard}</th>
                      <th scope="col">{page.safety.result}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {page.safety.hazards.map((row) => (
                      <tr key={row.hazard}>
                        <th scope="row">{row.hazard}</th>
                        <td>{row.standard}</td>
                        <td>{row.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="spec-section" id="contact" aria-labelledby="contact-title">
              <h2 id="contact-title">{page.contact.title}</h2>
              <address className="spec-contact">
                {page.contact.lines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
                <a href={page.contact.phoneHref}>{page.contact.phone}</a>
                <br />
                <a href={page.contact.emailHref}>{page.contact.email}</a>
                <br />
                {page.contact.labLabel} <a href={page.contact.labHref}>{page.contact.lab}</a>
              </address>
              <p className="spec-footer">{page.contact.footer}</p>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}
