# Internal development note — Cube.glb scene graph and story mapping

Updated 21 October 2026. Audience: developers working on the public story site.

## 1. What the supplied GLB contains

| Property | Finding |
|---|---|
| Generator | `THREE.GLTFExporter r186` |
| Scene | One scene (`empty_1`) with **544 root nodes**; no nested groups |
| Node names | `empty_2` … `empty_545` — no semantic names |
| Transforms | None (all identity); geometry is baked in model space |
| Meshes | 544, one primitive each (`POSITION`, `NORMAL`, indices); ~604k vertices, ~640k triangles |
| Materials | 544 copies of one material: grey `0.604`, metalness 0, roughness 1, double-sided |
| Units / axes | Metres, **Y up**. Bounds X −100.2…100.2 mm, Y −7.1…100.2 mm, Z −100.2…100.2 mm |
| Envelope | 200 × 200 mm footprint (X × Z), 100 mm body height (Y 0–100); feet and the underside connector extend 7 mm below |

The GLB on its own cannot identify subsystems: names, hierarchy and materials were lost on export.

## 2. How names were recovered

`Cube.STEP` (SolidWorks 2020, *Experiment Cube Assembly*, dated 2025-08-10) sits beside the GLB. Read
with OpenCascade (`occt-import-js`), it tessellates to **exactly 544 meshes in the same order**. Every
GLB mesh `i` matches STEP mesh `i` with bounds equal to within 0.0 mm (checked per axis). The GLB is
therefore an unnamed export of this assembly, and the STEP assembly tree gives each mesh a part name.

- `npm run inspect-glb` repeats the check and writes `src/config/model-parts.generated.json`
  (index, assembly, part, bounds in mm, fastener attachment). It throws if the alignment ever breaks.
- The runtime web copy (`public/models/tigers-x.glb`) stores the original index in node extras
  (`sourceIndex`), so mapping never depends on export order.

The STEP is used only for names. Geometry, positions and proportions come from `Cube.glb`.

## 3. Assembly tree (STEP) with GLB indices and bounds (mm)

| CAD sub-assembly | GLB indices | Bounds min → max (X, Y, Z) | Contents (instance count) |
|---|---|---|---|
| `Structure part` | 0–40 | (−100, −7, −100) → (100, 100, 100) | Base Plate EM2, DB13 (14 bodies, idx 1–14), Corner ×4, EDGE ×2, Top Plate, Special Bracket ×2, Special EdgeEM2 ×2, Front Plate ×2, Side Plate EXP ×2, Panel Plate, Panel Bracket ×6, FOOT ×4 |
| `Electronic part` | 41–94 | (−94, 2, −82) → (−12, 76, 83) | PCB Part (41), **orange pi5 pro** (unnamed bodies 93–94), HUBBox (50), Hub (63), HUBBox_TOP (76), standoffs and fasteners |
| `ASM_Reservior` | 95–134 | (−3, 2, −8) → (97, 48, 84) | ContainerV2 ×2 (95, 96), Front_Panel (97), Bag_Casket (98), Luer-to-barb ×6, fasteners |
| `ASM_Camera_HS` | 135–236 | (12, 2, −89) → (81, 56, −10) | **SEE3CAM_Assembly ×4** (Camera_Layer 135/157/179/201, Board_Layer, Type C female), Cover_CameraV2 (223), BasePlate_CameraV3_withHS (224) |
| `EM_2PUMP` | 237–390 | (−7, 53, 2) → (97, 98, 90) | Pump_container (237), PUMPPLATE_TOP (238), PUMPLOCKER ×8, **rp-q2_PART ×8** (9 unnamed bodies each), fasteners |
| `Fluidic part` | 391–429 | (−5, 75, −94) → (97, 98, −5) | Chip Container (391), Chip Gasket (392), **Chip part** (409–412), Fitting_custom_Chip_V2 ×12 (413–424), Chip panel (425) |
| Loose fasteners | 430–543 | — | 114 screws/nuts at assembly root; 112 auto-attached to the part they sit in (`attachTo`), 2 nuts remain on the static base |

