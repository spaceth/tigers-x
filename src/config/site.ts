/**
 * Technical documentation destination. Leave as `null` until the final URL is
 * confirmed: the closing call to action then reads as forthcoming and renders no
 * link. Set a full URL (e.g. 'https://docs.example.org/tigers-x') to turn it into
 * an ordinary accessible link.
 */
export const DOCS_URL: string | null = null;

export const chapters = [
  { id: 'question', label: 'Question' },
  { id: 'payload', label: 'Payload' },
  { id: 'subsystems', label: 'Subsystems' },
  { id: 'chip', label: 'Lab-on-a-chip' },
  { id: 'mission', label: 'Mission' },
  { id: 'station', label: 'Aboard the ISS' },
  { id: 'record', label: 'Mission record' },
  { id: 'documentation', label: 'Documentation' },
] as const;

export type ChapterId = (typeof chapters)[number]['id'];

export const assets = {
  model: '/models/tigers-x.glb',
  patch: '/media/patch.png',
  modelSnapshot: '/media/payload-snapshot.webp',
} as const;
