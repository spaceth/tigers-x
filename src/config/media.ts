/**
 * Mission media manifest. Every slot renders a captioned placeholder of fixed
 * aspect ratio until `src` is set. Paths are site-root relative
 * (/public/media/mission/…).
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
  /** Silent clip that plays itself, without controls, once it is near the screen. */
  ambient?: boolean;
}

export interface MediaSlot {
  id: 'platform-parabolic' | 'platform-iss' | 'development-earth' | 'launch' | 'dragon-docking' | 'crew-installation' | 'payload-on-iss' | 'return-earth';
  /** Placeholder title shown until media is supplied. */
  placeholder: string;
  items: MediaItem[];
}

export const mediaSlots: Record<MediaSlot['id'], MediaSlot> = {
  'platform-parabolic': {
    id: 'platform-parabolic',
    placeholder: 'Zero-g parabolic flight — photograph',
    items: [
      {
        id: 'platform-parabolic-photo',
        kind: 'image',
        src: '/media/mission/zero-g.jpg',
        alt: 'Three team members in navy flight suits kneel around the boxed lab-on-chip platform, strapped to the padded floor of the parabolic-flight aircraft cabin.',
        caption: 'The 2025 lab-on-chip platform on a zero-g parabolic flight.',
        credit: 'Chulabhorn Royal Academy',
        aspectRatio: 3 / 2,
      },
    ],
  },
  'platform-iss': {
    id: 'platform-iss',
    placeholder: 'TIGERS-X on the ISS — photograph',
    items: [
      {
        id: 'platform-iss-photo',
        kind: 'image',
        src: '/media/mission/tigers-x-in-icf.jpg',
        alt: 'The aluminium TIGERS-X cube, its lid carrying the mission patch, ICE Cubes label and partner logos, installed in the ICE Cubes Facility aboard the ISS, surrounded by cables and rack hardware.',
        caption: 'TIGERS-X installed in the ICE Cubes Facility, Columbus module.',
        credit: 'Sophie Adenot/ESA',
        aspectRatio: 3 / 2,
      },
    ],
  },
  'development-earth': {
    id: 'development-earth',
    placeholder: 'Payload development — photography',
    items: [
      {
        id: 'development-photo-1',
        kind: 'image',
        src: '/media/mission/payload-development-1.jpg',
        alt: 'Two team members in clean-room suits and hair nets assemble TIGERS-X at a workbench: one fits an electronics stack, the other works on the open aluminium enclosure. A Thai flag and the GISTDA logo are on the wall behind.',
        caption: 'Assembling the experiment cube in the clean room at GISTDA’s National Satellite Assembly, Integration and Test Center.',
        credit: 'Chulabhorn Royal Academy',
        aspectRatio: 3 / 2,
      },
      {
        id: 'development-photo-2',
        kind: 'image',
        src: '/media/mission/payload-development-2.jpg',
        alt: 'The open TIGERS-X enclosure on a workbench, showing circuit boards and wiring inside, with the labelled outer panels laid out beside it.',
        caption: 'Electronics inside the open enclosure, with the labelled outer panels ready to fit.',
        credit: 'Chulabhorn Royal Academy',
        aspectRatio: 3 / 2,
      },
      {
        id: 'development-photo-3',
        kind: 'image',
        src: '/media/mission/payload-development-3.jpg',
        alt: 'Three team members in clean-room suits look at a laptop showing a camera view of the chip; the assembled cube sits on the bench beside them.',
        caption: 'Checking the camera view of the chip during integration.',
        credit: 'Chulabhorn Royal Academy',
        aspectRatio: 3 / 2,
      },
      {
        id: 'development-photo-4',
        kind: 'image',
        src: '/media/mission/payload-development-4.jpg',
        alt: 'Five team members in clean-room coats and shoe covers pose in the test hall beneath the GISTDA, THEOS-2 and National Satellite Assembly, Integration and Test Center signs.',
        caption: 'The team at the National Satellite Assembly, Integration and Test Center.',
        credit: 'Chulabhorn Royal Academy',
        aspectRatio: 3 / 2,
      },
    ],
  },
  launch: {
    id: 'launch',
    placeholder: 'Launch — photograph',
    items: [
      {
        id: 'launch-photo',
        kind: 'image',
        src: '/media/mission/launch-pad-remote.jpg',
        alt: 'Seen from the pad, a Falcon 9 rises past its launch tower between lightning towers, its engine flame lighting billowing white exhaust clouds under a deep blue sky.',
        caption: 'Falcon 9 lifts off from Space Launch Complex 40 with CRS-34, carrying TIGERS-X towards the International Space Station.',
        credit: 'SpaceX',
        aspectRatio: 3 / 2,
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
        src: '/media/mission/dock.mp4',
        poster: '/media/mission/dock-poster.jpg',
        captions: null,
        alt: 'Real footage of the CRS-34 Dragon approaching the International Space Station on 17 May 2026, seen from the station with Earth filling the lower half of the view and a solar array along the right edge.',
        caption: 'Real footage of the CRS-34 Dragon docking with the International Space Station on 17 May 2026.',
        credit: 'Sophie Adenot/ESA',
        aspectRatio: 16 / 9,
        ambient: true,
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
        credit: 'ESA/NASA – S. Adenot',
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
        src: '/media/mission/tigers-x-in-icf-wide.jpg',
        alt: 'The aluminium TIGERS-X cube, its lid carrying the mission patch, ICE Cubes label and partner logos, installed in the ICE Cubes Facility aboard the ISS, surrounded by cables and rack hardware.',
        caption: 'TIGERS-X in place aboard the International Space Station.',
        credit: 'Sophie Adenot/ESA',
        aspectRatio: 3 / 2,
      },
    ],
  },
  'return-earth': {
    id: 'return-earth',
    placeholder: 'Return to Earth — photograph',
    items: [
      {
        id: 'return-undock',
        kind: 'image',
        src: '/media/mission/undock.jpg',
        alt: 'A white Dragon cargo spacecraft, its docking hatch facing the camera and its trunk lit by sunlight, drifts away against the black of space.',
        caption:
          'A Dragon cargo spacecraft undocks from the station for the return to Earth. Recovery of the hardware and its onboard recordings by the research team is a later, separate step.',
        credit: 'NASA Johnson Space Center',
        aspectRatio: 4928 / 2768,
      },
    ],
  },
};
