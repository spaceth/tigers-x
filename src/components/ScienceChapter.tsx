import { assets } from '../config/site';
import { Reveal } from './Reveal';

function PhaseIllustration() {
  return (
    <figure className="phase-figure">
      <svg viewBox="0 0 560 250" role="img" aria-labelledby="phase-title phase-desc">
        <title id="phase-title">Two fluid phases on Earth and in microgravity</title>
        <desc id="phase-desc">
          Left: on Earth, a lighter lipid phase rises and collects as a layer above the aqueous phase. Right: in
          microgravity, buoyancy barely acts, so lipid droplets stay distributed through the aqueous phase, while
          remaining a separate phase.
        </desc>
        <defs>
          <marker id="pf-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M1 1 L8 5 L1 9" fill="none" stroke="var(--ink-secondary)" strokeWidth="1.5" />
          </marker>
        </defs>

        <g transform="translate(20 20)">
          <rect className="pf-vessel" x="0" y="0" width="200" height="170" rx="14" />
          <rect className="pf-lipid-layer" x="6" y="6" width="188" height="44" rx="10" />
          <g className="pf-drops">
            <circle cx="60" cy="84" r="4" />
            <circle cx="130" cy="72" r="3" />
          </g>
          <line className="pf-gravity" x1="232" y1="40" x2="232" y2="130" markerEnd="url(#pf-arrow)" />
          <text className="pf-label" x="0" y="196">On Earth</text>
          <text className="pf-label pf-label--sub" x="0" y="216">Buoyancy sorts the phases into layers</text>
          <text className="pf-tag" x="214" y="150">gravity</text>
        </g>

        <g transform="translate(320 20)">
          <rect className="pf-vessel" x="0" y="0" width="200" height="170" rx="14" />
          <g className="pf-drops">
            {[
              [28, 30, 5], [74, 22, 4], [128, 36, 6], [168, 24, 4], [46, 72, 4], [98, 64, 5], [150, 82, 5],
              [30, 118, 6], [80, 108, 4], [122, 126, 5], [172, 136, 4], [60, 150, 4], [104, 154, 3],
            ].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} />
            ))}
          </g>
          <text className="pf-label" x="0" y="196">In microgravity</text>
          <text className="pf-label pf-label--sub" x="0" y="216">Droplets stay spread out — still a separate phase</text>
        </g>
      </svg>
      <figcaption>
        <span className="legend-swatch legend-swatch--aqueous" aria-hidden="true" /> Aqueous phase
        <span className="legend-swatch legend-swatch--lipid" aria-hidden="true" /> Lipid phase (outlined)
        <span className="figure-note">Simplified illustration</span>
      </figcaption>
    </figure>
  );
}

export function ScienceChapter() {
  return (
    <section id="question" className="chapter chapter--question" aria-labelledby="question-title">
      <div className="container hero">
        <div className="hero-copy">
          <p className="eyebrow">TIGERS-X · Thailand Innovative G-force Varied Emulsification Research for Space Exploration</p>
          <h1 id="question-title" className="display">
            How do you mix medicine when gravity stops doing the sorting?
          </h1>
          <p className="lead">
            TIGERS-X is a compact laboratory that flew aboard the International Space Station to study how medical
            fluids mix and form emulsions in microgravity.
          </p>
        </div>
        <figure className="hero-patch">
          <img src={assets.patch} width={2048} height={2048} alt="TIGERS-X mission patch: an orange payload box above Earth, framed by the words Thailand Innovative G-force-Varied Emulsification Research for Space Exploration." />
        </figure>
      </div>

      <div className="container science-grid">
        <Reveal className="science-copy">
          <h2 className="section-title">Nutrition that bypasses the gut</h2>
          <p>
            Some patients cannot obtain adequate nutrition through their digestive system. Total Parenteral Nutrition,
            or TPN, supplies nutrients intravenously instead. Its formulations combine water-based solutions with
            lipids — phases that do not dissolve into one another and must be dispersed with care.
          </p>
          <h2 className="section-title">Why take the question to orbit</h2>
          <p>
            On Earth, buoyancy constantly pulls lighter and heavier phases apart. That separation can obscure the
            slower interactions at the boundary between fluids. In microgravity it largely falls away, so researchers
            can watch mixing, droplet formation and interfacial behaviour without gravity doing the sorting.
          </p>
          <p>
            Microgravity does not make oil and water miscible. Viscosity and interfacial tension still act; the phases
            remain distinct.
          </p>
          <h2 className="section-title">The question</h2>
          <p className="question-statement">
            How do these phases mix, form a dispersion, and evolve over time — and can a compact static-mixing system
            produce a sufficiently stable dispersion in microgravity?
          </p>
          <p className="muted">
            TIGERS-X studied fluid behaviour relevant to formulation. It did not treat patients, and its flight results
            are not a clinically validated formulation.
          </p>
        </Reveal>
        <Reveal className="science-figure" delay={1}>
          <PhaseIllustration />
        </Reveal>
      </div>
    </section>
  );
}
