/**
 * Technical documentation destination. Leave as `null` until the final URL is
 * confirmed: the closing call to action then reads as forthcoming and renders no
 * link. Set a full URL (e.g. 'https://docs.example.org/tigers-x') to turn it into
 * an ordinary accessible link. The paper and data links live in config/facts.ts.
 */
export const DOCS_URL: string | null = null;

export const chapters = [
  { id: 'question', label: 'Question' },
  { id: 'payload', label: 'Payload' },
  { id: 'subsystems', label: 'Subsystems' },
  { id: 'chip', label: 'Lab-on-a-chip' },
  { id: 'mission', label: 'Mission' },
  { id: 'station', label: 'Aboard the ISS' },
  { id: 'record', label: 'Record' },
  { id: 'results', label: 'Results' },
  { id: 'documentation', label: 'Paper' },
] as const;

export type ChapterId = (typeof chapters)[number]['id'];

export const assets = {
  model: '/models/tigers-x.glb',
  patch: '/media/patch.png',
  parabolicPatch: '/media/parabolic-patch.png',
  iconMedical: '/media/icons/medical.png',
  iconFood: '/media/icons/food.png',
  iconExploration: '/media/icons/exploration.png',
  modelSnapshot: '/media/payload-snapshot.webp',
} as const;

/** Marks shown in the white strip above the footer. `mark` picks the height tier. */
export const partners = [
  {
    id: 'cra',
    src: '/media/partners/cra.svg',
    alt: 'Chulabhorn Royal Academy',
    width: 240,
    height: 122,
  },
  {
    id: 'mhesi',
    src: '/media/partners/mhesi.svg',
    alt: 'Ministry of Higher Education, Science, Research and Innovation',
    width: 383,
    height: 383,
    mark: 'seal',
  },
  {
    id: 'tsri',
    src: '/media/partners/tsri.svg',
    alt: 'Thailand Science Research and Innovation',
    width: 240,
    height: 290,
    mark: 'stack',
  },
  {
    id: 'pim',
    src: '/media/partners/pim.webp',
    alt: 'Panyapiwat Institute of Management',
    width: 291,
    height: 271,
    mark: 'seal',
  },
  {
    id: 'gistda',
    src: '/media/partners/gistda.webp',
    alt: 'Geo-Informatics and Space Technology Development Agency',
    width: 340,
    height: 109,
  },
  {
    id: 'tmec',
    src: '/media/partners/tmec.webp',
    alt: 'Thai Microelectronics Center',
    width: 319,
    height: 87,
  },
] as const;
