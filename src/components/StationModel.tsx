import { useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { assets } from '../config/site';
import { stickyProgress, useReducedMotion, useScrollFrame } from '../lib/hooks';

/** Columbus module in the NASA ISS model. */
const COLUMBUS = '_7_Columbus_Space_Laboratory';

let loadPromise: Promise<GLTF> | null = null;

function loadStation(): Promise<GLTF> {
  if (!loadPromise) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loadPromise = loader.loadAsync(assets.iss).catch((err: unknown) => {
      loadPromise = null;
      throw err instanceof Error ? err : new Error(String(err));
    });
  }
  return loadPromise;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

type TunedMaterial = { mat: THREE.MeshStandardMaterial; color: THREE.Color };
type TunedMesh = { columbus: boolean; materials: TunedMaterial[] };

type Framing = {
  widePos: THREE.Vector3;
  wideLook: THREE.Vector3;
  closePos: THREE.Vector3;
  closeLook: THREE.Vector3;
  far: number;
};

function tuneMaterials(model: THREE.Object3D): TunedMesh[] {
  const columbus = model.getObjectByName(COLUMBUS);
  const inColumbus = new Set<THREE.Object3D>();
  columbus?.traverse((obj) => inColumbus.add(obj));
  const tuned: TunedMesh[] = [];
  model.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const source = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.Material[];
    const materials: TunedMaterial[] = [];
    const clones = source.map((entry) => {
      const mat = entry.clone() as THREE.MeshStandardMaterial;
      if (mat.isMeshStandardMaterial) {
        mat.metalness = Math.min(mat.metalness, 0.12);
        mat.roughness = Math.max(mat.roughness, 0.7);
        mat.envMapIntensity = 0.22;
        materials.push({ mat, color: mat.color.clone() });
      }
      return mat;
    });
    mesh.material = clones.length === 1 ? clones[0] : clones;
    if (materials.length) tuned.push({ columbus: inColumbus.has(mesh), materials });
  });
  return tuned;
}

function frameOf(model: THREE.Object3D, camera: THREE.PerspectiveCamera, aspect: number): Framing | null {
  const columbus = model.getObjectByName(COLUMBUS);
  if (!columbus) return null;
  const center = new THREE.Box3().setFromObject(columbus).getCenter(new THREE.Vector3());
  const stationBox = new THREE.Box3().setFromObject(model);
  const stationCenter = stationBox.getCenter(new THREE.Vector3());
  const outward = center.clone().sub(stationCenter);
  outward.y = 0;
  if (outward.lengthSq() < 1e-4) outward.set(0, 0, 1);
  outward.normalize();
  const side = new THREE.Vector3().crossVectors(outward, new THREE.Vector3(0, 1, 0)).normalize();
  const view = outward.clone().multiplyScalar(0.9).add(side.multiplyScalar(0.35)).add(new THREE.Vector3(0, 0.72, 0)).normalize();

  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const half = Math.sin(Math.min(vFov, hFov) / 2);
  const stationRadius = stationBox.getBoundingSphere(new THREE.Sphere()).radius;
  const wideDist = (stationRadius / half) * 0.92;
  const wideLook = stationCenter.clone().lerp(center, 0.22);
  const columbusRadius = new THREE.Box3().setFromObject(columbus).getBoundingSphere(new THREE.Sphere()).radius;
  const closeDist = (columbusRadius / half) * 2.35;

  return {
    widePos: wideLook.clone().add(view.clone().multiplyScalar(wideDist)),
    wideLook,
    closePos: center.clone().add(view.clone().multiplyScalar(closeDist)),
    closeLook: center.clone(),
    far: wideDist * 8,
  };
}

