# TIGERS-X

A public story about a small laboratory that went to orbit, and the page that tells it.

**TIGERS-X** is *Thailand Innovative G-force Varied Emulsification Research for Space Exploration*. It is a 200 × 200 × 100 mm experiment cube. In May 2026 it launched on SpaceX CRS-34, and the crew installed it in the ICE Cubes Facility inside Columbus, the European laboratory on the International Space Station. For ten days it pumped an oil and an aqueous phase through Tesla-valve microchannels and filmed what happened when gravity was no longer the force pulling them apart. After installation, the science runs were commanded from the ground.

Earlier flights on a parabolic aircraft gave the team about twenty seconds of reduced gravity at a time. The station gave them days. That is the whole reason the cube exists: long enough, and quiet enough, to watch two fluids that do not want to mix decide what they will do.

This repository is the website. The home page walks through that mission beside a model of the real payload. [`/specification`](specification/index.html) is the quieter room next door: interfaces, limits, and the drawings.

The science is published as Seehanam et al., *On-board International Space Station Verification of Autonomous Emulsification Lab-on-Chip Payload: TIGERS-X Project* ([doi:10.21203/rs.3.rs-11156278/v1](https://doi.org/10.21203/rs.3.rs-11156278/v1)). The videos and flight-model CAD are on Zenodo ([doi:10.5281/zenodo.22934189](https://doi.org/10.5281/zenodo.22934189)).

## Tech stack

Nothing exotic. A static site, a 3D library, and a build step that makes an engineer’s model small enough to send to a phone.

| Piece | Role |
| --- | --- |
| [Vite](https://vite.dev) | Dev server and production build. Two HTML entries: the story, and the specification. |
| React and TypeScript | The pages. |
| [three.js](https://threejs.org), via [React Three Fiber](https://r3f.docs.pmnd.rs) and [drei](https://github.com/pmndrs/drei) | Every WebGL scene. |
| GSAP | The payload chapter’s scroll-linked motion. |
| [gltf-transform](https://gltf-transform.dev) and [meshoptimizer](https://github.com/zeux/meshoptimizer) | Compress `Cube.glb` into the file the site actually downloads. |
| [occt-import-js](https://github.com/kovacsv/occt-import-js) | Reads the STEP assembly on the build machine, while the names are being recovered. |
| Poppins | The only typeface. |

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck, then dist/
npm run preview
```

`dev` and `build` run `scripts/sync-assets.mjs` first. That script copies the root artwork into `public/` and rebuilds the web model. It does not edit the files the engineers handed over.

## Where WebGL is doing the work

Most of the site is ordinary HTML: type, photographs, tables, and SVG drawings. WebGL is reserved for the moments when a flat picture would hide the machine.

**The payload stage** (`src/stage/`) is the main one. As the story scrolls, one canvas moves through the cube: panels lift, the shell ghosts, the camera settles on the pumps, the cameras, the chip. “Explore the payload” hands that same model to the reader, with orbit and zoom. Part labels are HTML sitting on top of the canvas, not text drawn in 3D, so they stay sharp and can be read by assistive technology.

**The station chapter** (`src/components/StationModel.tsx`) is a second canvas. It draws a simplified International Space Station and eases in on Columbus, so the reader can see where a 4-litre cube sits inside a building the size of a bus. The page calls it a sketch: simplified, and drawn to explain a place rather than to measure one.

**The specification page** (`src/components/SpecModel.tsx`) reuses the payload for the mechanical section: drag to turn it, scroll to come closer, no labels. The connector face and the subsystem views on that page are SVG images, not WebGL.

If the browser has no WebGL, or someone opens the story with `?nowebgl`, the stage shows a still image. `prefers-reduced-motion` keeps the model and quiets the travel.

The hero sky, the chip flow diagram, and the charts are CSS and SVG. The flow diagram is traced from the flight chip’s own STL (`source/chip-part-x.stl`). The channel sheets baked into the GLB differ in detail, so when the two disagree the diagram follows the part that flew.

## From a STEP file to a scene

A mechanical engineer can open the payload in SolidWorks and point at any screw. A web browser cannot. The handoff is two files of the same assembly, and this repo is the translation between them.

`Cube.STEP` is the engineer’s file: a SolidWorks assembly with a name on every body. `Cube.glb` is the same geometry exported for the web. The export is honest about the triangles and careless about everything else. It arrives as 544 meshes named `empty_2` through `empty_545`, one grey material, no groups. A pump and a washer are the same kind of object.

The names are still in the STEP file. OpenCascade tessellates that STEP into the same 544 meshes, in the same order. Mesh 237 in the GLB and mesh 237 in the STEP occupy the same box in space, to a tenth of a millimetre. Once that check passes, the STEP’s name can be written onto the GLB’s index. `npm run inspect-glb` does the check and writes `src/config/model-parts.generated.json`. If a future export drifts, the script throws. A silent mismatch would put the word “camera” on a pump, and that is worse than a build failure.

`src/config/modelMap.ts` is where the website takes a point of view. It groups those named meshes into the things a reader can hold in their head: the enclosure, the connector, eight peristaltic pumps, the fluid storage, four cameras, the computer, the chip. Loose fasteners inherit the part they sit in, so a screw travels with the plate it holds when the model opens up. Story beats in `src/config/story.ts` then decide the camera and how far each group moves. The colours in `src/stage/payload.ts` are studio lighting, a way to separate aluminium from a circuit board at a glance. The flight finish, where it is documented, stays in the text.

Before anyone downloads it, `sync-assets` welds duplicate vertices, compresses the mesh, and stamps the original index onto each node as `sourceIndex`. About 22.7 MB becomes about 3.6 MB. STEP stays on the machine that builds the site. The browser receives the GLB: the geometry from the export, the names recovered from the assembly, and a story told only where the drawing can defend it.

That last rule is the whole collaboration. If the CAD names a body `orange pi5 pro`, the model may point at it. If the paper describes an STM32 and no mesh carries that name, the sentence lives in the text and no leader line pretends otherwise. Engineers keep the assembly true. The site keeps the telling honest.

When a new export arrives, replace both `Cube.glb` and `Cube.STEP`, run `npm run inspect-glb`, and re-read the rules in `modelMap.ts`. The next `dev` or `build` regenerates the web model. The root files are left untouched. The deeper notes, including what is still unnamed, are in [`docs/model-notes.md`](docs/model-notes.md).

## Design guidelines

The site should feel like a well-printed paper that happens to contain a machine you can turn around. These are the rules already in the code. New work should follow them.

**One job per screen.** The hero states what flew and why. Each chapter after that answers the next question a curious reader would ask. If a block does not help someone understand the cube, the flight, or the result, it does not go on the page.

**Colour has a single source.** Every colour is a token in `src/config/brand.ts`, applied as CSS variables at startup and imported directly by the 3D scene. The reading surface is a warm paper (`#f6f5f2`). The payload and the station sit on black, because that is where the object should glow. Science, results, and the footer sit on the brand blue (`#173b72`). Orange (`#fa5f05`) is the highlight: a primary button, a hardware accent, the oil phase in the chip diagram. Small text stays in the ink greys, where the contrast is already measured.

**Type stays out of the way.** Poppins, a comfortable line height, and short paragraphs. Write the specific thing. “Eight peristaltic pumps” is better than “advanced fluidic actuation.” Numbers that come from two documents and disagree are both shown. They are never averaged into a third number nobody published.

**Motion explains the machine.** The camera moves because the reader is moving through the payload. Scroll ties the two together. Reduced motion and a missing graphics context still leave a complete page, with a loading bar while the model is on its way.

**A leader line is a claim.** It lands on a part the CAD named, or on a dimension the drawing states. A function we know only from a paragraph stays in the prose. The specification’s 3D view carries no labels: there the model is a picture of the envelope, and the tables do the talking.

**Drawings know their size.** On the specification page the subsystem views span the text column, so the screws are readable. The DB13W3 connector stays 300 pixels wide, because a connector drawing is a face full of pin numbers, and blowing it up does not make the pins clearer.

**A sketch says it is a sketch.** The station model, the flow colours, and the rendered metal are explanations. The caption, or the component beside it, says what kind of picture the reader is looking at, so the drawing and the evidence stay in step.

## Where to change things

| Change | File |
| --- | --- |
| Story copy and camera poses | `src/config/story.ts` |
| Which mesh belongs to which subsystem | `src/config/modelMap.ts` |
| Colours | `src/config/brand.ts` |
| Dates, masses, and other published figures | `src/config/facts.ts` |
| Chapter list | `src/config/site.ts` |
| Specification prose and drawings | `src/components/SpecificationPage.tsx` |

How to run the asset scripts, and the limits worth knowing before editing the model, are in [`docs/HANDOFF.md`](docs/HANDOFF.md).
