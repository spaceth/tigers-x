// Development-only: rasterizes selected Cube.glb meshes in plan view (looking down -Y)
// to a PNG height map, for checking whether chip channel geometry is present.
// Usage: node scripts/raster-top.mjs out.png 409,410,411,412 [view=top|front]
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [outFile, idxArg, view = 'top'] = process.argv.slice(2);
const wanted = idxArg.split(',').flatMap((s) => {
  const [a, b] = s.split('-').map(Number);
  return b === undefined ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i);
});

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

const tris = [];
let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];
for (const mi of wanted) {
  const p = json.meshes[mi].primitives[0];
  const pos = accessor(p.attributes.POSITION);
  const idx = accessor(p.indices);
  for (let k = 0; k < idx.length; k += 3) {
    const t = [0, 1, 2].map((o) => [pos[idx[k + o] * 3], pos[idx[k + o] * 3 + 1], pos[idx[k + o] * 3 + 2]]);
    tris.push(t);
    for (const v of t) for (let a = 0; a < 3; a++) { min[a] = Math.min(min[a], v[a]); max[a] = Math.max(max[a], v[a]); }
  }
}
// top: u=x, v=z, depth=y ; front: u=x, v=-y, depth=z
const U = 0, V = view === 'top' ? 2 : 1, D = view === 'top' ? 1 : 2;
const W = 1200;
const scale = W / Math.max(max[U] - min[U], max[V] - min[V]);
const H = Math.ceil((max[V] - min[V]) * scale) + 1;
const depth = new Float32Array(W * H).fill(-Infinity);
for (const t of tris) {
  const p = t.map((v) => [(v[U] - min[U]) * scale, view === 'top' ? (v[V] - min[V]) * scale : (max[V] - v[V]) * scale, v[D]]);
  const x0 = Math.max(0, Math.floor(Math.min(p[0][0], p[1][0], p[2][0])));
  const x1 = Math.min(W - 1, Math.ceil(Math.max(p[0][0], p[1][0], p[2][0])));
  const y0 = Math.max(0, Math.floor(Math.min(p[0][1], p[1][1], p[2][1])));
  const y1 = Math.min(H - 1, Math.ceil(Math.max(p[0][1], p[1][1], p[2][1])));
  const area = (p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) - (p[2][0] - p[0][0]) * (p[1][1] - p[0][1]);
  if (Math.abs(area) < 1e-9) continue;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const w0 = ((p[1][0] - x) * (p[2][1] - y) - (p[2][0] - x) * (p[1][1] - y)) / area;
    const w1 = ((p[2][0] - x) * (p[0][1] - y) - (p[0][0] - x) * (p[2][1] - y)) / area;
    const w2 = 1 - w0 - w1;
    if (w0 < 0 || w1 < 0 || w2 < 0) continue;
    const d = w0 * p[0][2] + w1 * p[1][2] + w2 * p[2][2];
    if (d > depth[y * W + x]) depth[y * W + x] = d;
  }
}
const lo = min[D], hi = max[D];
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0;
  for (let x = 0; x < W; x++) {
    const d = depth[y * W + x];
    const c = d === -Infinity ? 255 : Math.round(30 + 190 * ((d - lo) / (hi - lo || 1)));
    raw.fill(c, y * (W * 3 + 1) + 1 + x * 3, y * (W * 3 + 1) + 4 + x * 3);
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
fs.writeFileSync(outFile, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('wrote', outFile, W, H, 'mm range', min.map((v) => (v * 1000).toFixed(1)), max.map((v) => (v * 1000).toFixed(1)));
