/**
 * Mission media manifest. Every slot renders a neutral, captioned placeholder of
 * fixed aspect ratio until `src` is set, so the layout does not move when real
 * files arrive. Drop files into /public/media/mission/ and fill in `src`
 * (and `poster` for video). Paths are site-root relative.
 */
export type MediaKind = 'image' | 'video';

export interface MediaItem {
  /** Stable identifier — referenced by layout, never shown. */
  id: string;
  kind: MediaKind;
  /** Asset path, e.g. '/media/mission/launch.mp4'. `null` renders the placeholder. */
  src: string | null;
  /** Poster frame for video (required once a video `src` is set). */
  poster?: string | null;
  /** WebVTT captions for any spoken content. */
  captions?: { src: string; srclang: string; label: string } | null;
  /** Describes the image content for screen readers. Required for real media. */
  alt: string;
  caption: string;
  credit?: string;
  /** width / height, e.g. 16 / 9 */
  aspectRatio: number;
  /** CSS object-position, e.g. '50% 30%' */
  focal?: string;
}

export interface MediaSlot {
  id: 'development-earth' | 'launch' | 'dragon-docking' | 'crew-installation' | 'payload-on-iss' | 'return-earth';
  /** Placeholder title shown until media is supplied. */
  placeholder: string;
  items: MediaItem[];
}

export const mediaSlots: Record<MediaSlot['id'], MediaSlot> = {
  'development-earth': {
    id: 'development-earth',
    placeholder: 'Payload development — photography and film',
    items: [
      {
        id: 'development-film',
        kind: 'video',
        src: null,
        poster: null,
        captions: null,
        alt: 'Film of the TIGERS-X payload being assembled and tested on Earth.',
        caption: 'Development film: assembly, integration and testing on Earth.',
        aspectRatio: 16 / 9,
      },
      {
        id: 'development-photo-1',
        kind: 'image',
        src: null,
        alt: 'Photograph of TIGERS-X hardware during development.',
        caption: 'Integration of the fluidic and imaging hardware.',
        aspectRatio: 4 / 3,
      },
      {
        id: 'development-photo-2',
        kind: 'image',
        src: null,
        alt: 'Photograph of the TIGERS-X team testing the payload.',
        caption: 'Ground testing before flight.',
        aspectRatio: 4 / 3,
      },
      {
        id: 'development-photo-3',
        kind: 'image',
        src: null,
        alt: 'Close photograph of the TIGERS-X microfluidic chip.',
        caption: 'The microfluidic chip before installation.',
        aspectRatio: 4 / 3,
      },
    ],
  },
  launch: {
    id: 'launch',
    placeholder: 'Launch — video',
    items: [
      {
        id: 'launch-video',
        kind: 'video',
        src: null,
        poster: null,
        captions: null,
        alt: 'Video of the launch that carried TIGERS-X towards the International Space Station.',
        caption: 'Launch towards the International Space Station.',
        aspectRatio: 16 / 9,
      },
    ],
  },
  'dragon-docking': {
    id: 'dragon-docking',
    placeholder: 'Dragon docking with the ISS — video',
    items: [
      {
        id: 'docking-video',
        kind: 'video',
        src: null,
        poster: null,
        captions: null,
        alt: 'Video of the Dragon spacecraft docking with the International Space Station.',
        caption: 'Dragon arrives at the station.',
        aspectRatio: 16 / 9,
      },
    ],
  },
  'crew-installation': {
    id: 'crew-installation',
    placeholder: 'Crew installation in Columbus — photograph',
    items: [
      {
        id: 'crew-installation-photo',
        kind: 'image',
        src: null,
        alt: 'An astronaut installs the TIGERS-X payload in the ICE Cubes Facility inside Columbus.',
        caption: 'Installation in the ICE Cubes Facility, Columbus module.',
        aspectRatio: 4 / 5,
      },
    ],
  },
  'payload-on-iss': {
    id: 'payload-on-iss',
    placeholder: 'TIGERS-X aboard the ISS — photograph',
    items: [
      {
        id: 'payload-on-iss-photo',
        kind: 'image',
        src: null,
        alt: 'TIGERS-X installed aboard the International Space Station.',
        caption: 'TIGERS-X in place aboard the International Space Station.',
        aspectRatio: 21 / 9,
      },
    ],
  },
  'return-earth': {
    id: 'return-earth',
    placeholder: 'Return to Earth aboard Dragon — video',
    items: [
      {
        id: 'return-video',
        kind: 'video',
        src: null,
        poster: null,
        captions: null,
        alt: 'Video of the Dragon spacecraft returning to Earth with the TIGERS-X payload aboard.',
        caption:
          'Return to Earth aboard Dragon. Retrieval of the hardware and its onboard recordings by the research team is a later, separate step.',
        aspectRatio: 16 / 9,
      },
    ],
  },
};
