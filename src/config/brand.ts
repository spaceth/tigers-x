/**
 * Single source of truth for colour. CSS reads these through custom properties
 * (applied in main.tsx); the 3D scene imports them directly.
 *
 * PROVISIONAL ACCENTS: the brief supplied "#ed6d2" and "#173b7", which are
 * incomplete five-digit hex values, and apple.md defines no brand hex values.
 * The two accents below are temporary muted placeholders, not corrections of
 * those strings. Replace `accentWarm` / `accentDeep` here once the exact brand
 * values are confirmed; no component needs editing.
 */
export const brand = {
  /** Provisional — muted warm orange. Hardware highlight and graphics only (3.45:1, never small text). */
  accentWarm: '#c96a32',
  /** Provisional — deep blue. Fluid paths, diagram lines, restrained controls (9.9:1). */
  accentDeep: '#1f3d6e',

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
