import { platformLabels, platformRows } from '../config/science';
import { assets } from '../config/site';
import { copy } from '../content';
import { MediaFigure } from './Media';
import { Reveal } from './Reveal';

/** Parabolic flight versus ISS, as reported in the TIGERS-X paper. */
export function PlatformComparison() {
  return (
    <section className="container platforms" aria-labelledby="platforms-title">
      <Reveal className="platforms-intro">
        <h2 id="platforms-title" className="science-heading">
          {copy.platforms.title}
        </h2>
        <p>{copy.platforms.intro}</p>
      </Reveal>
      <Reveal>
        <div className="platforms-scroll">
        <table className="platforms-table">
          <caption className="visually-hidden">{copy.platforms.caption}</caption>
          <colgroup>
            <col className="platforms-col--factor" />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">
                <span>{copy.platforms.factor}</span>
              </th>
              <th scope="col">
                <div className="platforms-head">
                  <img src={assets.parabolicPatch} alt={copy.platforms.parabolicPatchAlt} width={1000} height={1000} loading="lazy" />
                  <div>
                    {copy.platforms.parabolicHead}
                    <span>{copy.platforms.parabolicSub}</span>
                  </div>
                </div>
              </th>
              <th scope="col" className="is-iss">
                <div className="platforms-head">
                  <img src={assets.patch} alt={copy.platforms.issPatchAlt} width={2048} height={2048} loading="lazy" />
                  <div>
                    {copy.platforms.issHead}
                    <span>{copy.platforms.issSub}</span>
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="platforms-media-row">
              <th scope="row">{copy.platforms.pictures}</th>
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
          {copy.platforms.note}
        </p>
      </Reveal>
    </section>
  );
}
