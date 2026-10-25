import type { CSSProperties } from 'react';
import { mixingFindings, mixingIndex, publication } from '../config/facts';
import { Reveal } from './Reveal';

/** Fluid-pixel index runs from 1 (pure water hue) to 2 (pure oil hue). */
const AXIS = { min: 1, max: 2 };
const pos = (v: number) => `${((Math.min(AXIS.max, Math.max(AXIS.min, v)) - AXIS.min) / (AXIS.max - AXIS.min)) * 100}%`;

function IndexScale() {
  return (
    <figure className="mi-scale">
      <div className="mi-scale__bar" aria-hidden="true">
        <span className="mi-scale__air" />
        <span className="mi-scale__fluid" />
      </div>
      <ol className="mi-scale__ticks">
        <li style={{ '--at': '0%' } as CSSProperties}>
          <strong>0</strong> Air or empty channel
        </li>
        <li style={{ '--at': '50%' } as CSSProperties}>
          <strong>1</strong> Pure water hue
        </li>
        <li style={{ '--at': '75%' } as CSSProperties}>
          <strong>1.5</strong> Notional fully mixed
        </li>
        <li style={{ '--at': '100%' } as CSSProperties}>
          <strong>2</strong> Pure oil hue
        </li>
      </ol>
      <figcaption>
        Every pixel of the channel is scored by its hue. Values between 1 and 2 mark interfaces or partly mixed
        regions, weighted by how close the colour sits to each phase.
      </figcaption>
    </figure>
  );
}

function IndexChart() {
  return (
    <figure className="mi-chart">
      <p className="mi-chart__title">Mixing index per channel row at event 4</p>
      <div className="mi-chart__axis" aria-hidden="true">
        <span />
        <span className="mi-chart__scale">
          <span style={{ left: pos(1) }}>1.0 · water</span>
          <span style={{ left: pos(1.5) }}>1.5</span>
          <span style={{ left: pos(2) }}>2.0 · oil</span>
        </span>
      </div>
      <ul className="mi-chart__rows">
        {mixingIndex.map((row) => (
          <li key={row.id} className={`mi-row mi-row--${row.device.toLowerCase()}`}>
            <span className="mi-row__id">{row.id}</span>
            <span className="mi-row__track" aria-hidden="true">
              <span className="mi-row__mid" style={{ left: pos(mixingFindings.midpoint) }} />
              <span
                className="mi-row__band"
                style={{ left: pos(row.mean - row.sd), width: `calc(${pos(row.mean + row.sd)} - ${pos(row.mean - row.sd)})` }}
              />
              <span className="mi-row__mean" style={{ left: pos(row.mean) }} />
              <span className="mi-row__final" style={{ left: pos(row.final) }} />
            </span>
            <span className="mi-row__values">
              Mean {row.mean.toFixed(2)} ± {row.sd.toFixed(2)}
              <span className="mi-row__sub">Outlet {row.final.toFixed(2)}</span>
            </span>
          </li>
        ))}
      </ul>
      <ul className="mi-chart__legend">
        <li>
          <span className="mi-key mi-key--band" aria-hidden="true" /> Spread (± 1 SD across fluid pixels)
        </li>
        <li>
          <span className="mi-key mi-key--mean" aria-hidden="true" /> Mean
        </li>
        <li>
          <span className="mi-key mi-key--final" aria-hidden="true" /> Cumulative index at the outlet
        </li>
        <li>
          <span className="mi-key mi-key--mid" aria-hidden="true" /> 1.5 midpoint
        </li>
      </ul>
      <figcaption>
        Values from the paper’s Figure 9. CH1-1 and CH1-2 are the two rows of device CH1; CH2-1 and CH2-2 are the
        rows of device CH2. Lower values are richer in water, higher values richer in oil.
      </figcaption>
    </figure>
  );
}

const findings = [
  {
    value: `${mixingFindings.convergedWithinPct}%`,
    title: 'Composition was set early',
    text: 'In all four rows the running index levelled off within the first 10–20% of the channel length, and changed little over the remaining Tesla-valve units.',
  },
  {
    value: `Δ ${mixingFindings.ch1Delta.toFixed(2)}`,
    title: 'CH1’s two rows agreed',
    text: 'Both rows of CH1 sat near the 1.5 midpoint, with statistically indistinguishable means: symmetric, balanced behaviour.',
  },
  {
    value: `Δ ${mixingFindings.ch2Delta.toFixed(2)}`,
    title: 'CH2’s two rows split',
    text: 'CH2-1 was the most water-rich row, and CH2-2 the most oil-rich and the most uniform. The difference held along the full length, which points to unequal flow partitioning between the two rows rather than chance.',
  },
];

export function ResultsChapter() {
  return (
    <section id="results" className="chapter chapter--results theme-navy" aria-labelledby="results-title">
      <div className="container">
        <Reveal className="chapter-intro">
          <p className="eyebrow">Results</p>
          <h2 id="results-title" className="chapter-title">
            Reading colour as composition.
          </h2>
          <p className="lead">
            Orange marks the oil phase and teal the water phase. After correcting each session’s colour against the
            printed swatch, the team turned every image into a map of which phase sits where.
          </p>
        </Reveal>

        <div className="results-grid">
          <Reveal className="results-copy">
            <h3 className="section-title">A continuous mixing index</h3>
            <p>
              Images are converted to hue, saturation and value. Low-saturation pixels count as air. Every other pixel
              gets a value between 1 and 2 from how close its hue sits to the water reference or the oil reference, so
              the measure has no hard boundary between the fluids.
            </p>
            <p>
              Averaging the index down each column of pixels, then keeping a running mean from inlet to outlet, shows
              how the composition develops along a channel.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <IndexScale />
          </Reveal>
        </div>

        <Reveal className="results-chart">
          <IndexChart />
        </Reveal>

        <ul className="results-findings">
          {findings.map((f, i) => (
            <Reveal as="li" key={f.title} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <p className="results-finding__value">{f.value}</p>
              <h3 className="results-finding__title">{f.title}</h3>
              <p>{f.text}</p>
            </Reveal>
          ))}
        </ul>

        <div className="results-grid results-grid--reading">
          <Reveal>
            <h3 className="section-title">What this shows</h3>
            <p>
              A purely passive Tesla-valve geometry, with no high-shear machinery, redistributed oil and water
              substantially within a short length of channel. That fits the idea behind the mission: without
              buoyancy, interfacial tension and capillary forces take over, which may lower the energy needed to
              emulsify.
            </p>
            <p>
              The split between CH2’s two nominally identical rows is also a design lesson: future chips should match
              the inlet flow resistance of parallel channels.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <h3 className="section-title">What it does not show</h3>
            <p>
              The index is defined for this coloured, immiscible oil–water pair, so it cannot be compared number for
              number with mixing indices for miscible fluids. It describes where each phase sits, not droplet size, and
              it is not a test of a clinical emulsion. The returned hardware will be examined, and the on-orbit data
              compared with it after the flight.
            </p>
            <p className="muted">
              Source:{' '}
              <a href={publication.url} target="_blank" rel="noreferrer">
                Seehanam et al., {publication.venue}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
