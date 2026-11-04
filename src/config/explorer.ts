/**
 * Explorer: user-facing subsystem list (tap/click exploration).
 * Kept apart from modelMap.ts so the page shell does not bundle the part inventory.
 * Titles and descriptions come from `src/content/en.json`.
 */
import { copy } from '../content';
import type { SubsystemId } from './modelMap';

export interface ExplorerEntry {
  id: keyof typeof copy.explorer;
  title: string;
  members: SubsystemId[];
  description: string;
}

const members: Record<keyof typeof copy.explorer, SubsystemId[]> = {
  chip: ['chip'],
  pumps: ['pumps'],
  reservoir: ['reservoir'],
  cameras: ['cameras'],
  computing: ['computer', 'mainBoard', 'hub', 'electronics'],
  structure: ['enclosure', 'base'],
  connector: ['connector'],
};

export const explorerEntries: ExplorerEntry[] = (Object.keys(copy.explorer) as (keyof typeof copy.explorer)[]).map(
  (id) => ({
    id,
    title: copy.explorer[id].title,
    members: members[id],
    description: copy.explorer[id].description,
  }),
);
