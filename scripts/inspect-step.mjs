// Development-only: reads Cube.STEP with OpenCascade (WASM) and writes the named
// assembly tree with per-mesh bounds to scripts/out/step-tree.json.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import occtFactory from 'occt-import-js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const occt = await occtFactory();
const buf = fs.readFileSync(path.join(root, 'Cube.STEP'));
const res = occt.ReadStepFile(new Uint8Array(buf), { linearUnit: 'meter', linearDeflectionType: 'bounding_box_ratio', linearDeflection: 0.001, angularDeflection: 0.5 });
if (!res.success) throw new Error('STEP read failed');

const meshes = res.meshes.map((m, i) => {
  const p = m.attributes.position.array;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let k = 0; k < p.length; k += 3) {
    for (let a = 0; a < 3; a++) {
      min[a] = Math.min(min[a], p[k + a]);
      max[a] = Math.max(max[a], p[k + a]);
    }
  }
  return { index: i, name: m.name, color: m.color, vertices: p.length / 3, min, max };
});

const owners = [];
function walk(node, trail) {
  const here = [...trail, node.name || '(unnamed)'];
  for (const mi of node.meshes) owners[mi] = here.join(' / ');
  for (const c of node.children) walk(c, here);
}
walk(res.root, []);
meshes.forEach((m) => (m.path = owners[m.index]));

fs.mkdirSync(path.join(root, 'scripts/out'), { recursive: true });
fs.writeFileSync(path.join(root, 'scripts/out/step-tree.json'), JSON.stringify(meshes, null, 1));
console.log('STEP meshes:', meshes.length);
