/**
 * The scroll-driven payload story (chapters 2–4).
 *
 * Each beat is one block of copy in the page and one pose of the 3D stage. The
 * stage state is a pure function of the normalised story position `t`
 * (beat index + progress through that beat), so scrolling backwards, resizing
 * and deep-linking always reproduce the same state.
 *
 * Coordinates are model millimetres, Y up, origin at the centre of the base plate.
 */
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

export const labels: Record<LabelId, LabelDef> = {
  structure: { text: 'Aluminium 7075 structure', parts: [21], at: [0.82, 1, 0.82], normal: [0, 1, 0], mobile: true },
  pumps: { text: 'Eight peristaltic pumps', parts: [237], at: [0.62, 1, 0.9], normal: [0, 1, 0], mobile: true },
  reservoir: { text: 'Reservoir · eight fluid bags', parts: [95, 96], at: [1, 0.55, 0.9], normal: [1, 0, 0] },
  cameras: { text: 'Four cameras, 2 × 2', parts: [135, 157, 179, 201], at: [1, 1, 0.5], normal: [1, 0.4, 0], mobile: true },
  chip: { text: 'Lab-on-chip', parts: [391], at: [1, 0.6, 0.35], normal: [1, 0, 0], mobile: true },
  computer: { text: 'Orange Pi 5 Pro computer', parts: [93], at: [0.25, 1, 0.35], normal: [0, 1, 0], mobile: true },
  mainBoard: { text: 'Main circuit board', parts: [41], at: [0.2, 1, 0.92], normal: [0, 1, 0] },
  hub: { text: 'Hub enclosure', parts: [76], at: [0.3, 1, 0.6], normal: [0, 1, 0] },
  channelLayers: { text: 'Tesla-valve channel layers', parts: [410], at: [0.97, 1, 0.12], normal: [0, 1, 0], mobile: true },
  portLayer: { text: 'Port layer · 12 fluid ports', parts: [412], at: [1, 0.5, 0.8], normal: [1, 0, 0] },
  connector: { text: 'Facility connector', parts: range(1, 14), at: [0.5, 0, 0], normal: [0, -0.4, -1] },
};

export interface Beat {
  id: string;
  /** Chapter anchor this beat begins (first beat of each chapter only). */
  chapter?: 'payload' | 'subsystems' | 'chip';
  eyebrow?: string;
  title: string;
  /** Short explanatory paragraphs. */
  body: string[];
  /** Optional component rendered beneath the copy. */
  extra?: 'envelope' | 'flow' | 'explore' | 'computing-roles';
  /** Chapter headline beats use display type. */
  headline?: boolean;
  pose: Pose;
}

const HERO: CameraKey = { target: [0, 50, 0], dir: [1.05, 0.72, 1.28], radius: 175, mobileRadius: 200 };

