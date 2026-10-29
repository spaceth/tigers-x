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
  id: 'platform-parabolic' | 'platform-iss' | 'development-earth' | 'launch' | 'dragon-docking' | 'crew-installation' | 'payload-on-iss' | 'science-operations' | 'return-earth';
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
        credit: 'ESA/NASA – S. Adenot',
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
        caption: 'Electronics in the open enclosure, with the outer panels laid out for fit.',
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
        caption: 'Falcon 9 lifts off from Space Launch Complex 40 with CRS-34, carrying TIGERS-X to the International Space Station.',
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
        caption: 'CRS-34 Dragon docking with the International Space Station, 17 May 2026.',
        credit: 'ESA/NASA – S. Adenot',
        aspectRatio: 16 / 9,
        ambient: true,
      },
    ],
  },
  'crew-installation': {
    id: 'crew-installation',
    placeholder: 'Crew installation in Columbus — video',
    items: [
      {
        id: 'crew-installation-video',
        kind: 'video',
        src: '/media/mission/installation.mp4',
        poster: '/media/mission/installation-poster.jpg',
        captions: null,
        alt: 'A crew member installs the TIGERS-X cube in the ICE Cubes Facility inside Columbus, sliding the labelled enclosure into the rack among cables and experiment hardware.',
        caption: 'Installation in the ICE Cubes Facility, Columbus module.',
        credit: 'ESA/NASA – S. Adenot',
        aspectRatio: 120 / 89,
        ambient: true,
      },
    ],
  },
  'payload-on-iss': {
    id: 'payload-on-iss',
    placeholder: 'TIGERS-X aboard the ISS — photograph',
    items: [
      {
        id: 'payload-on-iss-installed',
        kind: 'image',
        src: '/media/mission/tigers-x-in-icf.jpg',
        alt: 'The aluminium TIGERS-X cube, its lid carrying the mission patch, ICE Cubes label and partner logos, installed in the ICE Cubes Facility aboard the ISS, surrounded by cables and rack hardware.',
        caption: 'TIGERS-X in place aboard the International Space Station.',
        credit: 'ESA/NASA – S. Adenot',
        aspectRatio: 3 / 2,
      },
      {
        id: 'payload-on-iss-front',
        kind: 'image',
        src: '/media/mission/tigers-x-in-icf-2.jpg',
        alt: 'Close view of the front face of the TIGERS-X cube in the ICE Cubes Facility, showing the Thai flag, CRA, ISHA, TSRI, TMEC and GISTDA marks, with cables and connectors around it.',
        caption: 'The front of the cube in the ICE Cubes Facility.',
        credit: 'ESA/NASA – S. Adenot',
        aspectRatio: 3 / 2,
      },
      {
        id: 'payload-on-iss-floating',
        kind: 'image',
        src: '/media/mission/tigers-x-floating.jpg',
        alt: 'The TIGERS-X cube floats inside a station module, its lid showing the mission patch, partner logos and ICE Cubes label, with racks, stowage bags and cables behind it.',
        caption: 'TIGERS-X floating inside the International Space Station.',
        credit: 'ESA/NASA – S. Adenot',
        aspectRatio: 3 / 2,
        focal: '40% 45%',
      },
      {
        id: 'payload-on-iss-back',
        kind: 'image',
        src: '/media/mission/tigers-x-back.jpg',
        alt: 'The back panel of the TIGERS-X cube floats in the station, showing the flight-model label, handwritten signatures, the mission patch, and the Thai flag and CRA marks, with stowage bags and cables behind it.',
        caption: 'The back of TIGERS-X, marked as the flight model.',
        credit: 'ESA/NASA – S. Adenot',
        aspectRatio: 3 / 2,
      },
    ],
  },
  'science-operations': {
    id: 'science-operations',
    placeholder: 'Lab-on-chip during science operations — animation',
    items: [
      {
        id: 'lab-on-chip-run',
        kind: 'image',
        src: '/media/mission/lab-on-a-chip.gif',
        poster: '/media/mission/lab-on-a-chip-poster.jpg',
        alt: 'Panorama of a transparent lab-on-chip during a run, joined from two camera views. Orange oil and teal water move through two rows of Tesla-valve channels. A colour reference swatch sits in each half, CRA is moulded into the plastic, and tubing connects at both ends.',
        caption:
          'A science run. Orange is the oil phase and teal the aqueous phase in the Tesla-valve channels. The panorama joins two synchronized camera views.',
        credit: 'Chulabhorn Royal Academy',
        aspectRatio: 1090 / 358,
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
          'A Dragon cargo spacecraft leaves the station. Recovery of the cube and its onboard recordings is a later step.',
        credit: 'NASA Johnson Space Center',
        aspectRatio: 4928 / 2768,
      },
    ],
  },
};
