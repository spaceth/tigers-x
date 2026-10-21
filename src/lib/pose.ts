import { beats, labels, TRANSITION, type LabelId, type Pose } from '../config/story';
import { rigs, type RigId, type SubsystemId } from '../config/modelMap';

export const SUBSYSTEMS: SubsystemId[] = [
  'enclosure', 'base', 'connector', 'reservoir', 'pumps', 'chip', 'cameras', 'computer', 'mainBoard', 'hub', 'electronics',
];
const RIG_IDS = Object.keys(rigs) as RigId[];
const LABEL_IDS = Object.keys(labels) as LabelId[];

export interface SubsystemLook {
  /** 0–1 accent highlight */
  highlight: number;
  /** 0–1 lighten toward the background (stays opaque) */
  dim: number;
  /** 0–1 fade toward a faint ghost */
  ghost: number;
}

export interface ResolvedPose {
  target: [number, number, number];
  dir: [number, number, number];
  radius: number;
  rigs: Record<RigId, number>;
  look: Record<SubsystemId, SubsystemLook>;
  guides: number;
  channels: number;
  labels: Record<LabelId, number>;
}

const norm = (v: [number, number, number]): [number, number, number] => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

export function resolvePose(p: Pose, narrow: boolean): ResolvedPose {
  const focus = new Set(p.focus ?? []);
  const look = {} as Record<SubsystemId, SubsystemLook>;
  for (const s of SUBSYSTEMS) {
    const inFocus = focus.has(s);
    look[s] = {
      highlight: inFocus ? 1 : 0,
      dim: inFocus ? 0 : p.dim ?? 0,
      ghost: p.ghost?.[s] ?? 0,
    };
  }
  const r = {} as Record<RigId, number>;
  for (const id of RIG_IDS) r[id] = p.rigs?.[id] ?? 0;
  const l = {} as Record<LabelId, number>;
  for (const id of LABEL_IDS) l[id] = p.labels?.includes(id) && (!narrow || labels[id].mobile) ? 1 : 0;
  return {
    target: [...p.camera.target],
    dir: norm(p.camera.dir),
    radius: narrow ? p.camera.mobileRadius ?? p.camera.radius : p.camera.radius,
    rigs: r,
    look,
    guides: p.guides ?? 0,
    channels: p.channels ?? 0,
    labels: l,
  };
}

const lerp = (a: number, b: number, w: number) => a + (b - a) * w;

function slerpDir(a: [number, number, number], b: [number, number, number], w: number): [number, number, number] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const theta = Math.acos(dot);
  if (theta < 1e-4) return norm([lerp(a[0], b[0], w), lerp(a[1], b[1], w), lerp(a[2], b[2], w)]);
  const s = Math.sin(theta);
  const k0 = Math.sin((1 - w) * theta) / s;
  const k1 = Math.sin(w * theta) / s;
  return norm([a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1]);
}

export function blendPose(a: ResolvedPose, b: ResolvedPose, w: number): ResolvedPose {
  if (w <= 0) return a;
  if (w >= 1) return b;
  const look = {} as Record<SubsystemId, SubsystemLook>;
  for (const s of SUBSYSTEMS) {
    look[s] = {
      highlight: lerp(a.look[s].highlight, b.look[s].highlight, w),
      dim: lerp(a.look[s].dim, b.look[s].dim, w),
      ghost: lerp(a.look[s].ghost, b.look[s].ghost, w),
    };
  }
  const r = {} as Record<RigId, number>;
  for (const id of RIG_IDS) r[id] = lerp(a.rigs[id], b.rigs[id], w);
  const l = {} as Record<LabelId, number>;
  // Labels leave quickly and arrive late so two sets never crowd the frame.
  for (const id of LABEL_IDS) {
    const out = a.labels[id] * Math.max(0, 1 - w * 2.5);
    const inn = b.labels[id] * Math.max(0, (w - 0.6) / 0.4);
    l[id] = a.labels[id] && b.labels[id] ? 1 : Math.max(out, inn);
  }
  return {
    target: [lerp(a.target[0], b.target[0], w), lerp(a.target[1], b.target[1], w), lerp(a.target[2], b.target[2], w)],
    dir: slerpDir(a.dir, b.dir, w),
    radius: Math.exp(lerp(Math.log(a.radius), Math.log(b.radius), w)),
    rigs: r,
    look,
    guides: lerp(a.guides, b.guides, w),
    channels: lerp(a.channels, b.channels, w),
    labels: l,
  };
}

const smooth = (x: number) => {
  const c = Math.min(1, Math.max(0, x));
  return c * c * c * (c * (c * 6 - 15) + 10);
};

let cacheKey = '';
let cache: ResolvedPose[] = [];
function resolvedBeats(narrow: boolean) {
  const key = narrow ? 'n' : 'w';
  if (key !== cacheKey) {
    cache = beats.map((b) => resolvePose(b.pose, narrow));
    cacheKey = key;
  }
  return cache;
}

/**
 * Story state at position `t`. Beat i is fully established from
 * t = i - lead + length onward; the transition into it starts at t = i - lead.
 * With `discrete`, poses switch without interpolation (reduced motion).
 */
export function poseAt(t: number, narrow: boolean, discrete: boolean): ResolvedPose {
  const poses = resolvedBeats(narrow);
  const n = poses.length;
  if (discrete) {
    const i = Math.min(n - 1, Math.max(0, Math.floor(t + 0.15)));
    return poses[i];
  }
  let i = Math.floor(t + TRANSITION.lead);
  i = Math.min(n - 1, Math.max(0, i));
  if (i === 0) return poses[0];
  const w = smooth((t - (i - TRANSITION.lead)) / TRANSITION.length);
  return blendPose(poses[i - 1], poses[i], w);
}
