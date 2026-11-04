/**
 * Mission media manifest. Every slot renders a captioned placeholder of fixed
 * aspect ratio until `src` is set. Paths are site-root relative
 * (/public/media/mission/…). Captions and alt text live in `src/content/en.json`.
 */
import { copy } from '../content';

export type MediaKind = 'image' | 'video';
export type MediaSlotId = keyof typeof copy.media.slots;

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
  /** Silent clip that plays itself, without controls, once it is near the screen. */
  ambient?: boolean;
}

export interface MediaSlot {
  id: MediaSlotId;
  /** Placeholder title shown until media is supplied. */
  placeholder: string;
  items: MediaItem[];
}

interface MediaAsset {
  kind: MediaKind;
  src: string | null;
  poster?: string | null;
  captions?: { src: string; srclang: string; label: string } | null;
  aspectRatio: number;
  focal?: string;
  ambient?: boolean;
}

const assets: { [S in MediaSlotId]: Record<string, MediaAsset> } = {
  'platform-parabolic': {
    'platform-parabolic-photo': {
      kind: 'image',
      src: '/media/mission/zero-g.jpg',
      aspectRatio: 3 / 2,
    },
  },
  'platform-iss': {
    'platform-iss-photo': {
      kind: 'image',
      src: '/media/mission/tigers-x-in-icf.jpg',
      aspectRatio: 3 / 2,
    },
  },
  'development-earth': {
    'development-photo-1': {
      kind: 'image',
      src: '/media/mission/payload-development-1.jpg',
      aspectRatio: 3 / 2,
    },
    'development-photo-2': {
      kind: 'image',
      src: '/media/mission/payload-development-2.jpg',
      aspectRatio: 3 / 2,
    },
    'development-photo-3': {
      kind: 'image',
      src: '/media/mission/payload-development-3.jpg',
      aspectRatio: 3 / 2,
    },
    'development-photo-4': {
      kind: 'image',
      src: '/media/mission/payload-development-4.jpg',
      aspectRatio: 3 / 2,
    },
  },
  launch: {
    'launch-photo': {
      kind: 'image',
      src: '/media/mission/launch-pad-remote.jpg',
      aspectRatio: 3 / 2,
    },
  },
  'dragon-docking': {
    'docking-video': {
      kind: 'video',
      src: '/media/mission/dock.mp4',
      poster: '/media/mission/dock-poster.jpg',
      captions: null,
      aspectRatio: 16 / 9,
      ambient: true,
    },
  },
  'crew-installation': {
    'crew-installation-video': {
      kind: 'video',
      src: '/media/mission/installation.mp4',
      poster: '/media/mission/installation-poster.jpg',
      captions: null,
      aspectRatio: 120 / 89,
      ambient: true,
    },
  },
  'payload-on-iss': {
    'payload-on-iss-installed': {
      kind: 'image',
      src: '/media/mission/tigers-x-in-icf.jpg',
      aspectRatio: 3 / 2,
    },
    'payload-on-iss-front': {
      kind: 'image',
      src: '/media/mission/tigers-x-in-icf-2.jpg',
      aspectRatio: 3 / 2,
    },
    'payload-on-iss-floating': {
      kind: 'image',
      src: '/media/mission/tigers-x-floating.jpg',
      aspectRatio: 3 / 2,
      focal: '40% 45%',
    },
    'payload-on-iss-back': {
      kind: 'image',
      src: '/media/mission/tigers-x-back.jpg',
      aspectRatio: 3 / 2,
    },
  },
  'science-operations': {
    'lab-on-chip-run': {
      kind: 'image',
      src: '/media/mission/lab-on-a-chip.gif',
      poster: '/media/mission/lab-on-a-chip-poster.jpg',
      aspectRatio: 1090 / 358,
    },
  },
  'return-earth': {
    'return-undock': {
      kind: 'image',
      src: '/media/mission/undock.jpg',
      aspectRatio: 4928 / 2768,
    },
  },
};

function itemsFor<S extends MediaSlotId>(id: S): MediaItem[] {
  const slotCopy = copy.media.slots[id];
  return Object.entries(slotCopy.items).map(([itemId, text]) => {
    const asset = assets[id][itemId];
    if (!asset) throw new Error(`Missing media asset for ${id}/${itemId}`);
    return {
      id: itemId,
      ...asset,
      alt: text.alt,
      caption: text.caption,
      credit: text.credit,
    };
  });
}

export const mediaSlots = Object.fromEntries(
  (Object.keys(copy.media.slots) as MediaSlotId[]).map((id) => [
    id,
    {
      id,
      placeholder: copy.media.slots[id].placeholder,
      items: itemsFor(id),
    } satisfies MediaSlot,
  ]),
) as Record<MediaSlotId, MediaSlot>;
