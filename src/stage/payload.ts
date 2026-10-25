import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { brand } from '../config/brand';
import { assets } from '../config/site';
import {
  materialRoleOf, motionsOf, parts, rigs, subsystemOf,
  type MaterialRole, type PartMotion, type PartRecord, type SubsystemId,
} from '../config/modelMap';
import type { ResolvedPose } from '../lib/pose';

/* ------------------------------- Loading ------------------------------- */

type ProgressListener = (fraction: number) => void;
let loadPromise: Promise<GLTF> | null = null;
let lastProgress = 0;
const progressListeners = new Set<ProgressListener>();

export function loadPayloadModel(onProgress?: ProgressListener): Promise<GLTF> {
  if (onProgress) {
    progressListeners.add(onProgress);
    onProgress(lastProgress);
  }
  if (!loadPromise) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loadPromise = new Promise<GLTF>((resolve, reject) => {
      loader.load(
        assets.model,
        resolve,
        (e) => {
          if (e.lengthComputable && e.total > 0) {
            lastProgress = e.loaded / e.total;
            progressListeners.forEach((l) => l(lastProgress));
          }
        },
        (err) => {
          loadPromise = null;
          reject(err instanceof Error ? err : new Error(String(err)));
        },
      );
    });
  }
  return loadPromise;
}

export function offProgress(l: ProgressListener) {
  progressListeners.delete(l);
}

/* ------------------------------ Materials ------------------------------ */

interface RoleLook {
  color: string;
  metalness: number;
  roughness: number;
  opacity?: number;
  /** Exclude from the warm highlight (the chip layers carry the channel tint instead). */
  noHighlight?: boolean;
}

/** Neutral studio renderings. They do not describe documented material finishes. */
const roleLooks: Record<MaterialRole, RoleLook> = {
  aluminium: { color: '#d6d7d8', metalness: 0.55, roughness: 0.36 },
  aluminiumDark: { color: '#c3c5c7', metalness: 0.5, roughness: 0.42 },
  fastener: { color: '#75787d', metalness: 0.75, roughness: 0.32 },
  circuit: { color: '#3d4144', metalness: 0.15, roughness: 0.55 },
  module: { color: '#2c2e32', metalness: 0.25, roughness: 0.45 },
  polymer: { color: '#ecebe8', metalness: 0, roughness: 0.62 },
  pumpHead: { color: '#46494e', metalness: 0.2, roughness: 0.5 },
  cameraBody: { color: '#2b2c2f', metalness: 0.2, roughness: 0.42 },
  chipCover: { color: '#ffffff', metalness: 0, roughness: 0.08, opacity: 0.38, noHighlight: true },
  chipChannelUpper: { color: '#d5dbe3', metalness: 0, roughness: 0.3, noHighlight: true },
  chipChannelLower: { color: '#c3cad3', metalness: 0, roughness: 0.3, noHighlight: true },
  chipBase: { color: '#ffffff', metalness: 0, roughness: 0.35, noHighlight: true },
  gasket: { color: '#8e9093', metalness: 0, roughness: 0.8 },
};

const warm = new THREE.Color(brand.accentWarm);
const deep = new THREE.Color(brand.accentDeep);
const backdrop = new THREE.Color('#ffffff');

interface MaterialSlot {
  material: THREE.MeshStandardMaterial;
  sub: SubsystemId;
  role: MaterialRole;
  base: THREE.Color;
  baseOpacity: number;
  meshes: THREE.Mesh[];
}

/* ------------------------------- Payload ------------------------------- */

export interface PayloadPart {
  mesh: THREE.Mesh;
  record: PartRecord;
  sub: SubsystemId;
  /** Immutable original node position (model units, metres). */
  base: THREE.Vector3;
  motions: PartMotion[];
}

export interface Payload {
  /** Scaled to millimetres; add to the scene. */
  root: THREE.Group;
  parts: PayloadPart[];
  bySource: PayloadPart[];
  slots: MaterialSlot[];
  dispose(): void;
}

