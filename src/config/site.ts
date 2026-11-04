/**
 * Payload specification and user's guide. A root-relative path stays on this
 * site; a full URL opens externally. `null` leaves the Academic resources row
 * as coming soon. The paper and data links live in config/facts.ts.
 */
import { copy } from '../content';

export const DOCS_URL: string | null = '/specification';

export const chapterIds = [
  'question',
  'payload',
  'subsystems',
  'chip',
  'mission',
  'launch',
  'station',
  'record',
  'documentation',
] as const;

export type ChapterId = (typeof chapterIds)[number];

export const chapters: { id: ChapterId; label: string }[] = chapterIds.map((id) => ({
  id,
  label: copy.nav.chapters[id],
}));

export const assets = {
  model: '/models/tigers-x.glb',
  iss: '/models/iss.glb',
  patch: '/media/patch.png',
  parabolicPatch: '/media/parabolic-patch.png',
  iconMedical: '/media/icons/medical.png',
  iconFood: '/media/icons/food.png',
  iconExploration: '/media/icons/exploration.png',
  command: '/media/command.png',
  modelSnapshot: '/media/payload-snapshot.webp',
} as const;

/** Marks shown in the white strip above the footer. `mark` picks the height tier. */
export const partners = [
  {
    id: 'cra',
    src: '/media/partners/cra.svg',
    alt: copy.partners.cra,
    width: 240,
    height: 122,
  },
  {
    id: 'mhesi',
    src: '/media/partners/mhesi.svg',
    alt: copy.partners.mhesi,
    width: 383,
    height: 383,
    mark: 'seal',
  },
  {
    id: 'tsri',
    src: '/media/partners/tsri.svg',
    alt: copy.partners.tsri,
    width: 240,
    height: 290,
    mark: 'stack',
  },
  {
    id: 'pim',
    src: '/media/partners/pim.webp',
    alt: copy.partners.pim,
    width: 291,
    height: 271,
    mark: 'seal',
  },
  {
    id: 'gistda',
    src: '/media/partners/gistda.webp',
    alt: copy.partners.gistda,
    width: 340,
    height: 109,
  },
  {
    id: 'tmec',
    src: '/media/partners/tmec.webp',
    alt: copy.partners.tmec,
    width: 319,
    height: 87,
  },
] as const;
