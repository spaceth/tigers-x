import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { specCopy } from '../content';
import { hasWebGL, useReducedMotion } from '../lib/hooks';
import { resolvePose, type ResolvedPose } from '../lib/pose';
import { applyPose, buildPayload, loadPayloadModel, type Payload } from '../stage/payload';
import { StaticFallback } from '../stage/Stage';

/** Same open view as Explore the payload, with nothing selected and no labels. */
const view = resolvePose(
  {
    camera: { target: [0, 50, 0], dir: [1.05, 0.95, 1.2], radius: 150 },
    rigs: { enclosure: 1 },
    ghost: { enclosure: 0.85 },
  },
  false,
);

function Environment() {
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
  return null;
}

function FitCamera({ pose }: { pose: ResolvedPose }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as { target: THREE.Vector3; update: () => void } | null;
  const size = useThree((s) => s.size);
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || size.width < 2 || !controls) return;
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const dist = pose.radius / Math.sin(Math.min(vfov, hfov) / 2);
    const target = new THREE.Vector3(...pose.target);
    camera.position.copy(new THREE.Vector3(...pose.dir).multiplyScalar(dist).add(target));
    camera.near = Math.max(1, dist * 0.05);
    camera.far = dist * 20;
    camera.updateProjectionMatrix();
    controls.target.copy(target);
    controls.update();
    fitted.current = true;
  }, [camera, controls, pose, size.width, size.height]);

  return null;
}

function Model({ payload }: { payload: Payload }) {
  useEffect(() => {
    applyPose(payload, view);
  }, [payload]);
  return <primitive object={payload.root} />;
}

function Scene({
  reducedMotion,
  onReady,
  onError,
  onProgress,
}: {
  reducedMotion: boolean;
  onReady: () => void;
  onError: (err: Error) => void;
  onProgress: (fraction: number) => void;
}) {
  const [payload, setPayload] = useState<Payload | null>(null);

  useEffect(() => {
    let disposed = false;
    let built: Payload | null = null;
    loadPayloadModel(onProgress)
      .then((gltf) => {
        if (disposed) return;
        built = buildPayload(gltf);
        setPayload(built);
      })
      .catch((err: Error) => {
        if (!disposed) onError(err);
      });
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
      <Environment />
      {payload && <Model payload={payload} />}
      <OrbitControls
        makeDefault
        target={view.target}
        enableDamping={!reducedMotion}
        enablePan={false}
        minDistance={220}
        maxDistance={1100}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2 + 0.25}
      />
      <FitCamera pose={view} />
    </>
  );
}

export default function SpecModel() {
  const reducedMotion = useReducedMotion();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unsupported'>(() =>
    hasWebGL() ? 'loading' : 'unsupported',
  );
  const [progress, setProgress] = useState(0);
  const onReady = useMemo(() => () => setStatus('ready'), []);
  const onError = useMemo(
    () => (err: Error) => {
      console.error('[TIGERS-X] specification model unavailable:', err);
      setStatus('error');
    },
    [],
  );
  const onProgress = useMemo(() => (fraction: number) => setProgress(fraction), []);

  if (status === 'unsupported' || status === 'error') {
    return (
      <div className="spec-model">
        <StaticFallback reason={status} />
      </div>
    );
  }

  return (
    <figure className="spec-model-block">
      <div className="spec-model">
      <Canvas
        frameloop="demand"
        dpr={[1, 1.75]}
        camera={{ fov: 28, near: 1, far: 6000, position: [400, 300, 500] }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping }}
        onCreated={({ gl }) => {
          gl.setClearColor(0xffffff, 1);
          gl.domElement.style.touchAction = 'none';
        }}
        aria-hidden="true"
      >
        <Scene reducedMotion={reducedMotion} onReady={onReady} onError={onError} onProgress={onProgress} />
      </Canvas>
      {status === 'loading' && (
        <div className="spec-model-loading" role="status">
          <span>{specCopy.chrome.modelLoading}</span>
          <span className="spec-model-bar" aria-hidden="true">
            <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
          </span>
        </div>
      )}
      </div>
      <figcaption>{specCopy.chrome.modelHint}</figcaption>
    </figure>
  );
}
