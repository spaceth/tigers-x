/**
 * Operation figures from the team's 5 June 2026 mission report, as summarised in
 * tigers-x.md §9. These are separate measures — do not sum or merge them.
 */
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

/** Envelope and budget figures from tigers-x.md §3. */
export const envelope = {
  widthMm: 200,
  depthMm: 200,
  heightMm: 100,
  formFactor: '4U',
  massKg: 2.5,
  peakPowerW: 18,
} as const;

export const fmt = (n: number) => n.toLocaleString('en-GB');
