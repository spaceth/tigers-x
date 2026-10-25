/**
 * DOM elements for 3D-anchored labels. The overlay (React, outside the canvas)
 * registers elements here; the projector inside the canvas positions them every
 * rendered frame without React re-renders.
 */
export interface LabelElements {
  box: HTMLElement;
  line: SVGLineElement;
}

export const labelElements = new Map<string, LabelElements>();

export function registerLabel(id: string, els: LabelElements | null) {
  if (els) labelElements.set(id, els);
  else labelElements.delete(id);
}