export const beats: Beat[] = [
  /* --------------------------- Chapter 2: the payload --------------------------- */
  {
    id: 'inside-4u',
    chapter: 'payload',
    eyebrow: 'The payload',
    title: 'All of that. Inside 4U.',
    headline: true,
    body: [
      'Eight pumps, eight fluid bags, two lab-on-chip devices, four cameras and the computers that run them — a complete laboratory, built to fit a box twenty centimetres across.',
    ],
    pose: { camera: HERO },
  },
  {
    id: 'envelope',
    title: 'Twenty centimetres across. Ten centimetres tall.',
    body: [
      'TIGERS-X is an experiment cube built to the ICE Cubes interface standard: 200 × 200 × 100 mm, a 4U volume. At its pre-flight handover it weighed 2.32 kg. It plugs into a facility aboard the station for power and data; it is not a free-flying satellite.',
    ],
    extra: 'envelope',
    pose: {
      camera: { target: [0, 42, 0], dir: [1.0, 0.75, 1.25], radius: 150, mobileRadius: 172 },
      guides: 1,
    },
  },

  /* ------------------------ Chapter 3: open the payload ------------------------ */
  {
    id: 'structure',
    chapter: 'subsystems',
    eyebrow: 'Inside the payload',
    title: 'A compact structure holds it all together.',
    body: [
      'The structure is built from Aluminium 7075, a high-strength aluminium alloy. Lift the panels away and three subsystems appear — fluidics, electronics and the structural frame — with an internal panel separating the experiment module from the electronics module.',
      'This exploded view illustrates how the parts relate. The payload does not open this way in flight.',
    ],
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
    title: 'Eight pumps decide where every drop goes.',
    body: [
      'Eight Takasago® RP-QIII peristaltic pumps move the fluids by progressively squeezing flexible tubing. Each of the four mixing channels has its own pair: one pump for the oil phase, one for the water phase.',
      'The fluids sit in eight CryoStore® bags inside one reservoir container: two bags of oil-phase mixture (10 mL each), two of BFluid® (15 mL each), and four empty bags of up to 25 mL that collect each channel’s mixture. The circuit is sealed and double-contained.',
    ],
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
    title: 'Four cameras watch the experiment.',
    body: [
      'Directly beneath the chip, four See3CAM cameras in a 2 × 2 arrangement record the channels under white LED light. Each camera sees only part of a device, so pairs of synchronised views are stitched into one panorama. Here the chip assembly is lifted to reveal them.',
      'Every frame also includes a four-colour reference swatch, used later to correct for changes in lighting.',
    ],
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
    title: 'Computing that runs the lab — and listens to Earth.',
    body: [
      'An Orange Pi 5 Pro on-board computer decodes ground commands, sequences each experiment, stores images and telemetry, and runs its own YAMCS mission-control instance to buffer data between contacts. It hands pump and lighting commands to an STM32F746 microcontroller.',
      'Everything runs from the facility’s single 12 V supply, regulated down to 5 V and 3.3 V on board.',
    ],
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
    title: 'Everything serves one small chip.',
    body: [
      'Fluid handling, imaging and computing exist to run the experiment at the centre of the payload: the lab-on-chip, two Tesla-valve devices — CH1 and CH2 — each with two parallel channel rows. Four independent mixing channels in all.',
    ],
    pose: {
      camera: { target: [46, 84, -50], dir: [0.85, 1.05, 0.75], radius: 95, mobileRadius: 100 },
      rigs: { enclosure: 1 },
      focus: ['chip'],
      dim: 0.7,
      ghost: { enclosure: 1 },
      labels: ['chip'],
    },
  },

  /* -------------------------- Chapter 4: lab-on-a-chip -------------------------- */
  {
    id: 'deliver',
    chapter: 'chip',
    eyebrow: 'The lab-on-a-chip',
    title: 'Two fluids. One channel.',
    headline: true,
    body: [
      'Each channel receives two immiscible fluids: Fluid A, an oil-phase mixture tinted orange with Oleoresin Paprika, and Fluid B, BFluid® glucose–electrolyte tinted with a food-grade blue dye that reads teal on camera. The colours are what make the phases measurable.',
    ],
    extra: 'flow',
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
    title: 'The channel shape does the mixing.',
    body: [
      'The Tesla-valve chain is a passive static mixer. There is no impeller and no high-shear homogenizer: the geometry supplies the mixing, and the pumps only keep the flow moving.',
      'Twelve fittings on the chip’s underside connect it to the fluid circuit — two inlets and one outlet for each of the four channels.',
    ],
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
    title: 'Watch the interface.',
    body: [
      'The cameras beneath the chip record each run. After every experimental cycle the video is downlinked over a secure link, and analysis on the ground starts the same day.',
      'On the ground, each frame is colour-corrected against its reference swatch and every pixel is scored by its hue: teal for water, orange for oil, and shades in between where the phases are mixed.',
    ],
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
    title: 'Watch two devices diverge.',
    body: [
      'In orbit, the recordings captured how the flow developed after the pumps started. At first both devices looked alike, with the oil phase leading into the channels. Then they parted ways: water spread through CH1, while CH2 stayed dominated by oil.',
      'Microgravity removes most buoyancy-driven separation, but viscosity and interfacial tension still act. The phases do not become miscible in orbit.',
    ],
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
    title: 'Explore the hardware yourself.',
    body: [
      'Turn the payload, choose a subsystem, and see how the parts fit together. The story waits for you here.',
    ],
    extra: 'explore',
    pose: {
      camera: { target: [0, 62, 0], dir: [1.05, 0.95, 1.2], radius: 235, mobileRadius: 270 },
      rigs: { enclosure: 1 },
      ghost: { enclosure: 0.8 },
    },
  },
];

/** Pose used while the visitor explores the model with orbit controls. */
export const explorePose: Pose = {
  camera: { target: [0, 62, 0], dir: [1.05, 0.95, 1.2], radius: 235 },
  rigs: { enclosure: 1 },
  ghost: { enclosure: 0.85 },
};

/** Fraction of a beat before its start at which the transition into it begins, and its length. */
export const TRANSITION = { lead: 0.28, length: 0.5 } as const;
