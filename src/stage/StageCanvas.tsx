import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { brand } from '../config/brand';
import { envelope } from '../config/facts';
import { explorerEntries } from '../config/explorer';
import type { SubsystemId } from '../config/modelMap';
import { labels, type LabelId, type Pose } from '../config/story';
import { blendPose, poseAt, resolvePose, type ResolvedPose } from '../lib/pose';
import { setStory, storyState, subscribeStory } from '../lib/storyStore';
import { labelElements } from './labelRegistry';
import { applyPose, boundsOf, buildPayload, loadPayloadModel, partOffsetMm, type Payload } from './payload';

export interface StageCanvasProps {
  narrow: boolean;
  reducedMotion: boolean;
  onReady: () => void;
  onError: (err: Error) => void;
  onProgress: (fraction: number) => void;
}

/** Label shown for each explorer entry while exploring. */
const exploreLabel: Record<string, LabelId> = {
  chip: 'chip',
  pumps: 'pumps',
  reservoir: 'reservoir',
  cameras: 'cameras',
  computing: 'computer',
  structure: 'structure',
  connector: 'connector',
};

function explorePose(selected: string | null): Pose {
  const entry = explorerEntries.find((e) => e.id === selected) ?? null;
  const id = entry?.id;
  return {
    camera: { target: [0, 50, 0], dir: [1.05, 0.95, 1.2], radius: 150 },
    rigs: {
      enclosure: id === 'structure' || id === 'connector' ? 0.5 : 1,
      chipLift: id === 'cameras' ? 1 : 0,
      hubLift: id === 'computing' ? 1 : 0,
      pumpsLift: id === 'reservoir' ? 1 : 0,
    },
    focus: entry ? (entry.members as SubsystemId[]) : [],
    dim: entry ? 0.45 : 0,
    ghost: { enclosure: id === 'structure' || id === 'connector' ? 0 : 0.85 },
    labels: id ? [exploreLabel[id]] : [],
  };
}

/* ------------------------------------------------------------------------- */

function useEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.62;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
}

function makeShadowTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, size * 0.18, size / 2, size / 2, size * 0.5);
  grad.addColorStop(0, 'rgba(40,38,34,0.55)');
  grad.addColorStop(0.55, 'rgba(40,38,34,0.22)');
  grad.addColorStop(1, 'rgba(40,38,34,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Envelope dimension guides tied to the model's own extents. */
function buildGuides() {
  const W = envelope.widthMm / 2;
  const H = envelope.heightMm;
  const o = 16; // offset from the body
  const tick = 7;
  const pts: number[] = [];
  const seg = (a: number[], b: number[]) => pts.push(...a, ...b);
  // width along X, in front of the +Z face, at the base
  seg([-W, 0, W + o], [W, 0, W + o]);
  seg([-W, 0, W + o - tick], [-W, 0, W + o + tick]);
  seg([W, 0, W + o - tick], [W, 0, W + o + tick]);
  // depth along Z, beside the +X face
  seg([W + o, 0, -W], [W + o, 0, W]);
  seg([W + o - tick, 0, -W], [W + o + tick, 0, -W]);
  seg([W + o - tick, 0, W], [W + o + tick, 0, W]);
  // height along Y at the front-right corner
  seg([W + o, 0, W + o], [W + o, H, W + o]);
  seg([W + o - tick, H, W + o], [W + o + tick, H, W + o]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const mat = new THREE.LineBasicMaterial({ color: brand.ink, transparent: true, opacity: 0, depthWrite: false });
  const lines = new THREE.LineSegments(geo, mat);
  lines.renderOrder = 2;
  const anchors: Record<string, THREE.Vector3> = {
    'guide-x': new THREE.Vector3(0, 0, W + o + 4),
    'guide-z': new THREE.Vector3(W + o + 4, 0, 0),
    'guide-y': new THREE.Vector3(W + o + 4, H / 2, W + o + 4),
  };
  return { lines, anchors };
}

/* ------------------------------------------------------------------------- */

interface DirectorProps extends StageCanvasProps {
  payload: Payload;
}

const labelIds = Object.keys(labels) as LabelId[];
const labelBounds = Object.fromEntries(labelIds.map((id) => [id, boundsOf(labels[id].parts)])) as Record<LabelId, THREE.Box3>;
const labelOwner = Object.fromEntries(labelIds.map((id) => [id, labels[id].parts[0]])) as Record<LabelId, number>;

function Director({ payload, narrow, reducedMotion }: DirectorProps) {
  const { camera, size, invalidate, gl, scene } = useThree();
  const guides = useMemo(buildGuides, []);
  const shadowTex = useMemo(makeShadowTexture, []);

  const shown = useRef<ResolvedPose | null>(null);
  const tween = useRef<{ from: ResolvedPose; start: number; duration: number; camFrom?: THREE.Vector3 } | null>(null);
  const mode = useRef<{ exploring: boolean; selected: string | null }>({ exploring: false, selected: null });
  const occlusion = useRef<Record<string, number>>({});
  const lastOcclusionCheck = useRef(0);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  // Re-render on any story change, on resize and when the stage becomes visible.
  useEffect(() => subscribeStory(() => storyState.stageVisible && invalidate()), [invalidate]);
  useEffect(() => invalidate(), [size, narrow, reducedMotion, invalidate]);

  useEffect(() => () => {
    guides.lines.geometry.dispose();
    (guides.lines.material as THREE.Material).dispose();
    shadowTex.dispose();
  }, [guides, shadowTex]);

  // Tap / click picking while exploring.
  useEffect(() => {
    const el = gl.domElement;
    let down: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
    const onUp = (e: PointerEvent) => {
      if (!storyState.exploring || !down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 6) return;
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const candidates = payload.parts.filter((p) => p.mesh.visible && (p.mesh.material as THREE.Material).opacity > 0.3).map((p) => p.mesh);
      const hit = raycaster.intersectObjects(candidates, false)[0];
      const sub = (hit?.object.userData.part as { sub: SubsystemId } | undefined)?.sub;
      const entry = sub ? explorerEntries.find((x) => x.members.includes(sub)) : undefined;
      setStory({ selected: entry ? entry.id : null });
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
    };
  }, [gl, camera, payload, raycaster]);

  const tmp = useMemo(
    () => ({ v: new THREE.Vector3(), w: new THREE.Vector3(), c: new THREE.Vector3(), off: new THREE.Vector3(), n: new THREE.Vector3() }),
    [],
  );

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    const cam = camera as THREE.PerspectiveCamera;

    // 1. Decide the goal pose.
    const exploring = storyState.exploring;
    const goal = exploring
      ? resolvePose(explorePose(storyState.selected), false)
      : poseAt(storyState.t, narrow, reducedMotion);

    const prevMode = mode.current;
    const modeChanged = prevMode.exploring !== exploring;
    const selectionChanged = exploring && prevMode.selected !== storyState.selected;
    if ((modeChanged || selectionChanged) && shown.current && !reducedMotion) {
      tween.current = {
        from: shown.current,
        start: now,
        duration: 0.7,
        camFrom: modeChanged && !exploring ? cam.position.clone() : undefined,
      };
    }
    mode.current = { exploring, selected: storyState.selected };

    // 2. Blend toward it (time-based only for mode/selection changes; scroll drives everything else).
    let pose = goal;
    let tweenW = 1;
    if (tween.current) {
      const k = Math.min(1, (now - tween.current.start) / tween.current.duration);
      tweenW = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      pose = blendPose(tween.current.from, goal, tweenW);
      if (k >= 1) tween.current = null;
      else invalidate();
    }
    shown.current = pose;

    // 3. Model.
    applyPose(payload, pose);

    // 4. Camera (orbit controls own it while exploring).
    if (!exploring) {
      const vfov = THREE.MathUtils.degToRad(cam.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * cam.aspect);
      const dist = pose.radius / Math.sin(Math.min(vfov, hfov) / 2);
      tmp.v.set(...pose.dir).multiplyScalar(dist).add(tmp.w.set(...pose.target));
      if (tween.current?.camFrom) tmp.v.lerpVectors(tween.current.camFrom, tmp.v, tweenW);
      cam.position.copy(tmp.v);
      cam.lookAt(tmp.w.set(...pose.target));
      cam.near = Math.max(1, dist * 0.05);
      cam.far = dist * 20;
      cam.updateProjectionMatrix();
    }

    // 5. Guides.
    const gm = guides.lines.material as THREE.LineBasicMaterial;
    gm.opacity = 0.55 * pose.guides;
    guides.lines.visible = pose.guides > 0.01;

    // 6. Labels.
    cam.updateMatrixWorld();
    const W = size.width;
    const H = size.height;
    const margin = 12;
    const reach = narrow ? 34 : 54;
    const centre = tmp.c.set(...pose.target).project(cam);
    const cx = (centre.x * 0.5 + 0.5) * W;
    const cy = (-centre.y * 0.5 + 0.5) * H;

    const doOcclusion = now - lastOcclusionCheck.current > 0.2;
    if (doOcclusion) lastOcclusionCheck.current = now;

    for (const id of labelIds) {
      const els = labelElements.get(id);
      if (!els) continue;
      const weight = pose.labels[id];
      if (weight < 0.01) {
        els.box.style.opacity = '0';
        els.box.style.visibility = 'hidden';
        els.line.style.opacity = '0';
        els.dot.style.opacity = '0';
        continue;
      }
      const def = labels[id];
      const b = labelBounds[id];
      const owner = payload.bySource[labelOwner[id]];
      partOffsetMm(owner ?? [], pose.rigs, tmp.off);
      tmp.v.set(
        b.min.x + (b.max.x - b.min.x) * def.at[0],
        b.min.y + (b.max.y - b.min.y) * def.at[1],
        b.min.z + (b.max.z - b.min.z) * def.at[2],
      ).add(tmp.off);

      // Facing test against the anchor's outward normal.
      tmp.n.set(...def.normal).normalize();
      const facing = tmp.n.dot(tmp.w.copy(cam.position).sub(tmp.v).normalize()) > -0.05;

      // Occlusion against opaque geometry from other subsystems (throttled).
      if (doOcclusion) {
        const dist = cam.position.distanceTo(tmp.v);
        raycaster.set(cam.position, tmp.w.copy(tmp.v).sub(cam.position).normalize());
        raycaster.far = dist - 1.5;
        const ownSub = owner?.sub;
        const blockers = payload.parts.filter(
          (p) => p.sub !== ownSub && p.mesh.visible && (p.mesh.material as THREE.Material).opacity > 0.6,
        );
        occlusion.current[id] = raycaster.intersectObjects(blockers.map((p) => p.mesh), false).length ? 0 : 1;
      }
      const visible = facing && (occlusion.current[id] ?? 1) > 0;
      const opacity = visible ? weight : 0;

      const p = tmp.w.copy(tmp.v).project(cam);
      const ax = (p.x * 0.5 + 0.5) * W;
      const ay = (-p.y * 0.5 + 0.5) * H;
      let dx = ax - cx;
      let dy = ay - cy;
      const len = Math.hypot(dx, dy);
      if (len < 1) {
        dx = 1;
        dy = -0.6;
      }
      const l = Math.hypot(dx, dy);
      dx /= l;
      dy /= l;
      // Bias labels toward horizontal so text stays readable beside the model.
      const ex = ax + dx * reach * 1.15;
      const ey = ay + dy * reach * 0.75;
      const right = dx >= 0;
      const bw = els.box.offsetWidth;
      const bh = els.box.offsetHeight;
      let bx = right ? ex + 6 : ex - 6 - bw;
      let by = ey - bh / 2;
      bx = Math.min(W - margin - bw, Math.max(margin, bx));
      by = Math.min(H - margin - bh, Math.max(margin, by));
      const lx = right ? bx - 4 : bx + bw + 4;
      const ly = by + bh / 2;

      els.box.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0)`;
      els.box.style.opacity = opacity.toFixed(3);
      els.box.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
      els.line.setAttribute('x1', ax.toFixed(1));
      els.line.setAttribute('y1', ay.toFixed(1));
      els.line.setAttribute('x2', lx.toFixed(1));
      els.line.setAttribute('y2', ly.toFixed(1));
      els.line.style.opacity = opacity.toFixed(3);
      els.dot.setAttribute('cx', ax.toFixed(1));
      els.dot.setAttribute('cy', ay.toFixed(1));
      els.dot.style.opacity = opacity.toFixed(3);
    }

    // Guide labels: centred on their anchors.
    for (const [id, anchor] of Object.entries(guides.anchors)) {
      const els = labelElements.get(id);
      if (!els) continue;
      const p = tmp.w.copy(anchor).project(cam);
      const x = (p.x * 0.5 + 0.5) * W;
      const y = (-p.y * 0.5 + 0.5) * H;
      const bw = els.box.offsetWidth;
      const bh = els.box.offsetHeight;
      const ox = id === 'guide-y' ? 10 : -bw / 2;
      const oy = id === 'guide-y' ? -bh / 2 : 8;
      els.box.style.transform = `translate3d(${(x + ox).toFixed(1)}px, ${(y + oy).toFixed(1)}px, 0)`;
      els.box.style.opacity = pose.guides.toFixed(3);
      els.box.style.visibility = pose.guides > 0.01 ? 'visible' : 'hidden';
    }

    scene.userData.ready = true;
  }, -1);

  return (
    <>
      <primitive object={payload.root} />
      <primitive object={guides.lines} />
      <mesh rotation-x={-Math.PI / 2} position={[0, -7.3, 0]} renderOrder={-1}>
        <planeGeometry args={[340, 340]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

function Scene(props: StageCanvasProps) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const { onReady, onError, onProgress } = props;
  const exploring = useExploring();
  useEnvironment();

  useEffect(() => {
    let disposed = false;
    let built: Payload | null = null;
    loadPayloadModel(onProgress)
      .then((gltf) => {
        if (disposed) return;
        built = buildPayload(gltf);
        setPayload(built);
      })
      .catch((err: Error) => !disposed && onError(err));
    return () => {
      disposed = true;
      built?.dispose();
    };
  }, [onError, onProgress]);

  useEffect(() => {
    if (payload) onReady();
  }, [payload, onReady]);

  return (
    <>
      <hemisphereLight args={['#ffffff', '#d9d6cf', 0.75]} />
      <directionalLight position={[-160, 320, 220]} intensity={1.7} />
      <directionalLight position={[300, 120, -200]} intensity={0.45} />
      {payload && <Director {...props} payload={payload} />}
      {exploring && (
        <OrbitControls
          target={[0, 50, 0]}
          enableDamping={!props.reducedMotion}
          enablePan={false}
          minDistance={220}
          maxDistance={1100}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2 + 0.25}
        />
      )}
      <TouchActionGuard exploring={exploring} />
    </>
  );
}

/** Orbit controls set `touch-action: none`; outside explore mode the canvas must let the page scroll. */
function TouchActionGuard({ exploring }: { exploring: boolean }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.domElement.style.touchAction = exploring ? 'none' : 'pan-y';
  });
  return null;
}

function useExploring() {
  const [v, setV] = useState(storyState.exploring);
  useEffect(() => subscribeStory(() => setV(storyState.exploring)), []);
  return v;
}

export default function StageCanvas(props: StageCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ fov: 28, near: 1, far: 6000, position: [400, 300, 500] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      aria-hidden="true"
    >
      <Scene {...props} />
    </Canvas>
  );
}