### Spatial layout (looking down Y)

```
            −Z (front plate 27)
   ┌──────────────┬──────────────────────┐
   │              │  chip (top, Y 78–93)  │
   │  electronics │  cameras below (2×2)  │
   │  PCB (Y 12)  ├──────────────────────┤
   │  Orange Pi   │  pumps (top, Y 53–98) │
   │  hub box     │  reservoir below      │
   └──────────────┴──────────────────────┘
  −X        panel plate at X≈−9        +X
            +Z (front plate 26)
```

### Chip part (409–412)

A 77.5 × 77.5 mm stack: 412 is the port layer (Y 81–85) with **12 port holes** matching the 12
fittings; 411 (Y 85–86) and 410 (Y 86–87) are 1 mm sheets with **channel cut-outs**; 409 (Y 87–91) is a
plain cover block. Plan-view rasters (`node scripts/raster-top.mjs out.png 411`) show **four channel
networks** in two mirrored pairs. Each network links two ports at one end with one port at the other,
through a long, repeatedly folding channel split across both layers.

Traced outlines (`node scripts/extract-channels.mjs` →
`src/config/chip-channels.generated.json`, used by the lab-on-a-chip flow diagram) show, for each
network with both layers overlaid:

- each of the two paired ports feeds **two parallel branches** (one route per sheet), so both
  ports meet at a Y-junction at the start of each branch;
- each branch is a chain of angled segments ending in rounded pockets;
- the two branches re-merge before the single port.

**Tesla valve.** The project team identifies these segments as Tesla-valve units (stated by the
team on 2026-10-21; `tigers-x.md` does not mention it). The site describes them as such and
explains the general principle (split, turn around a pocket, re-join at an angle). It makes no claim
about flow direction, diodicity or measured mixing performance. Which port carries which phase is
not established; the diagram says so.

## 4. Story mapping (configured in `src/config/modelMap.ts`)

| Story group | Selector | Confidence | Public label |
|---|---|---|---|
| `enclosure` | Structure plates, corners, edges | High (CAD names) | Aluminium enclosure (7075 is documented for the *structure* only) |
| `base` | Base Plate EM2, feet, panel plate/brackets | High | Base plate |
| `connector` | DB13 (1–14) | High: CAD name matches ESA's DB13W3 ICE Cubes receptacle | Facility connector |
| `pumps` | `EM_2PUMP` | High: 8 × rp-q2 bodies | Eight peristaltic pumps |
| `reservoir` | `ASM_Reservior` | Medium: CAD name says reservoir; fluid count unknown | Fluid storage |
| `chip` | `Fluidic part` | High | Microfluidic chip |
| `cameras` | `ASM_Camera_HS` | High: 4 × camera assemblies in 2 × 2 under the chip | Four cameras |
| `computer` | orange pi5 pro (93–94) | High | Orange Pi single-board computer |
| `mainBoard` | PCB Part (41) | Medium: custom board, function not named | Main circuit board |
| `hub` | HUBBox, Hub, HUBBox_TOP (+ spacers) | Medium | Hub enclosure |
| `stm32` | — | **Unresolved** | Not labelled |
| `storage` (SSD) | — | **Unresolved** | Not labelled |

## 5. Unresolved associations

- **STM32 microcontroller** — no CAD part carries the name. It may be on `PCB Part` or omitted from
  the model. Copy explains its role; no 3D label points at it.
- **SSD storage** — not in the CAD tree. Copy explains its role only.
- **Pump-to-channel / camera-to-channel assignment** — no tubing in the model; not shown.
- **Reservoir count** — `ASM_Reservior` has two `ContainerV2` shells and six Luer fittings; the
  number of fluid bags is not established, so no count is stated.
- **Dual emulsifier** — not mapped to any geometry. The four channel networks are not described as
  "dual".
- **CAD revision vs. flight unit** — the STEP is dated August 2025; it is treated as the design model.