export function buildPayload(gltf: GLTF): Payload {
  const root = new THREE.Group();
  root.name = 'TIGERS-X';
  root.scale.setScalar(1000);

  const sourceRoot = gltf.scene.clone(true);
  const meshes: THREE.Mesh[] = [];
  sourceRoot.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });

  const slotMap = new Map<string, MaterialSlot>();
  const bySource: PayloadPart[] = new Array(parts.length);
  const out: PayloadPart[] = [];

  for (const mesh of meshes) {
    // GLTFLoader puts node extras on the node; a single-primitive node is the mesh itself.
    const idx = (mesh.userData.sourceIndex ?? mesh.parent?.userData.sourceIndex) as number | undefined;
    if (idx === undefined || !parts[idx]) {
      console.warn('[TIGERS-X] mesh without a sourceIndex mapping', mesh.name);
      continue;
    }
    const record = parts[idx];
    const sub = subsystemOf(record);
    const role = materialRoleOf(record);
    const key = `${sub}|${role}`;
    let slot = slotMap.get(key);
    if (!slot) {
      const look = roleLooks[role];
      const material = new THREE.MeshStandardMaterial({
        color: look.color,
        metalness: look.metalness,
        roughness: look.roughness,
        transparent: look.opacity !== undefined,
        opacity: look.opacity ?? 1,
        depthWrite: look.opacity === undefined,
        side: THREE.DoubleSide,
      });
      material.name = key;
      slot = { material, sub, role, base: new THREE.Color(look.color), baseOpacity: look.opacity ?? 1, meshes: [] };
      slotMap.set(key, slot);
    }
    // Never mutate the loader's shared material.
    mesh.material = slot.material;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    slot.meshes.push(mesh);

    // Flatten into our root while keeping the node's own (quantisation) transform.
    mesh.updateWorldMatrix(true, false);
    const world = mesh.matrixWorld.clone();
    world.decompose(mesh.position, mesh.quaternion, mesh.scale);
    const part: PayloadPart = { mesh, record, sub, base: mesh.position.clone(), motions: motionsOf(record) };
    mesh.userData.part = part;
    root.add(mesh);
    bySource[idx] = part;
    out.push(part);
  }

  if (out.length !== parts.length) {
    console.warn(`[TIGERS-X] mapped ${out.length} of ${parts.length} model parts`);
  }

  return {
    root,
    parts: out,
    bySource,
    slots: [...slotMap.values()],
    dispose() {
      slotMap.forEach((s) => s.material.dispose());
      out.forEach((p) => p.mesh.geometry.dispose());
    },
  };
}

/** Offset (mm) of a part for the given rig amounts. Pure: depends only on the pose. */
export function partOffsetMm(part: PayloadPart | PartMotion[], rigAmounts: ResolvedPose['rigs'], target = new THREE.Vector3()) {
  target.set(0, 0, 0);
  const motions = Array.isArray(part) ? part : part.motions;
  for (const m of motions) {
    const amount = rigAmounts[m.rig];
    if (!amount) continue;
    const d = rigs[m.rig].distance * amount;
    target.x += m.vector[0] * d;
    target.y += m.vector[1] * d;
    target.z += m.vector[2] * d;
  }
  return target;
}

const tmp = new THREE.Vector3();
const tmpColor = new THREE.Color();

export function applyPose(payload: Payload, pose: ResolvedPose) {
  for (const p of payload.parts) {
    partOffsetMm(p, pose.rigs, tmp);
    p.mesh.position.set(p.base.x + tmp.x / 1000, p.base.y + tmp.y / 1000, p.base.z + tmp.z / 1000);
  }

  for (const slot of payload.slots) {
    const look = pose.look[slot.sub];
    const m = slot.material;
    const noHighlight = roleLooks[slot.role].noHighlight;
    tmpColor.copy(slot.base);
    if (slot.role === 'chipBase' && pose.channels > 0) tmpColor.lerp(deep, 0.92 * pose.channels);
    if (!noHighlight && look.highlight > 0) tmpColor.lerp(warm, 0.88 * look.highlight);
    if (look.dim > 0) tmpColor.lerp(backdrop, 0.62 * look.dim);
    m.color.copy(tmpColor);
    m.emissive.copy(warm).multiplyScalar(noHighlight ? 0 : 0.04 * look.highlight);

    const opacity = slot.baseOpacity * (1 - 0.94 * look.ghost);
    const wantsTransparent = opacity < 0.999;
    if (m.transparent !== wantsTransparent) {
      m.transparent = wantsTransparent;
      m.needsUpdate = true;
    }
    m.opacity = opacity;
    m.depthWrite = opacity > 0.9;
    const visible = opacity > 0.02;
    for (const mesh of slot.meshes) mesh.visible = visible;
  }
}

/** Combined bounds (mm, original positions) of a set of GLB indices. */
export function boundsOf(indices: number[]) {
  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (const i of indices) {
    const r = parts[i];
    min.min(new THREE.Vector3(...r.min));
    max.max(new THREE.Vector3(...r.max));
  }
  return new THREE.Box3(min, max);
}
