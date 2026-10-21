/**
 * Mapping between real Cube.glb meshes and story subsystems.
 *
 * Cube.glb's 544 meshes are unnamed; names come from the index-aligned CAD
 * assembly (Cube.STEP), recorded in model-parts.generated.json by
 * `npm run inspect-glb`. See docs/model-notes.md for the evidence.
 *
 * Rules are evaluated top to bottom; the first match wins. Loose fasteners
 * inherit the subsystem and motion of the part they are seated in (`attachTo`).
 */
import inventory from './model-parts.generated.json';

export interface PartRecord {
  i: number;
  node: string;
  assembly: string;
  part: string;
  min: [number, number, number];
  max: [number, number, number];
  vertices: number;
  attachTo?: number | null;
}

export const parts = inventory.parts as PartRecord[];

export type SubsystemId =
  | 'enclosure'
  | 'base'
  | 'connector'
  | 'reservoir'
  | 'pumps'
  | 'chip'
  | 'cameras'
  | 'computer'
  | 'mainBoard'
  | 'hub'
  | 'electronics';

/** Visual material roles. Colours are neutral renderings, not documented finishes. */
export type MaterialRole =
  | 'aluminium'
  | 'aluminiumDark'
  | 'fastener'
  | 'circuit'
  | 'module'
  | 'polymer'
  | 'pumpHead'
  | 'cameraBody'
  | 'chipCover'
  | 'chipChannelUpper'
  | 'chipChannelLower'
  | 'chipBase'
  | 'gasket';

interface Rule<T> {
  value: T;
  assembly?: string | string[];
  part?: string | string[];
  indices?: number[];
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, k) => a + k);
const asList = (v?: string | string[]) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);

function matches<T>(rule: Rule<T>, p: PartRecord) {
  if (rule.indices && !rule.indices.includes(p.i)) return false;
  const a = asList(rule.assembly);
  if (a && !a.includes(p.assembly)) return false;
  const n = asList(rule.part);
  if (n && !n.includes(p.part)) return false;
  return true;
}

export const subsystemRules: Rule<SubsystemId>[] = [
  // "DB13" bodies — matches the DB13W3 receptacle ESA documents for each ICE Cubes slot.
  { value: 'connector', assembly: 'Structure part', indices: range(1, 14) },
  { value: 'base', assembly: 'Structure part', part: ['Base Plate EM2', 'FOOT6.2xD15', 'Panel Plate', 'Panel Bracket'] },
  { value: 'enclosure', assembly: 'Structure part' },
  // "orange pi5 pro" in the CAD tree; its two bodies export without a part name.
  { value: 'computer', assembly: 'Electronic part', indices: [93, 94] },
  { value: 'mainBoard', assembly: 'Electronic part', part: 'PCB Part' },
  // HUBBox, Hub, HUBBox_TOP and the spacers/screws that carry them.
  { value: 'hub', assembly: 'Electronic part', indices: [...range(50, 54), ...range(59, 84)] },
  { value: 'electronics', assembly: 'Electronic part' },
  { value: 'reservoir', assembly: 'ASM_Reservior' },
  { value: 'pumps', assembly: 'EM_2PUMP' },
  { value: 'cameras', assembly: 'ASM_Camera_HS' },
  { value: 'chip', assembly: 'Fluidic part' },
];

const isFastener = (p: PartRecord) =>
  /screw|nut|SOCKET|Spacer|STANDOFF|M2x|pan cross/i.test(p.part) || /screw|Nyloc/i.test(p.assembly);

