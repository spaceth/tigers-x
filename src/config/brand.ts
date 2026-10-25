/**
 * Single source of truth for colour. CSS reads these through custom properties
 * (applied in main.tsx); the 3D scene imports them directly.
 *
 * Asset palette: orange #fa5f05, blue #173b72, white #fff.
 */
const deepBlue = '#173b72';
const assetOrange = '#fa5f05';

export const brand = {
  /** Asset orange. Hardware highlight, primary buttons, and the oil phase in the chip diagram. */
  accentWarm: assetOrange,
  /** Asset blue. Channel tint, secondary controls on light surfaces. */
  accentDeep: deepBlue,
  /** Background of the navy sections (science, results, footer). Section themes re-map `accentDeep`, so this stays fixed. */
  navy: deepBlue,
  /** Background of the dark sections (3D payload story, ISS). */
  night: '#000000',
  /** Primary text on `night` and `accentDeep` backgrounds. */
  inkOnDark: '#ffffff',

  // Camera hues for the results chart: Oleoresin Paprika reads orange, the blue dye reads teal.
  // The chip diagram uses the asset orange and blue instead.
  fluidOil: assetOrange,
  fluidWater: '#2a9690',

  // Neutral foundation (~60%)
  canvas: '#f6f5f2',
  surface: '#fbfaf8',
  // Secondary neutral structure (~30%)
  mist: '#ebeae6',
  stone: '#d9d8d3',
  pewter: '#a9a8a3',
  // Grayscale typography — contrast measured on `canvas` (#f6f5f2)
  ink: '#1d1d1f', // 15.4:1
  inkSecondary: '#4f4f53', // 7.5:1
  inkTertiary: '#6a6a6f', // 4.9:1 — use on canvas/surface only, not on mist
} as const;

export type BrandToken = keyof typeof brand;

const cssName = (k: string) => `--${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

export function applyBrandTokens(root: HTMLElement = document.documentElement) {
  for (const [k, v] of Object.entries(brand)) root.style.setProperty(cssName(k), v);
}
