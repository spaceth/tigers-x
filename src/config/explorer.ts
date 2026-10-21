/**
 * Explorer: user-facing subsystem list (tap/click exploration).
 * Kept apart from modelMap.ts so the page shell does not bundle the part inventory.
 */
import type { SubsystemId } from './modelMap';

export interface ExplorerEntry {
  id: string;
  title: string;
  members: SubsystemId[];
  description: string;
}

export const explorerEntries: ExplorerEntry[] = [
  {
    id: 'chip',
    title: 'Microfluidic chip',
    members: ['chip'],
    description:
      'The experiment core. Fluid lines enter through fittings beneath the chip, and its two channel layers carry chains of Tesla-valve units that split, turn and re-join the flow to fold the phases together.',
  },
  {
    id: 'pumps',
    title: 'Eight peristaltic pumps',
    members: ['pumps'],
    description:
      'A peristaltic pump moves fluid by progressively compressing flexible tubing. Together, the eight pumps control fluid delivery to the experiment.',
  },
  {
    id: 'reservoir',
    title: 'Fluid storage',
    members: ['reservoir'],
    description:
      'The preloaded fluids are stored in this housing beneath the pump block. The fluidic circuit is sealed and designed with double containment.',
  },
  {
    id: 'cameras',
    title: 'Four cameras',
    members: ['cameras'],
    description:
      'A 2 × 2 camera arrangement sits directly beneath the chip and records the mixing process and the behaviour of the interfaces.',
  },
  {
    id: 'computing',
    title: 'Computing and control',
    members: ['computer', 'mainBoard', 'hub', 'electronics'],
    description:
      'An Orange Pi single-board computer runs higher-level operations and imaging. It commands an STM32 microcontroller that drives the pumps, and recordings are stored on an SSD.',
  },
  {
    id: 'structure',
    title: 'Structure and enclosure',
    members: ['enclosure', 'base'],
    description:
      'An Aluminium 7075 structure carries every subsystem inside a 200 × 200 × 100 mm envelope. Internal parts use their own materials.',
  },
  {
    id: 'connector',
    title: 'Facility connector',
    members: ['connector'],
    description:
      'The connector on the underside mates with the ICE Cubes Facility, which supplies power and a data connection.',
  },
];