export const materialRules: Rule<MaterialRole>[] = [
  { value: 'chipCover', indices: [409] },
  { value: 'chipChannelUpper', indices: [410] },
  { value: 'chipChannelLower', indices: [411] },
  { value: 'chipBase', indices: [412] },
  { value: 'gasket', part: ['Chip Gasket', 'Bag_Casket'] },
  { value: 'aluminium', assembly: 'Structure part', part: ['Top Plate', 'Front Plate', 'Side Plate EXP', 'Corner', 'EDGE', 'Special EdgeEM2', 'Special Bracket'] },
  { value: 'aluminiumDark', assembly: 'Structure part', part: ['Base Plate EM2', 'Panel Plate', 'Panel Bracket'] },
  { value: 'fastener', assembly: 'Structure part', part: 'FOOT6.2xD15' },
  { value: 'circuit', assembly: 'Structure part' }, // DB13 connector bodies
  { value: 'circuit', part: ['PCB Part', 'Board_Layer'] },
  { value: 'module', indices: [93, 94] },
  { value: 'module', part: ['Hub'] },
  { value: 'cameraBody', part: ['Camera_Layer', 'Cover_CameraV2'] },
  { value: 'pumpHead', assembly: 'EM_2PUMP', part: '' },
  { value: 'polymer', part: ['ContainerV2', 'Front_Panel', 'HUBBox', 'HUBBox_TOP', 'Pump_container', 'PUMPPLATE_TOP', 'Chip Container', 'Chip panel'] },
];

export function subsystemOf(p: PartRecord): SubsystemId {
  if (p.attachTo !== undefined) {
    return p.attachTo === null ? 'base' : subsystemOf(parts[p.attachTo]);
  }
  return subsystemRules.find((r) => matches(r, p))?.value ?? 'base';
}

export function materialRoleOf(p: PartRecord): MaterialRole {
  if (isFastener(p)) return 'fastener';
  return materialRules.find((r) => matches(r, p))?.value ?? 'aluminiumDark';
}

/* ------------------------------------------------------------------------- */
/* Motion rigs: how each part moves when the story opens the payload.        */
/* Offsets are computed from each part's immutable original position.        */
/* ------------------------------------------------------------------------- */

export type RigId = 'enclosure' | 'pumpsLift' | 'chipLift' | 'hubLift' | 'chipLayers';

export interface RigDefinition {
  /** Maximum travel in mm when the rig amount is 1. */
  distance: number;
}

export const rigs: Record<RigId, RigDefinition> = {
  // Enclosure panels move outward along their own outward normal.
  enclosure: { distance: 95 },
  // The pump block rises to expose the fluid storage beneath it.
  pumpsLift: { distance: 48 },
  // The chip assembly rises to expose the four cameras beneath it.
  chipLift: { distance: 55 },
  // The hub enclosure rises to expose the single-board computer.
  hubLift: { distance: 58 },
  // The chip's layers separate so the two channel layers can be read.
  chipLayers: { distance: 1 },
};

/** Per-layer travel (mm) for the chipLayers rig, keyed by GLB index. */
export const chipLayerTravel: Record<number, number> = { 409: 34, 410: 20, 411: 9 };

export interface PartMotion {
  rig: RigId;
  /** Unit direction (enclosure) or per-part travel vector for amount = 1. */
  vector: [number, number, number];
}

/** Model-space centre used to derive outward directions for enclosure panels. */
const ENCLOSURE_CENTRE: [number, number, number] = [0, 50, 0];

export function motionsOf(p: PartRecord): PartMotion[] {
  if (p.attachTo !== undefined) return p.attachTo === null ? [] : motionsOf(parts[p.attachTo]);
  const sub = subsystemOf(p);
  const out: PartMotion[] = [];
  if (sub === 'enclosure') {
    if (p.part === 'Top Plate') out.push({ rig: 'enclosure', vector: [0, 1.25, 0] });
    else {
      const c = p.min.map((v, a) => (v + p.max[a]) / 2);
      const dx = c[0] - ENCLOSURE_CENTRE[0];
      const dz = c[2] - ENCLOSURE_CENTRE[2];
      const len = Math.hypot(dx, dz) || 1;
      out.push({ rig: 'enclosure', vector: [dx / len, 0, dz / len] });
    }
  }
  if (sub === 'pumps') out.push({ rig: 'pumpsLift', vector: [0, 1, 0] });
  if (sub === 'chip') {
    out.push({ rig: 'chipLift', vector: [0, 1, 0] });
    const layer = chipLayerTravel[p.i];
    if (layer) out.push({ rig: 'chipLayers', vector: [0, layer, 0] });
  }
  if (sub === 'hub') out.push({ rig: 'hubLift', vector: [0, 1, 0] });
  return out;
}