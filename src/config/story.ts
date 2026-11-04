/**
 * Camera poses for the scroll-driven payload story. Copy for each beat lives
 * in `src/content/en.json` under `story.beats`, keyed by the same id.
 *
 * The stage state is a pure function of the normalised story position `t`
 * (beat index + progress through that beat), so scrolling backwards, resizing
 * and deep-linking always reproduce the same state.
 *
 * Coordinates are model millimetres, Y up, origin at the centre of the base plate.
 */
import { copy } from '../content';
import type { RigId, SubsystemId } from './modelMap';

export type Vec3 = [number, number, number];

export interface CameraKey {
  /** Look-at point. */
  target: Vec3;
  /** Direction from target to camera (normalised at runtime). */
  dir: Vec3;
  /** Radius (mm) of the region that must stay in frame; the distance is fitted to the stage aspect. */
  radius: number;
  /** Optional override for narrow (portrait) stages. */
  mobileRadius?: number;
}

export interface Pose {
  camera: CameraKey;
  rigs?: Partial<Record<RigId, number>>;
  /** Subsystems drawn in the highlight treatment. */
  focus?: SubsystemId[];
  /** How strongly everything outside `focus` is dimmed (0–1). Dimmed parts stay opaque. */
  dim?: number;
  /** Ghosted subsystems (0 = solid, 1 = faint outline-level opacity). */
  ghost?: Partial<Record<SubsystemId, number>>;
  /** Opacity of the envelope dimension guides. */
  guides?: number;
  /** Emphasis of the chip channel layers (accent tint on the channel base). */
  channels?: number;
  labels?: LabelId[];
}

export type LabelId =
  | 'structure'
  | 'pumps'
  | 'reservoir'
  | 'cameras'
  | 'chip'
  | 'computer'
  | 'mainBoard'
  | 'hub'
  | 'channelLayers'
  | 'portLayer'
  | 'connector';

export interface LabelDef {
  text: string;
  /** GLB indices whose combined bounds define the anchor box. */
  parts: number[];
  /** Anchor position as a fraction of the anchor box on each axis. */
  at: Vec3;
  /** Outward surface normal at the anchor; the label hides when it faces away. */
  normal: Vec3;
  /** Show on narrow screens too (keep to one or two per pose). */
  mobile?: boolean;
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, k) => a + k);

const labelGeometry: Record<LabelId, Omit<LabelDef, 'text'>> = {
  structure: { parts: [21], at: [0.82, 1, 0.82], normal: [0, 1, 0], mobile: true },
  pumps: { parts: [237], at: [0.62, 1, 0.9], normal: [0, 1, 0], mobile: true },
  reservoir: { parts: [95, 96], at: [1, 0.55, 0.9], normal: [1, 0, 0] },
  cameras: { parts: [135, 157, 179, 201], at: [1, 1, 0.5], normal: [1, 0.4, 0], mobile: true },
  chip: { parts: [391], at: [1, 0.6, 0.35], normal: [1, 0, 0], mobile: true },
  computer: { parts: [93], at: [0.25, 1, 0.35], normal: [0, 1, 0], mobile: true },
  mainBoard: { parts: [41], at: [0.2, 1, 0.92], normal: [0, 1, 0] },
  hub: { parts: [76], at: [0.3, 1, 0.6], normal: [0, 1, 0] },
  channelLayers: { parts: [410], at: [0.97, 1, 0.12], normal: [0, 1, 0], mobile: true },
  portLayer: { parts: [412], at: [1, 0.5, 0.8], normal: [1, 0, 0] },
  connector: { parts: range(1, 14), at: [0.5, 0, 0], normal: [0, -0.4, -1] },
};

export const labels: Record<LabelId, LabelDef> = Object.fromEntries(
  (Object.keys(labelGeometry) as LabelId[]).map((id) => [
    id,
    { ...labelGeometry[id], text: copy.story.labels[id] },
  ]),
) as Record<LabelId, LabelDef>;

export type StoryChapter = 'payload' | 'subsystems' | 'chip';
export type BeatExtra = 'envelope' | 'flow' | 'explore' | 'computing-roles';

interface BeatLayout {
  id: keyof typeof copy.story.beats;
  chapter?: StoryChapter;
  extra?: BeatExtra;
  headline?: boolean;
  pose: Pose;
}

export interface Beat extends BeatLayout {
  eyebrow?: string;
  title: string;
  body: string[];
}

const HERO: CameraKey = { target: [0, 50, 0], dir: [1.05, 0.72, 1.28], radius: 175, mobileRadius: 200 };