function StationScene({
  dot,
  label,
  scale,
  progress,
  invalidateRef,
  reduced,
  onError,
}: {
  dot: RefObject<HTMLSpanElement | null>;
  label: RefObject<HTMLSpanElement | null>;
  scale: RefObject<HTMLSpanElement | null>;
  progress: RefObject<number>;
  invalidateRef: RefObject<() => void>;
  reduced: boolean;
  onError: () => void;
}) {
  const { camera, size, gl, scene, invalidate } = useThree();
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const focus = useRef(new THREE.Vector3());
  const projected = useRef(new THREE.Vector3());
  const tuned = useRef<TunedMesh[] | null>(null);
  const framing = useRef<Framing | null>(null);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    invalidateRef.current = invalidate;
  }, [invalidate, invalidateRef]);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.28;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    let live = true;
    loadStation()
      .then((gltf) => {
        if (live) setModel(gltf.scene);
      })
      .catch(() => {
        if (live) onError();
      });
    return () => {
      live = false;
    };
  }, [onError]);

  useEffect(() => {
    if (!model || size.width < 2 || size.height < 2) return;
    if (!model.userData.tuned) model.userData.tuned = tuneMaterials(model);
    tuned.current = model.userData.tuned as TunedMesh[];
    const columbus = model.getObjectByName(COLUMBUS);
    if (columbus) new THREE.Box3().setFromObject(columbus).getCenter(focus.current);
    framing.current = frameOf(model, camera as THREE.PerspectiveCamera, size.width / size.height);
    invalidate();
  }, [model, camera, size, invalidate]);

  useFrame(() => {
    const pose = framing.current;
    const persp = camera as THREE.PerspectiveCamera;
    const zoom = reducedRef.current ? 0 : progress.current;
    if (pose) {
      persp.position.lerpVectors(pose.widePos, pose.closePos, zoom);
      const look = pose.wideLook.clone().lerp(pose.closeLook, zoom);
      persp.near = 0.2;
      persp.far = pose.far;
      persp.lookAt(look);
      persp.updateProjectionMatrix();
      focus.current.copy(pose.closeLook);
    }
    const highlight = reducedRef.current ? 0.85 : zoom;
    const dim = 1 - highlight * 0.62;
    for (const entry of tuned.current ?? []) {
      const k = entry.columbus ? 1 : dim;
      for (const item of entry.materials) item.mat.color.copy(item.color).multiplyScalar(k);
    }

    const el = dot.current;
    const name = label.current;
    if (!el || !name || !model) return;
    projected.current.copy(focus.current).project(camera);
    const x = (projected.current.x + 1) / 2;
    const y = (1 - projected.current.y) / 2;
    const visible = zoom < 0.92 && projected.current.z < 1 && x > -0.05 && x < 1.05 && y > -0.05 && y < 1.05;
    el.hidden = !visible;
    name.hidden = !visible;
    const fade = String(1 - zoom);
    el.style.opacity = fade;
    name.style.opacity = fade;
    if (visible) {
      const host = el.parentElement;
      const width = host?.clientWidth ?? 1;
      const needed = name.offsetWidth + 18;
      const pos = `${x * 100}%`;
      const top = `${y * 100}%`;
      el.style.left = pos;
      el.style.top = top;
      name.style.left = pos;
      name.style.top = top;
      name.classList.toggle('is-flip', x * width < needed);
    }
    const caption = scale.current;
    if (caption) {
      const next = zoom > 0.82 ? 'Columbus' : 'International Space Station';
      if (caption.textContent !== next) caption.textContent = next;
    }
  });

  if (!model) return null;
  return (
    <>
      <ambientLight intensity={0.42} />
      <directionalLight position={[70, 150, 90]} intensity={1.15} />
      <directionalLight position={[-120, 24, -70]} intensity={0.28} />
      <primitive object={model} />
    </>
  );
}

export function StationModel() {
  const dot = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const scale = useRef<HTMLSpanElement>(null);
  const figure = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const invalidateRef = useRef<() => void>(() => {});
  const [failed, setFailed] = useState(false);
  const onError = useRef(() => setFailed(true)).current;
  const reduced = useReducedMotion();

  useScrollFrame(() => {
    const fig = figure.current;
    const track = fig?.closest('.scroller') as HTMLElement | null;
    if (!fig || !track) return;
    const outer = fig.closest('.scroller-figure') as HTMLElement | null;
    const pin = outer && getComputedStyle(outer).position === 'sticky' ? outer : fig;
    const next = smoothstep(0.1, 0.42, stickyProgress(track, pin));
    if (Math.abs(next - progress.current) < 0.002) return;
    progress.current = next;
    invalidateRef.current();
  });

  return (
    <figure ref={figure} className="station-figure">
      <div className="station-canvas" aria-hidden={failed ? undefined : true}>
        {failed ? (
          <p className="station-fallback">The station model could not be loaded.</p>
        ) : (
          <Canvas
            frameloop="demand"
            dpr={[1, 1.75]}
            camera={{ fov: 32, near: 0.2, far: 4000, position: [80, 40, 80] }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x101012, 1);
              gl.toneMappingExposure = 0.92;
              gl.domElement.style.touchAction = 'pan-y';
            }}
          >
            <StationScene
              dot={dot}
              label={label}
              scale={scale}
              progress={progress}
              invalidateRef={invalidateRef}
              reduced={reduced}
              onError={onError}
            />
          </Canvas>
        )}
        <span ref={dot} className="station-dot" hidden />
        <span ref={label} className="station-callout" hidden>
          Columbus
        </span>
      </div>
      <figcaption>
        <span ref={scale} className="scale-tag">International Space Station</span>
        <span className="figure-note">Columbus, the European laboratory, on the starboard side of Harmony.</span>
      </figcaption>
    </figure>
  );
}
