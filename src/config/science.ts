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
    factor: 'Where',
    parabolic: 'Aboard an aircraft flying repeated parabolic arcs',
    iss: 'ICE Cubes Facility, Columbus module, International Space Station',
  },
  {
    factor: 'Microgravity window',
    sub: 'How long each run lasts',
    parabolic: `About ${parabolic.windowSeconds} seconds per parabola`,
    iss: `Continuous, across a ${campaign.days}-day campaign (${campaign.operationsStart} – ${campaign.operationsEnd})`,
  },
  {
    factor: 'Gravity quality',
    parabolic: `Reduced gravity with g-jitter of ${parabolic.gJitter}`,
    iss: 'Sustained microgravity',
  },
  {
    factor: 'Runs',
    parabolic: `${parabolic.trials} trials`,
    iss: 'Repeated cycles in four channels on two devices, commanded on demand',
  },
  {
    factor: 'Mixer',
    parabolic: 'Passive static mixer on a lab-on-chip',
    iss: 'Passive Tesla-valve channels on a lab-on-chip, ending in an observation chamber',
  },
  {
    factor: 'Fluids',
    parabolic: 'Immiscible fluid pairs',
    iss: 'Oil phase coloured with Oleoresin Paprika; water phase (BFluid®) with a food-grade blue dye',
  },
  {
    factor: 'Hardware',
    parabolic: `${parabolic.platformKg} kg lab-on-chip platform`,
    iss: '2.32 kg experiment cube, 20 × 20 × 10 cm, with eight pumps and four cameras',
  },
  {
    factor: 'Operation',
    parabolic: 'Run within each aircraft parabola',
    iss: 'Teleoperated from Bangkok via YAMCS; no crew involvement beyond installation and removal',
  },
  {
    factor: 'What could be observed',
    parabolic: 'Initial mixing only; no time to watch the fluid settle afterwards',
    iss: 'Flow development over successive events, and the quiescent phase after mixing',
  },
  {
    factor: 'How mixing was measured',
    parabolic: 'Colour Distribution Entropy',
    iss: 'Hue-based continuous mixing index, calibrated against an in-frame colour swatch',
  },
  {
    factor: 'Headline result',
    parabolic: `The best emulsion mixed ${parabolic.uniformityGainPct}% more uniformly than the microgravity control`,
    iss: 'Phase composition set within the first 10–20% of each channel; the two devices diverged',
  },
];

export const goalCards: { id: string; icon: string; title: string; body: string }[] = [
  {
    id: 'tpn',
    icon: assets.iconMedical,
    title: 'Improve TPN formulations on Earth',
    body: 'Insights from this project can improve TPN formulations on Earth, especially for patient-specific nutrition. For example, reducing emulsifier dependency can increase formulation flexibility and better support personalized medicine.',
  },
  {
    id: 'food',
    icon: assets.iconFood,
    title: 'Food and fluid systems for long-duration space missions',
    body: 'This knowledge informs food and fluid system design for long-duration space missions. In space, formulations must remain stable over time, resist phase separation, be storable, and flow properly without gravity, requiring fluid delivery systems built for microgravity behaviour.',
  },
  {
    id: 'medicine',
    icon: assets.iconExploration,
    title: 'Space medicine allowing multi-planetary species',
    body: 'These advances contribute to space medicine, including drug mixing in microgravity, nutritional delivery, surgery that requires precise fluid control without gravity, and preventive care such as fluid balance management and long-term health optimization for multi-planetary species.',
  },
];
