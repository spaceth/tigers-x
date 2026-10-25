/**
 * Mission facts. Sources:
 *  - [paper] Seehanam et al., "On-board International Space Station Verification of Autonomous
 *    Emulsification Lab-on-Chip Payload: TIGERS-X Project", preprint, 22 Oct 2026,
 *    doi:10.21203/rs.3.rs-11156278/v1
 *  - [report] the team's 5 June 2026 mission report, as summarised in tigers-x.md §9
 * Keep separate measures separate — do not sum or merge them.
 */

export const publication = {
  title: 'On-board International Space Station Verification of Autonomous Emulsification Lab-on-Chip Payload: TIGERS-X Project',
  authors:
    'S. Seehanam, T. Sirisombat, R. Tobsri, W. Boonrueng, P. Ngamkajornwiwat, W. Sripumkhai, P. Pattamang, W. Chancharoen',
  venue: 'Research Square preprint, 22 October 2026',
  doi: '10.21203/rs.3.rs-11156278/v1',
  url: 'https://doi.org/10.21203/rs.3.rs-11156278/v1',
  /** CAD file, experiment videos and image-analysis software. */
  dataUrl: 'https://doi.org/10.5281/zenodo.22934189',
  dataDoi: '10.5281/zenodo.22934189',
} as const;

/** [paper] Launch and on-orbit campaign. */
export const campaign = {
  launch: '16 May 2026',
  vehicle: 'SpaceX CRS-34',
  /** [team] */
  launchSite: 'Space Launch Complex 40, Cape Canaveral Space Force Station',
  operationsStart: '26 May 2026',
  operationsEnd: '5 June 2026',
  days: 10,
  powerInterruptionHours: '2–3',
} as const;

/** [report] Operation figures. */
export const operation = {
  duration: { days: 9, hours: 14, minutes: 57, seconds: 23 },
  videoFiles: 4342,
  recordedGB: 110, // approximate
  downlinkedGB: 63, // before physical retrieval
  groundCommands: 1407,
  pumpOperations: 218,
  pumps: 8,
  pumpRuntime: { minutes: 15, seconds: 22 }, // combined, all pumps
} as const;

/** Envelope: [paper] dimensions and pre-handover mass; peak power from tigers-x.md §3. */
export const envelope = {
  widthMm: 200,
  depthMm: 200,
  heightMm: 100,
  formFactor: '4U',
  massKg: 2.32,
  massWithBagKg: 2.52,
  peakPowerW: 18,
} as const;

/** [paper] Fluid inventory, all in CryoStore® EVA bags inside one reservoir container. */
export const fluids = {
  oil: { name: 'Fluid A · oil-phase mixture', bags: 2, mlPerBag: 10, colourant: 'Oleoresin Paprika' },
  water: { name: 'Fluid B · BFluid®', bags: 2, mlPerBag: 15, colourant: 'food-grade blue dye' },
  mixture: { bags: 4, maxMlPerBag: 25 },
  /** Worst case if both containment layers failed at once. */
  maxReleasableMl: 60,
} as const;

/** [paper] Prior parabolic-flight study (Seehanam et al., Sci Rep 2025). */
export const parabolic = {
  platformKg: 20,
  windowSeconds: 20,
  trials: 29,
  uniformityGainPct: 24.2,
  gJitter: '0.01–0.05 g',
} as const;

/** [paper] Ground qualification against the ICE Cubes interface requirements. */
export const verification = {
  emc: [
    { test: 'RE102', what: 'Radiated emissions', range: '14 kHz–18 GHz', initial: 'fail', final: 'pass', fix: 'Ferrite cores on LAN and power cables' },
    { test: 'RE101', what: 'Magnetic field emissions', range: '30 Hz–250 kHz', initial: 'pass', final: 'pass' },
    { test: 'CE101', what: 'Conducted emissions, power leads', range: '30 Hz–10 kHz', initial: 'pass', final: 'pass' },
    { test: 'CE102', what: 'Conducted emissions, power leads', range: '10 kHz–10 MHz', initial: 'pass', final: 'pass' },
    { test: 'CS114', what: 'Conducted susceptibility', range: '', initial: 'pass', final: 'pass' },
    { test: 'DC field', what: 'DC magnetic field', range: '≤ 316 μT at 7 cm', initial: 'pass', final: 'pass' },
  ],
} as const;

export type ChannelRowId = 'CH1-1' | 'CH1-2' | 'CH2-1' | 'CH2-2';

/**
 * [paper, Fig. 9] Hue-based mixing index at event 4, per channel row.
 * Scale: 0 = air, 1 = pure water hue, 2 = pure oil hue; 1.5 is the notional "fully mixed" midpoint.
 * `final` is the cumulative index at the outlet; `mean`/`sd` are over all fluid pixels in the row.
 */
export const mixingIndex: { id: ChannelRowId; device: 'CH1' | 'CH2'; final: number; mean: number; sd: number }[] = [
  { id: 'CH1-1', device: 'CH1', final: 1.49, mean: 1.47, sd: 0.3 },
  { id: 'CH1-2', device: 'CH1', final: 1.53, mean: 1.5, sd: 0.3 },
  { id: 'CH2-1', device: 'CH2', final: 1.34, mean: 1.33, sd: 0.33 },
  { id: 'CH2-2', device: 'CH2', final: 1.81, mean: 1.8, sd: 0.17 },
];

export const mixingFindings = {
  convergedWithinPct: '10–20',
  ch1Delta: 0.04,
  ch2Delta: 0.47,
  midpoint: 1.5,
} as const;

export const fmt = (n: number) => n.toLocaleString('en-GB');
