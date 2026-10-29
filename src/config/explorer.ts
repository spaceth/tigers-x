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
      'Two devices, CH1 and CH2, each with two parallel Tesla-valve rows. Each channel has an oil inlet, an aqueous inlet, and one outlet. The valve chain folds the phases together, then opens into an observation chamber.',
  },
  {
    id: 'pumps',
    title: 'Eight peristaltic pumps',
    members: ['pumps'],
    description:
      'Takasago RP-QIII peristaltic pumps move fluid by compressing tubing. Each channel has one pump for the oil phase and one for the aqueous phase.',
  },
  {
    id: 'reservoir',
    title: 'Fluid storage',
    members: ['reservoir'],
    description:
      'Eight CryoStore bags in one container: two oil-phase bags of 10 mL, two aqueous bags of 15 mL, and four collection bags. The circuit is sealed and double-contained.',
  },
  {
    id: 'cameras',
    title: 'Four cameras',
    members: ['cameras'],
    description:
      'Four See3CAM cameras in a 2 × 2 array image the chip under white LED illumination. Synchronized pairs are stitched into one panorama.',
  },
  {
    id: 'computing',
    title: 'Computing and control',
    members: ['computer', 'mainBoard', 'hub', 'electronics'],
    description:
      'An Orange Pi 5 Pro sequences each run, stores images and telemetry, and buffers data in onboard YAMCS. It commands an STM32F746 microcontroller, which drives the pumps and the LED illumination. A USB hub powers the four cameras.',
  },
  {
    id: 'structure',
    title: 'Structure and enclosure',
    members: ['enclosure', 'base'],
    description:
      'An aluminium 7075 structure carries the subsystems inside a 200 × 200 × 100 mm envelope. Internal parts use their own materials.',
  },
  {
    id: 'connector',
    title: 'Facility connector',
    members: ['connector'],
    description:
      'A DB13W3 connector on the underside mates with the ICE Cubes Facility. The cube draws +12 V only. Four differential pairs carry Gigabit Ethernet for commands and data.',
  },
];
