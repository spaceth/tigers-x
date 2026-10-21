// Extracts the chip's channel outlines (cut-outs in the two channel sheets, meshes
// 410 and 411) from Cube.glb as plan-view polygons in millimetres, and writes
// src/config/chip-channels.generated.json for the conceptual flow diagram.
//
//   node scripts/extract-channels.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LAYERS = { 410: 'upper', 411: 'lower' };

const glb = fs.readFileSync(path.join(root, 'Cube.glb'));
const jsonLen = glb.readUInt32LE(12);
const json = JSON.parse(glb.subarray(20, 20 + jsonLen).toString());
const binStart = 20 + jsonLen + 8;

function accessor(i) {
  const a = json.accessors[i];
  const bv = json.bufferViews[a.bufferView];
  const off = binStart + (bv.byteOffset || 0) + (a.byteOffset || 0);
  const n = a.count * (a.type === 'VEC3' ? 3 : 1);
  const C = a.componentType === 5126 ? Float32Array : a.componentType === 5125 ? Uint32Array : Uint16Array;
  return new C(glb.buffer.slice(glb.byteOffset + off, glb.byteOffset + off + n * C.BYTES_PER_ELEMENT));
}

const key = (x, z) => `${Math.round(x * 1000)},${Math.round(z * 1000)}`;
const area = (loop) => loop.reduce((s, p, i) => {
  const q = loop[(i + 1) % loop.length];
  return s + p[0] * q[1] - q[0] * p[1];
}, 0) / 2;

/** Drops points that lie on the straight line between their neighbours. */
function simplify(loop, tol = 0.02) {
  let pts = loop;
  for (let pass = 0; pass < 3; pass++) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i - 1 + pts.length) % pts.length];
      const b = pts[i];
      const c = pts[(i + 1) % pts.length];
      const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
      if (Math.abs(cross) / len > tol) out.push(b);
    }
    pts = out;
  }
  return pts;
}

function holesOf(meshIndex) {
  const prim = json.meshes[meshIndex].primitives[0];
  const pos = accessor(prim.attributes.POSITION).map((v) => v * 1000);
  const idx = accessor(prim.indices);
  let topY = -Infinity;
  for (let i = 1; i < pos.length; i += 3) topY = Math.max(topY, pos[i]);

  // Boundary edges of the upward-facing top face: outer outline plus every cut-out.
  const edges = new Map();
  const point = new Map();
  for (let k = 0; k < idx.length; k += 3) {
    const v = [0, 1, 2].map((o) => [pos[idx[k + o] * 3], pos[idx[k + o] * 3 + 1], pos[idx[k + o] * 3 + 2]]);
    if (v.some((p) => Math.abs(p[1] - topY) > 1e-3)) continue;
    const keys = v.map((p) => {
      const kk = key(p[0], p[2]);
      point.set(kk, [p[0], p[2]]);
      return kk;
    });
    if (new Set(keys).size < 3) continue;
    for (let e = 0; e < 3; e++) {
      const a = keys[e];
      const b = keys[(e + 1) % 3];
      const id = a < b ? `${a}|${b}` : `${b}|${a}`;
      const rec = edges.get(id);
      if (rec) rec.count++;
      else edges.set(id, { a, b, count: 1 });
    }
  }
  const next = new Map();
  for (const { a, b, count } of edges.values()) {
    if (count !== 1) continue;
    (next.get(a) ?? next.set(a, []).get(a)).push(b);
    (next.get(b) ?? next.set(b, []).get(b)).push(a);
  }
  const used = new Set();
  const loops = [];
  for (const start of next.keys()) {
    if (used.has(start)) continue;
    const loop = [start];
    used.add(start);
    let prev = null;
    let cur = start;
    for (;;) {
      const n = next.get(cur).find((x) => x !== prev && !used.has(x));
      if (!n) break;
      used.add(n);
      loop.push(n);
      prev = cur;
      cur = n;
    }
    if (loop.length > 2) loops.push(loop.map((k) => point.get(k)));
  }
  loops.sort((p, q) => Math.abs(area(q)) - Math.abs(area(p)));
  return { outline: loops[0], holes: loops.slice(1).map((l) => simplify(l)) };
}

const round = (n) => Math.round(n * 100) / 100;
let bounds = null;
const cutouts = [];
for (const [mesh, layer] of Object.entries(LAYERS)) {
  const { outline, holes } = holesOf(Number(mesh));
  if (!bounds) {
    const xs = outline.map((p) => p[0]);
    const zs = outline.map((p) => p[1]);
    bounds = { minX: Math.min(...xs), minZ: Math.min(...zs), maxX: Math.max(...xs), maxZ: Math.max(...zs) };
  }
  for (const h of holes) {
    const pts = h.map(([x, z]) => [round(x - bounds.minX), round(z - bounds.minZ)]);
    const zs = pts.map((p) => p[1]);
    cutouts.push({ layer, zMin: Math.min(...zs), zMax: Math.max(...zs), d: `M${pts.map((p) => p.join(' ')).join('L')}Z` });
  }
  console.log(`mesh ${mesh} (${layer}): ${holes.length} cut-outs`);
}

// Each network is one cut-out per layer occupying the same band; together they form the fluid path.
const networks = [];
for (const c of cutouts.sort((a, b) => a.zMin - b.zMin)) {
  const n = networks.find((g) => c.zMin < g.z[1] && c.zMax > g.z[0]);
  if (n) {
    n.z = [Math.min(n.z[0], c.zMin), Math.max(n.z[1], c.zMax)];
    n.paths[c.layer] = c.d;
  } else networks.push({ z: [c.zMin, c.zMax], paths: { [c.layer]: c.d } });
}
const out = {
  source: 'Cube.glb meshes 410 (upper channel sheet) and 411 (lower channel sheet), top-face cut-outs',
  units: 'mm',
  plane: 'plan view from above: x right, z down; origin at the chip corner',
  size: [round(bounds.maxX - bounds.minX), round(bounds.maxZ - bounds.minZ)],
  networks,
};
const file = path.join(root, 'src/config/chip-channels.generated.json');
fs.writeFileSync(file, JSON.stringify(out));
console.log(`wrote ${path.relative(root, file)} (${(fs.statSync(file).size / 1024).toFixed(1)} kB), chip ${out.size.join(' × ')} mm`);
