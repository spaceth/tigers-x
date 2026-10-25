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
    title: 'Lab-on-chip',
    members: ['chip'],
    description:
      'The experiment core: two devices, CH1 and CH2, each with two parallel Tesla-valve channels. Each channel has its own oil and water inlets and one outlet. Its chain of valve units splits, turns and re-joins the flow to fold the phases together, then opens into a chamber for observation.',
  },
  {
    id: 'pumps',
    title: 'Eight peristaltic pumps',
    members: ['pumps'],
    description:
      'Takasago RP-QIII peristaltic pumps move fluid by progressively compressing flexible tubing. Each channel has its own pair: one for the oil phase and one for the water phase.',
  },
  {
    id: 'reservoir',
    title: 'Fluid storage',
    members: ['reservoir'],
    description:
      'Eight CryoStore® bags in one container: two of oil phase (10 mL each), two of water phase (15 mL each) and four empty bags that collect each channel’s mixture. The sealed circuit is double-contained.',
  },
  {
    id: 'cameras',
    title: 'Four cameras',
    members: ['cameras'],
    description:
      'Four See3CAM cameras in a 2 × 2 arrangement sit directly beneath the chip, under white LED light. Pairs of synchronised views are stitched into one panorama of the channels.',
  },
  {
    id: 'computing',
    title: 'Computing and control',
    members: ['computer', 'mainBoard', 'hub', 'electronics'],
    description:
      'An Orange Pi 5 Pro sequences the experiment, stores images and telemetry, and runs an onboard YAMCS instance. It commands an STM32F746 microcontroller that drives the pumps and the LED lighting. A USB hub powers the four cameras.',
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
      'A DB13W3 connector on the underside mates with the ICE Cubes Facility. The cube draws only its +12 V supply, and four differential pairs carry Gigabit Ethernet for commands and data.',
  },
];