const layout: BeatLayout[] = [
  {
    id: 'inside-4u',
    chapter: 'payload',
    headline: true,
    pose: { camera: HERO },
  },
  {
    id: 'envelope',
    extra: 'envelope',
    pose: {
      camera: { target: [0, 42, 0], dir: [1.0, 0.75, 1.25], radius: 150, mobileRadius: 172 },
      guides: 1,
    },
  },
  {
    id: 'structure',
    chapter: 'subsystems',
    pose: {
      camera: { target: [0, 66, 0], dir: [1.0, 0.85, 1.2], radius: 245, mobileRadius: 275 },
      rigs: { enclosure: 1 },
      focus: ['enclosure'],
      dim: 0.25,
      labels: ['structure'],
    },
  },
  {
    id: 'fluidics',
    pose: {
      camera: { target: [40, 58, 36], dir: [1.2, 0.72, 1.05], radius: 100, mobileRadius: 100 },
      rigs: { enclosure: 1, pumpsLift: 1 },
      focus: ['pumps', 'reservoir'],
      dim: 0.55,
      ghost: { enclosure: 1 },
      labels: ['pumps', 'reservoir'],
    },
  },
  {
    id: 'observation',
    pose: {
      camera: { target: [46, 86, -48], dir: [1.35, 0.5, -0.45], radius: 104, mobileRadius: 108 },
      rigs: { enclosure: 1, chipLift: 1 },
      focus: ['cameras'],
      dim: 0.5,
      ghost: { enclosure: 1 },
      labels: ['cameras', 'chip'],
    },
  },
  {
    id: 'computing',
    extra: 'computing-roles',
    pose: {
      camera: { target: [-52, 40, 2], dir: [-1.15, 1.0, 0.7], radius: 108, mobileRadius: 112 },
      rigs: { enclosure: 1, hubLift: 1 },
      focus: ['computer', 'mainBoard', 'hub'],
      dim: 0.55,
      ghost: { enclosure: 1 },
      labels: ['computer', 'mainBoard', 'hub'],
    },
  },
  {
    id: 'core',
    pose: {
      camera: { target: [46, 84, -50], dir: [0.85, 1.05, 0.75], radius: 95, mobileRadius: 100 },
      rigs: { enclosure: 1 },
      focus: ['chip'],
      dim: 0.7,
      ghost: { enclosure: 1 },
      labels: ['chip'],
    },
  },
  {
    id: 'deliver',
    chapter: 'chip',
    extra: 'flow',
    headline: true,
    pose: {
      camera: { target: [44, 78, -6], dir: [1.05, 1.2, 0.35], radius: 112, mobileRadius: 112 },
      rigs: { enclosure: 1, pumpsLift: 0.35 },
      focus: ['pumps', 'chip'],
      dim: 0.7,
      ghost: { enclosure: 1 },
      labels: ['pumps', 'chip'],
    },
  },
  {
    id: 'mix',
    pose: {
      camera: { target: [46, 94, -50], dir: [0.55, 1.25, 0.62], radius: 66, mobileRadius: 70 },
      rigs: { enclosure: 1, chipLayers: 1, chipLift: 0.25 },
      focus: ['chip'],
      dim: 0.85,
      ghost: { enclosure: 1, pumps: 0.6 },
      channels: 1,
      labels: ['channelLayers', 'portLayer'],
    },
  },
  {
    id: 'watch',
    pose: {
      camera: { target: [46, 88, -48], dir: [1.4, 0.4, 0.25], radius: 100, mobileRadius: 104 },
      rigs: { enclosure: 1, chipLift: 1, chipLayers: 0.35 },
      focus: ['cameras', 'chip'],
      dim: 0.75,
      ghost: { enclosure: 1, pumps: 0.6 },
      channels: 0.6,
      labels: ['cameras', 'chip'],
    },
  },
  {
    id: 'time',
    pose: {
      camera: { target: [46, 86, -50], dir: [0.7, 1.15, 0.85], radius: 84, mobileRadius: 90 },
      rigs: { enclosure: 1 },
      focus: ['chip'],
      dim: 0.6,
      ghost: { enclosure: 1 },
      channels: 0.5,
      labels: ['chip'],
    },
  },
  {
    id: 'explore',
    extra: 'explore',
    pose: {
      camera: { target: [0, 62, 0], dir: [1.05, 0.95, 1.2], radius: 235, mobileRadius: 270 },
      rigs: { enclosure: 1 },
      ghost: { enclosure: 0.8 },
    },
  },
];

export const beats: Beat[] = layout.map((beat) => {
  const text: { title: string; body: readonly string[]; eyebrow?: string } = copy.story.beats[beat.id];
  return {
    ...beat,
    eyebrow: text.eyebrow,
    title: text.title,
    body: [...text.body],
  };
});

/** Pose used while the visitor explores the model with orbit controls. */
export const explorePose: Pose = {
  camera: { target: [0, 62, 0], dir: [1.05, 0.95, 1.2], radius: 235 },
  rigs: { enclosure: 1 },
  ghost: { enclosure: 0.85 },
};

/** Fraction of a beat before its start at which the transition into it begins, and its length. */
export const TRANSITION = { lead: 0.28, length: 0.5 } as const;
