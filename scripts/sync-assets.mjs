// Copies the root inputs into Vite's public/ directory (served at the site root in
// development and copied verbatim into dist/ by `vite build`). Root files are never
// modified.
//
//   patch.png -> public/media/patch.png             (byte-for-byte copy, original artwork)
//   parabolic.png -> public/media/parabolic-patch.png (parabolic-flight experiment patch)
//   medical.png, food.png, exploration.png -> public/media/icons/
//   cra.svg, mhesi.svg, tsri.svg -> public/media/partners/   (byte-for-byte)
//   pim.webp, gistda.webp, tmec.webp -> public/media/partners/ (transparent padding trimmed)
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

/** Drop fully transparent padding so a fixed CSS height matches the drawn mark. */
function contentBounds(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let n = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 8) {
        n++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!n) return null;
  const pad = 1;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const right = Math.min(width - 1, maxX + pad);
  const bottom = Math.min(height - 1, maxY + pad);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function copyTrimmedWebp(srcName, destRel) {
  const src = path.join(root, srcName);
  const dest = path.join(pub, destRel);
  if (!fs.existsSync(src)) throw new Error(`Missing root input: ${srcName}`);
  if (isFresh(src, dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const sharp = (await import('sharp')).default;
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const box = contentBounds(data, info.width, info.height);
  const image = box ? sharp(src).extract(box) : sharp(src);
  await image.webp({ lossless: true }).toFile(dest);
  console.log(`trimmed ${srcName} -> ${rel(dest)}${box ? ` ${box.width}x${box.height}` : ''}`);
}

copy('patch.png', 'media/patch.png');
copy('parabolic.png', 'media/parabolic-patch.png');
copy('medical.png', 'media/icons/medical.png');
copy('food.png', 'media/icons/food.png');
copy('exploration.png', 'media/icons/exploration.png');
copy('cra.svg', 'media/partners/cra.svg');
copy('mhesi.svg', 'media/partners/mhesi.svg');
copy('tsri.svg', 'media/partners/tsri.svg');
await copyTrimmedWebp('pim.webp', 'media/partners/pim.webp');
await copyTrimmedWebp('gistda.webp', 'media/partners/gistda.webp');
await copyTrimmedWebp('tmec.webp', 'media/partners/tmec.webp');
await buildModel();
