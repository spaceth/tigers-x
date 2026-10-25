// Extracts the lab-on-chip channel geometry from the flight chip's STL
// (source/chip-part-x.stl, "FM_Assembly - Fluidic part-1 Chip Part x-1") as
// plan-view outlines in millimetres, and writes src/config/chip-channels.generated.json
// for the flow diagrams.
//
// The chip is two 4 mm halves; the channels are 1 mm-deep pockets in the underside of
// the upper half, so their ceilings are the downward faces 1 mm above the joint. The
// ports are the through-holes in the bottom face.
//
//   node scripts/extract-channels.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'source/chip-part-x.stl';
const stl = fs.readFileSync(path.join(root, SOURCE));

/** Horizontal triangles grouped by height and facing: "88.161dn" → [[x, z] × 3][]. */
const levels = new Map();
for (let i = 0, n = stl.readUInt32LE(80); i < n; i++) {
  const o = 84 + 50 * i + 12;
  const v = Array.from({ length: 9 }, (_, k) => stl.readFloatLE(o + 4 * k));
  const ax = v[3] - v[0], ay = v[4] - v[1], az = v[5] - v[2];
  const bx = v[6] - v[0], by = v[7] - v[1], bz = v[8] - v[2];
  const ny = az * bx - ax * bz;
  const len = Math.hypot(ay * bz - az * by, ny, ax * by - ay * bx);
  if (!len || Math.abs(ny) / len < 0.999) continue;
  const id = `${v[1].toFixed(3)}${ny > 0 ? 'up' : 'dn'}`;
  if (!levels.has(id)) levels.set(id, []);
  levels.get(id).push([[v[0], v[2]], [v[3], v[5]], [v[6], v[8]]]);
}
const heights = [...levels.keys()].map((k) => parseFloat(k));
const bottom = Math.min(...heights);
const joint = bottom + 4;
const level = (y, facing) => levels.get(`${y.toFixed(3)}${facing}`) ?? [];

const key = ([x, z]) => `${Math.round(x * 1000)},${Math.round(z * 1000)}`;
const area = (loop) =>
  loop.reduce((s, p, i) => {
    const q = loop[(i + 1) % loop.length];
    return s + p[0] * q[1] - q[0] * p[1];
  }, 0) / 2;

/** Boundary loops of a set of coplanar triangles (outer outlines and holes). */
function loopsOf(tris) {
  const edges = new Map();
  const point = new Map();
  for (const t of tris) {
    const keys = t.map((p) => {
      const k = key(p);
      point.set(k, p);
      return k;
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
  return loops;
}

/**
 * Drops points that lie on the straight line from the last kept point to the next
 * one. Measuring from the last kept point stops smooth curves eroding away.
 */
function simplify(loop, tol = 0.005) {
  const out = [loop[0]];
  for (let i = 1; i < loop.length; i++) {
    const a = out[out.length - 1];
    const b = loop[i];
    const c = loop[(i + 1) % loop.length];
    const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
    if (Math.abs(cross) / len > tol) out.push(b);
  }
  return out;
}

const bbox = (loop) => {
  const xs = loop.map((p) => p[0]);
  const zs = loop.map((p) => p[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) };
};
const round = (n) => Math.round(n * 100) / 100;

// Chip outline: the largest loop of the bottom face.
const bottomLoops = loopsOf(level(bottom, 'dn')).sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
const chip = bbox(bottomLoops[0]);
const local = ([x, z]) => [round(x - chip.minX), round(z - chip.minZ)];

// Ports: round through-holes in the bottom face (engraved lettering is not round).
const ports = bottomLoops
  .slice(1)
  .map((l) => {
    const b = bbox(l);
    const w = b.maxX - b.minX;
    const h = b.maxZ - b.minZ;
    const [x, z] = local([(b.minX + b.maxX) / 2, (b.minZ + b.maxZ) / 2]);
    return { x, z, r: round((w + h) / 4), round: Math.abs(w - h) < 0.1 && Math.abs(area(l)) > 0.8 * Math.PI * (w / 2) ** 2 };
  })
  .filter((p) => p.round);

// Channels: ceilings of the pockets cut 1 mm into the upper half.
const channelLoops = loopsOf(level(joint + 1, 'dn'))
  .map((l) => ({ pts: simplify(l), box: bbox(l), a: Math.abs(area(l)) }))
  .filter((l) => l.pts.length >= 3 && l.a > 0.01);
const outers = channelLoops.filter((l) => !channelLoops.some((o) => o !== l && o.a > l.a && o.box.minX <= l.box.minX && o.box.maxX >= l.box.maxX && o.box.minZ <= l.box.minZ && o.box.maxZ >= l.box.maxZ));
outers.sort((a, b) => a.box.minZ - b.box.minZ);

const toPath = (loop) => `M${loop.map((p) => local(p).join(' ')).join('L')}Z`;
const rows = outers.map((o) => {
  const inner = channelLoops.filter((l) => l !== o && l.box.minX >= o.box.minX && l.box.maxX <= o.box.maxX && l.box.minZ >= o.box.minZ && l.box.maxZ <= o.box.maxZ);
  const [x0, z0] = local([o.box.minX, o.box.minZ]);
  const [x1, z1] = local([o.box.maxX, o.box.maxZ]);
  const mid = (z0 + z1) / 2;
  // Three ports on the row's centreline: the two inlets sit together at one end,
  // the outlet alone at the other.
  const rowPorts = ports.filter((p) => Math.abs(p.z - mid) < 1).sort((a, b) => a.x - b.x);
  if (rowPorts.length !== 3) throw new Error(`expected 3 ports on row at z ${mid}, found ${rowPorts.length}`);
  const [a, b, c] = rowPorts;
  const outlet = b.x - a.x > c.x - b.x ? a : c;
  const inlets = (outlet === a ? [c, b] : [a, b]);
  return {
    x: [x0, x1],
    z: [z0, z1],
    /** Flow runs from the inlets toward the outlet. */
    direction: outlet.x > inlets[0].x ? 'right' : 'left',
    inlets: inlets.map(({ x, z, r }) => ({ x, z, r })),
    outlet: { x: outlet.x, z: outlet.z, r: outlet.r },
    /** Channel area: outline plus island holes; draw with fill-rule evenodd. */
    d: [o, ...inner].map((l) => toPath(l.pts)).join(''),
  };
});

const out = {
  source: `${SOURCE} (flight chip, "FM_Assembly - Fluidic part-1 Chip Part x-1"): 1 mm-deep channel pockets at the joint of the two 4 mm halves`,
  units: 'mm',
  plane: 'plan view from above: x right, z down; origin at the chip corner',
  size: [round(chip.maxX - chip.minX), round(chip.maxZ - chip.minZ)],
  channelDepth: 1,
  rows,
};
const file = path.join(root, 'src/config/chip-channels.generated.json');
fs.writeFileSync(file, JSON.stringify(out));
for (const [i, r] of rows.entries()) {
  console.log(`row ${i + 1}: x ${r.x.join('–')} z ${r.z.join('–')}, flow ${r.direction}, inlets ${r.inlets.map((p) => `(${p.x}, ${p.z}) r${p.r}`).join(' ')}, outlet (${r.outlet.x}, ${r.outlet.z}) r${r.outlet.r}, ${r.d.split('M').length - 1} loops`);
}
console.log(`wrote ${path.relative(root, file)} (${(fs.statSync(file).size / 1024).toFixed(1)} kB), chip ${out.size.join(' × ')} mm`);
