import { platformLabels, platformRows } from '../config/science';
import { assets } from '../config/site';
import { MediaFigure } from './Media';
import { Reveal } from './Reveal';

/** Parabolic flight versus ISS, as reported in the TIGERS-X paper. */
export function PlatformComparison() {
  return (
    <section className="container platforms" aria-labelledby="platforms-title">
      <Reveal className="platforms-intro">
        <h2 id="platforms-title" className="science-heading">
          Two ways to reach microgravity
        </h2>
        <p>
          The same team studied passive mixing first on parabolic flights, then aboard the station. The two experiments
          differ in almost every condition that matters for watching fluids.
        </p>
      </Reveal>
      <Reveal>
        <div className="platforms-scroll">
        <table className="platforms-table">
          <caption className="visually-hidden">Parabolic-flight experiment compared with TIGERS-X on the ISS</caption>
          <colgroup>
            <col className="platforms-col--factor" />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <span>Factor</span>
              </th>
              <th scope="col">
                <div className="platforms-head">
                  <img src={assets.parabolicPatch} alt="Parabolic Flight Experiment patch" width={1000} height={1000} loading="lazy" />
                  <div>
                    Parabolic flight
                    <span>Prior study, 2025</span>
                  </div>
                </div>
              </th>
              <th scope="col" className="is-iss">
                <div className="platforms-head">
                  <img src={assets.patch} alt="TIGERS-X mission patch" width={2048} height={2048} loading="lazy" />
                  <div>
                    International Space Station
                    <span>TIGERS-X, 2026</span>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="platforms-media-row">
              <th scope="row">In pictures</th>
              <td data-label={platformLabels.parabolic}>
                <MediaFigure slotId="platform-parabolic" />
              </td>
              <td data-label={platformLabels.iss} className="is-iss">
                <MediaFigure slotId="platform-iss" />
              </td>
            </tr>
            {platformRows.map((r) => (
              <tr key={r.factor}>
                <th scope="row">
                  {r.factor}
                  {r.sub && <span>{r.sub}</span>}
                </th>
                <td data-label={platformLabels.parabolic}>{r.parabolic}</td>
                <td data-label={platformLabels.iss} className="is-iss">
                  {r.iss}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <p className="platforms-note">
          Parabolic-flight figures are from the team’s 2025 study (Seehanam et al., Scientific Reports), as summarised in
          the TIGERS-X paper.
        </p>
      </Reveal>
    </section>
  );
}
