// Copies the root inputs into Vite's public/ directory (served at the site root in
// development and copied verbatim into dist/ by `vite build`). Root files are never
// modified.
//
//   patch.png -> public/media/patch.png             (byte-for-byte copy, original artwork)
//   Cube.glb  -> public/models/tigers-x.glb         (meshopt-compressed web copy)
//
// The web copy keeps every mesh, in the original order, and stores the original
// scene index in node extras (`sourceIndex`) so the story mapping always refers to
// the supplied model rather than to a reordered derivative.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'public');
const rel = (p) => path.relative(root, p);

function isFresh(src, dest) {
  return fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs
    && fs.statSync(dest).mtimeMs >= fs.statSync(fileURLToPath(import.meta.url)).mtimeMs;
}

function copy(srcName, destRel) {
  const src = path.join(root, srcName);
  const dest = path.join(pub, destRel);
  if (!fs.existsSync(src)) throw new Error(`Missing root input: ${srcName}`);
  if (isFresh(src, dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`copied ${srcName} -> ${rel(dest)}`);
}

async function buildModel() {
  const src = path.join(root, 'Cube.glb');
  const dest = path.join(pub, 'models/tigers-x.glb');
  if (!fs.existsSync(src)) throw new Error('Missing root input: Cube.glb');
  if (isFresh(src, dest)) return;

  await MeshoptEncoder.ready;
  const io = new NodeIO()
    .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
    .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  const doc = await io.read(src);
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];
  scene.listChildren().forEach((node, i) => node.setExtras({ ...node.getExtras(), sourceIndex: i }));

  await doc.transform(weld(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await io.write(dest, doc);
  const mb = (f) => (fs.statSync(f).size / 1e6).toFixed(1);
  console.log(`built ${rel(dest)} (${mb(src)} MB -> ${mb(dest)} MB)`);
}

copy('patch.png', 'media/patch.png');
await buildModel();
