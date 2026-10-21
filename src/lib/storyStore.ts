import { useSyncExternalStore } from 'react';

/**
 * Shared, mutable story state. Scroll writes `t` many times per second, so the
 * 3D stage reads it directly inside the render loop instead of through React
 * state; components that need to re-render subscribe with `useStory`.
 */
export interface StoryState {
  /** Normalised story position: beat index + progress through that beat. */
  t: number;
  /** Index of the beat whose copy is currently being read. */
  activeBeat: number;
  /** Visitor is freely orbiting the model. */
  exploring: boolean;
  /** Explorer entry id currently selected while exploring. */
  selected: string | null;
  /** The story stage is on screen (render loop runs only then). */
  stageVisible: boolean;
  /** The 3D model has loaded and the explorer can be offered. */
  stageReady: boolean;
}

const state: StoryState = { t: 0, activeBeat: 0, exploring: false, selected: null, stageVisible: false, stageReady: false };
const listeners = new Set<() => void>();
let version = 0;

export const storyState: Readonly<StoryState> = state;

export function setStory(patch: Partial<StoryState>) {
  let changed = false;
  for (const k of Object.keys(patch) as (keyof StoryState)[]) {
    if (state[k] !== patch[k]) {
      (state as unknown as Record<string, unknown>)[k] = patch[k];
      changed = true;
    }
  }
  if (!changed) return;
  version++;
  listeners.forEach((l) => l());
}

export function subscribeStory(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useStory<T>(select: (s: StoryState) => T): T {
  return useSyncExternalStore(
    subscribeStory,
    () => select(state),
    () => select(state),
  );
}

export const storyVersion = () => version;
