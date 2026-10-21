// Development-only: builds the GLB part inventory used by the story.
//
// Cube.glb has 544 flat, unnamed meshes ("empty_N", identity transforms, one shared
// grey material). Cube.STEP (SolidWorks "Experiment Cube Assembly") tessellates to
// the same 544 meshes in the same order, so we read the STEP assembly tree with
// OpenCascade, verify the index alignment against the GLB bounds, and write
// src/config/model-parts.generated.json.
//
// Run: npm run inspect-glb   (takes ~30 s, only needed when Cube.glb or Cube.STEP changes)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import occtFactory from 'occt-import-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readGlbJson(file) {
  const glb = fs.readFileSync(file);
  if (glb.readUInt32LE(0) !== 0x46546c67) throw new Error('Not a GLB file');
  const len = glb.readUInt32LE(12);
  return JSON.parse(glb.subarray(20, 20 + len).toString());
}

const gltf = readGlbJson(path.join(root, 'Cube.glb'));
const sceneNodes = gltf.scenes[gltf.scene ?? 0].nodes;
const glbMeshes = sceneNodes.map((nodeIndex) => {
  const node = gltf.nodes[nodeIndex];
  if (node.children?.length || node.matrix || node.translation || node.rotation || node.scale) {
    throw new Error(`Node ${nodeIndex} is not a flat identity node; the inventory assumptions no longer hold.`);
  }
  const acc = gltf.accessors[gltf.meshes[node.mesh].primitives[0].attributes.POSITION];
  return { nodeIndex, nodeName: node.name, min: acc.min, max: acc.max, vertices: acc.count };
});

const occt = await occtFactory();
const step = occt.ReadStepFile(new Uint8Array(fs.readFileSync(path.join(root, 'Cube.STEP'))), {
  linearUnit: 'meter',
  linearDeflectionType: 'bounding_box_ratio',
  linearDeflection: 0.001,
  angularDeflection: 0.5,
});
if (!step.success) throw new Error('STEP read failed');

const owner = [];
(function walk(node, trail) {
  const here = [...trail, node.name];
  for (const mi of node.meshes) owner[mi] = here;
  for (const c of node.children) walk(c, here);
})(step.root, []);

if (step.meshes.length !== glbMeshes.length) {
  throw new Error(`Mesh count mismatch: GLB ${glbMeshes.length}, STEP ${step.meshes.length}`);
}

const mm = (v) => Math.round(v * 10000) / 10;
let worst = 0;
const parts = glbMeshes.map((g, i) => {
  const s = step.meshes[i];
  const p = s.attributes.position.array;
  const smin = [Infinity, Infinity, Infinity];
  const smax = [-Infinity, -Infinity, -Infinity];
  for (let k = 0; k < p.length; k += 3) for (let a = 0; a < 3; a++) {
    smin[a] = Math.min(smin[a], p[k + a]);
    smax[a] = Math.max(smax[a], p[k + a]);
  }
  const err = Math.max(...[0, 1, 2].map((a) => Math.max(Math.abs(smin[a] - g.min[a]), Math.abs(smax[a] - g.max[a]))));
  worst = Math.max(worst, err);
  if (err > 1e-4) throw new Error(`GLB mesh ${i} does not match STEP mesh ${i} (bounds differ by ${err} m)`);
  const trail = owner[i].slice(2); // drop "(root)" and "Experiment Cube Assembly"
  return {
    i,
    node: g.nodeName,
    assembly: trail[0] ?? '',
    part: s.name || '',
    min: g.min.map(mm),
    max: g.max.map(mm),
    vertices: g.vertices,
  };
});

// Top-level fasteners are not children of the sub-assembly they hold together.
// Attach each to the smallest part whose bounds contain the fastener centre.
const isLooseFastener = (p) => /screw|Nyloc/i.test(p.assembly);
for (const p of parts.filter(isLooseFastener)) {
  const c = p.min.map((v, a) => (v + p.max[a]) / 2);
  let best = null;
  let bestVol = Infinity;
  for (const q of parts) {
    if (isLooseFastener(q) || q.assembly === '') continue;
    const inside = c.every((v, a) => v >= q.min[a] - 2 && v <= q.max[a] + 2);
    if (!inside) continue;
    const vol = q.max.reduce((acc, v, a) => acc * Math.max(v - q.min[a], 1), 1);
    if (vol < bestVol) { bestVol = vol; best = q; }
  }
  if (!best) {
    // Fall back to the nearest part surface within 6 mm (nuts seated just outside a bracket).
    let bestDist = 6;
    for (const q of parts) {
      if (isLooseFastener(q) || q.assembly === '' || q.assembly === 'Structure part') continue;
      const d = Math.hypot(...c.map((v, a) => Math.max(q.min[a] - v, 0, v - q.max[a])));
      if (d < bestDist) { bestDist = d; best = q; }
    }
  }
  p.attachTo = best ? best.i : null;
}

const out = path.join(root, 'src/config/model-parts.generated.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({
  source: 'Cube.glb (geometry) + Cube.STEP (names); index-aligned',
  units: 'mm, Y up',
  maxBoundsError_mm: mm(worst),
  parts,
}, null, 0).replace(/\{"i"/g, '\n{"i"'));
console.log(`Wrote ${parts.length} parts (max bounds error ${mm(worst)} mm) to ${path.relative(root, out)}`);
const unattached = parts.filter((p) => isLooseFastener(p) && p.attachTo === null);
console.log(`Loose fasteners: ${parts.filter(isLooseFastener).length}, unattached: ${unattached.length}`);
