import { campaign, parabolic } from './facts';
import { assets } from './site';

/** Column labels used on the stacked (mobile) comparison table. */
export const platformLabels = {
  parabolic: 'Parabolic flight · 2025',
  iss: 'ISS · TIGERS-X · 2026',
} as const;

/** Parabolic flight versus the ISS, as reported in the paper (prior study: Seehanam et al., Sci Rep 2025). */
export const platformRows: { factor: string; sub?: string; parabolic: string; iss: string }[] = [
  {
    factor: 'Environment',
    parabolic: 'Aircraft, repeated parabolic arcs',
    iss: 'ICE Cubes Facility, Columbus module',
  },
  {
    factor: 'Duration',
    parabolic: `About ${parabolic.windowSeconds} s per parabola`,
    iss: `${campaign.days} days, ${campaign.operationsStart}–${campaign.operationsEnd}`,
  },
  {
    factor: 'Gravity',
    parabolic: `Reduced gravity, g-jitter ${parabolic.gJitter}`,
    iss: 'Sustained microgravity',
  },
  {
    factor: 'Observations',
    parabolic: `${parabolic.trials} trials`,
    iss: 'Repeated cycles, four channels on two devices',
  },
  {
    factor: 'Mixer',
    parabolic: 'Passive static mixer',
    iss: 'Passive Tesla-valve channels and an observation chamber',
  },
  {
    factor: 'Fluids',
    parabolic: 'Immiscible pairs',
    iss: 'Oil phase with oleoresin paprika; aqueous BFluid® with a food-grade blue dye',
  },
  {
    factor: 'Hardware',
    parabolic: `${parabolic.platformKg} kg platform`,
    iss: '2.32 kg cube, 200 × 200 × 100 mm; eight pumps, four cameras',
  },
  {
    factor: 'Control',
    parabolic: 'Executed within each parabola',
    iss: 'Teleoperated from Bangkok via YAMCS',
  },
  {
    factor: 'Interval observed',
    parabolic: 'Initial mixing only',
    iss: 'Flow development across events, then the quiescent interval',
  },
  {
    factor: 'Measurement',
    parabolic: 'Color Distribution Entropy',
    iss: 'Hue-based mixing index, calibrated to an in-frame swatch',
  },
  {
    factor: 'Principal result',
    parabolic: `Best emulsion ${parabolic.uniformityGainPct}% more uniform than the microgravity control`,
    iss: 'Composition set in the first 10–20% of channel length; the devices diverged',
  },
];

export const goalCards: { id: string; icon: string; title: string; body: string }[] = [
  {
    id: 'tpn',
    icon: assets.iconMedical,
    title: 'A mixer that does not need shear or buoyancy',
    body: 'Parenteral emulsions are specified by droplet size. Conventional production uses high-shear homogenizers. TIGERS-X asks whether capillary instabilities in a static mixer can redistribute the phases when those homogenizers cannot be used.',
  },
  {
    id: 'food',
    icon: assets.iconFood,
    title: 'Sustained microgravity, not a brief parabola',
    body: 'A 2025 parabolic-flight study saw stronger interfacial mixing, but each interval lasted about 20 seconds and included g-jitter. The station campaign follows the same class of passive mixing for long enough to see how the flow develops and then rests.',
  },
  {
    id: 'medicine',
    icon: assets.iconExploration,
    title: 'A platform for the next experiment',
    body: 'After installation the cube needed no crew. The same teleoperated architecture is a route to more demanding microgravity life-science work, including cell-culture systems, on later flights.',
  },
];
