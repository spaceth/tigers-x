# TIGERS-X site — handoff

## Run

```bash
npm install
npm run dev        # http://localhost:5173 (runs sync-assets first)
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ locally
```

`sync-assets` (run automatically before `dev` and `build`) copies `patch.png` to
`public/media/patch.png` and compresses `Cube.glb` (22.7 MB) into
`public/models/tigers-x.glb` (≈3.6 MB, meshopt). Both outputs are generated and
git-ignored; the root inputs are never modified. Replace `Cube.glb` and the next
`dev`/`build` regenerates the web model.

After changing the CAD model, also run `npm run inspect-glb` (needs `Cube.STEP`) to
regenerate `src/config/model-parts.generated.json`, then re-check the story
mapping in `src/config/modelMap.ts` — subsystem rules partly use mesh indices.
Also run `npm run extract-channels` to re-trace the chip's channel outlines used by the
lab-on-a-chip flow diagram (`src/config/chip-channels.generated.json`); the inlet,
junction and Tesla-valve positions in `src/components/FlowDiagram.tsx` were read off
that outline and may need adjusting.

Development-only helpers in `scripts/`: `shoot.mjs` (headless Chrome screenshots
of every story beat and a console report), `inspect-step.mjs`, `raster-top.mjs`.

## Where to change things

| What | Where |
| --- | --- |
| Documentation link | `DOCS_URL` in `src/config/site.ts`. While `null`, the closing section says the documentation is forthcoming and renders no link. |
| Mission photos and video | `src/config/media.ts`. Put files in `public/media/mission/`, set `src` (and `poster` / `captions` for video), write a real `alt`. Placeholders keep the final aspect ratio. |
| Brand colours | `src/config/brand.ts`. `accentWarm` and `accentDeep` are **provisional** (the supplied `#ed6d2` / `#173b7` are not valid hex). Contrast notes are in the file; `accentWarm` is for graphics only, not small text. |
| Mission figures | `src/config/facts.ts` |
| Story copy and camera poses | `src/config/story.ts` (beats, labels, camera keys) |
| Part → subsystem mapping, explode rigs | `src/config/modelMap.ts` |
| Chapters / nav | `chapters` in `src/config/site.ts` |
| WebGL fallback image | Optional `public/media/payload-snapshot.webp` (`assets.modelSnapshot` in `site.ts`). Without it, an SVG outline is shown. Test with `?nowebgl`. |

## Known limitations

GLB (detail in `docs/model-notes.md`):

- Mesh names in the GLB are generic; part names were recovered from `Cube.STEP` by
  index alignment. If the GLB is re-exported without the matching STEP, the
  mapping must be re-verified.
- The STM32 microcontroller and the SSD cannot be identified as separate parts, so
  they are described in copy, not labelled in 3D.
- Which pump drives which channel, and which camera sees which region, is not
  recoverable from the CAD; the site makes no such claims.
- The number of reservoirs is not determinable from the model; the copy says
  "fluid storage".
- "Dual emulsifier" is not shown as two chips: the model contains one chip with
  two channel layers, and that is what is rendered.
- Two loose base nuts are not attached to any subsystem (they stay with the base).
- The CAD revision may differ from the flight unit.

Station schematic:

- The ISS, Columbus and ICE Cubes views are simplified, not to scale, and labelled
  as such. Module placement follows public ESA material; the rack position inside
  Columbus and the slot used inside ICE Cubes are illustrative.
- The network graphic shows the documented route (ICE Cubes Facility → Space
  Applications Services, Belgium → mission control, Thailand) without latency or
  bandwidth claims.

Other:

- `patch.png` is a copy of `Flight-Patch-2048x2048.png`.
- The flow diagram in the lab-on-a-chip chapter uses the real channel outline of
  one of the chip's four networks (from the CAD model), but its colours are
  conceptual: no measured flow, and which inlet carries which phase is not
  documented. The Tesla-valve description comes from the team, not from
  `tigers-x.md`.
