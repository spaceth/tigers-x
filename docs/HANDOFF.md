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
The flow diagrams' channel outlines come from the flight chip's STL, not the GLB:
`source/chip-part-x.stl`. If the chip changes, replace that file and run
`npm run extract-channels` (writes `src/config/chip-channels.generated.json`); the
junction, chamber and inset positions in `src/components/FlowDiagram.tsx` were read
off that outline and may need adjusting.

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
- The STM32F746 microcontroller cannot be identified as a separate part, so it is
  described in copy, not labelled in 3D. (The paper mentions no SSD; the Orange Pi
  stores images and telemetry, so the SSD was dropped from the copy.)
- Per the paper, each of the four channels has its own pump pair (one per fluid)
  and its own mixture bag; which physical pump in the CAD is which is still not
  recoverable, so the 3D labels stay generic. Which camera sees which region is
  not claimed.
- The model's four channel networks are the paper's four channel rows: CH1
  (rows 1–2) and CH2 (rows 3–4), two devices on one chip assembly.
- Two loose base nuts are not attached to any subsystem (they stay with the base).
- The CAD revision may differ from the flight unit.

Station schematic:

- The ISS, Columbus and ICE Cubes views are simplified, not to scale, and labelled
  as such. Module placement follows public ESA material; the rack position inside
  Columbus and the slot used inside ICE Cubes are illustrative.
- The network graphic shows the route described in the paper (ICE Cubes Facility
  → ICE Cubes Mission Control Centre, Space Applications Services, Belgium → VPN
  → CRA User Home Base, Bangkok, YAMCS) without latency or bandwidth claims.

Sources:

- Science, hardware, verification and results follow the paper: Seehanam et al.,
  "On-board International Space Station Verification of Autonomous Emulsification
  Lab-on-Chip Payload: TIGERS-X Project", Research Square preprint,
  doi:10.21203/rs.3.rs-11156278/v1 (data: doi:10.5281/zenodo.22934189). Figures
  live in `src/config/facts.ts`, tagged [paper] or [report].
- The operation counts in the Record chapter (duration, files, GB, commands, pump
  operations) come from the team's mission report in `tigers-x.md`, not the paper.
- ISHA Lab appears in `tigers-x.md` but not in the paper's affiliations; it is kept
  alongside the paper's three institutions.
- The "events" flow schematic is drawn from the paper's text description of
  Figure 7, not from the flight images; replace it with real frames from the
  Zenodo videos if they are added.

Other:

- `patch.png` is a copy of `Flight-Patch-2048x2048.png`.
- The flow diagram in the lab-on-a-chip chapter uses the real channel outline of
  one of the chip's four rows (from the flight chip's STL), but its colours are
  conceptual: no measured flow, and which inlet carries which phase is not
  documented. Phase colours match the flight fluids (teal water, orange oil).
  The mixing-index chart in the Results chapter plots the paper's Figure 9 values.
