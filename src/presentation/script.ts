/**
 * One-minute presentation film. Copy is taken from the public site; figures
 * come from the same mission facts. The loop is exactly 60 seconds.
 */
import { campaign, envelope, mixingFindings, parabolic } from '../config/facts';

export const LOOP = 60;

export type Theme = 'photo' | 'navy' | 'night' | 'paper';

export interface Still {
  kind: 'image';
  src: string;
  alt: string;
  credit: string;
  focal?: string;
  /** cover fills the frame; contain keeps the whole picture. */
  fit?: 'cover' | 'contain';
}

export interface Clip {
  kind: 'video';
  src: string;
  poster: string;
  alt: string;
  credit: string;
  fit?: 'cover' | 'contain';
  /** Seconds into the file where this beat should begin. */
  from?: number;
}

export type Media = Still | Clip;

export interface Slide {
  /** Fraction of the line (0–1) when this slide becomes current. */
  at: number;
  kicker?: string;
  title?: string;
  body?: string;
  media: Media;
}

export interface Line {
  id: string;
  start: number;
  end: number;
  theme: Theme;
  kicker: string;
  title: string;
  /** Second line under the title, for the mission name. */
  dek?: string;
  body: string;
  visual: 'photo' | 'why' | 'model' | 'chip' | 'run' | 'slides' | 'result';
  still?: Media;
  slides?: Slide[];
  /** Story position `t` at the start and end of a model line. */
  storyFrom?: number;
  storyTo?: number;
}

const floating: Still = {
  kind: 'image',
  src: '/media/mission/tigers-x-floating.jpg',
  alt: 'The TIGERS-X cube floats inside a station module, its lid showing the mission patch, partner logos and ICE Cubes label, with racks, stowage bags and cables behind it.',
  credit: 'ESA/NASA – S. Adenot',
  focal: '22% 78%',
};

const zeroG: Still = {
  kind: 'image',
  src: '/media/mission/zero-g.jpg',
  alt: 'Three team members in navy flight suits kneel around the boxed lab-on-chip platform, strapped to the padded floor of the parabolic-flight aircraft cabin.',
  credit: 'Chulabhorn Royal Academy',
  focal: '50% 40%',
};

const assembly: Still = {
  kind: 'image',
  src: '/media/mission/payload-development-1.jpg',
  alt: 'Two team members in clean-room suits and hair nets assemble TIGERS-X at a workbench: one fits an electronics stack, the other works on the open aluminium enclosure. A Thai flag and the GISTDA logo are on the wall behind.',
  credit: 'Chulabhorn Royal Academy',
  focal: '50% 45%',
};

const pad: Still = {
  kind: 'image',
  src: '/media/mission/launch-pad-remote.jpg',
  alt: 'Seen from the pad, a Falcon 9 rises past its launch tower between lightning towers, its engine flame lighting billowing white exhaust clouds under a deep blue sky.',
  credit: 'SpaceX',
  focal: '50% 42%',
};

const ascent: Still = {
  kind: 'image',
  src: '/media/mission/launch-falcon-9.jpg',
  alt: 'A Falcon 9 climbs through a deep blue sky, its engines leaving a long orange flame and a pale smoke trail.',
  credit: 'SpaceX',
  focal: '42% 48%',
};

const install: Clip = {
  kind: 'video',
  src: '/media/mission/installation.mp4',
  poster: '/media/mission/installation-poster.jpg',
  alt: 'A crew member installs the TIGERS-X cube in the ICE Cubes Facility inside Columbus, sliding the labelled enclosure into the rack among cables and experiment hardware.',
  credit: 'ESA/NASA – S. Adenot',
  fit: 'contain',
  from: 148,
};

const run: Still = {
  kind: 'image',
  src: '/media/mission/lab-on-a-chip.gif',
  alt: 'Panorama of a transparent lab-on-chip during a run, joined from two camera views. Orange oil and teal water move through two rows of Tesla-valve channels. A colour reference swatch sits in each half, CRA is moulded into the plastic, and tubing connects at both ends.',
  credit: 'Chulabhorn Royal Academy',
  fit: 'contain',
};

const onStation: Still = {
  kind: 'image',
  src: '/media/mission/tigers-x-in-icf.jpg',
  alt: 'The aluminium TIGERS-X cube, its lid carrying the mission patch, ICE Cubes label and partner logos, installed in the ICE Cubes Facility aboard the ISS, surrounded by cables and rack hardware.',
  credit: 'ESA/NASA – S. Adenot',
  focal: '50% 45%',
};

export const lines: Line[] = [
  {
    id: 'title',
    start: 0,
    end: 5.5,
    theme: 'photo',
    kicker: `International Space Station · ${campaign.launch.slice(-4)}`,
    title: 'TIGERS-X',
    dek: 'Thailand Innovative G-force Varied Emulsification Research for Space Exploration',
    body: `A teleoperated lab-on-chip cube. For ${campaign.days} days it recorded how oil and water mix when buoyancy is gone.`,
    visual: 'photo',
    still: floating,
  },
  {
    id: 'why',
    start: 5.5,
    end: 11.5,
    theme: 'navy',
    kicker: 'The question',
    title: 'Without shear or buoyancy.',
    body: `Parenteral emulsions are made with high-shear mixers. A small spacecraft cannot carry one, and in orbit buoyancy does not separate the phases. A ${parabolic.trials}-trial aircraft flight saw stronger mixing, but each window lasted about ${parabolic.windowSeconds} seconds.`,
    visual: 'why',
    still: zeroG,
  },
  {
    id: 'cube',
    start: 11.5,
    end: 15,
    theme: 'night',
    kicker: 'The payload',
    title: 'A laboratory in 4U.',
    body: `${envelope.widthMm} × ${envelope.depthMm} × ${envelope.heightMm} mm. Mass at handover, ${envelope.massKg} kg. Peak power, ${envelope.peakPowerW} W. The frame is aluminium 7075.`,
    visual: 'model',
    storyFrom: 0,
    storyTo: 1.25,
  },
  {
    id: 'pumps',
    start: 15,
    end: 18.5,
    theme: 'night',
    kicker: 'How fluid moves',
    title: 'Eight pumps, eight bags.',
    body: 'Each of the four channels has one pump for the oil phase and one for BFluid®. The bags sit in a sealed circuit, and the circuit is double-contained.',
    visual: 'model',
    storyFrom: 1.25,
    storyTo: 3.28,
  },
  {
    id: 'cameras',
    start: 18.5,
    end: 22,
    theme: 'night',
    kicker: 'How it is watched',
    title: 'Four cameras, one view.',
    body: 'A 2 × 2 array sits under the chip and images it in white light. Synchronized pairs are stitched into one panorama. A colour swatch in every frame corrects the light.',
    visual: 'model',
    storyFrom: 3.28,
    storyTo: 4.45,
  },
  {
    id: 'computer',
    start: 22,
    end: 25,
    theme: 'night',
    kicker: 'How it is commanded',
    title: 'Onboard, between contacts.',
    body: 'An Orange Pi sequences each run and stores the images. An STM32 drives the pumps and the lights. The facility supplies a single 12 V line.',
    visual: 'model',
    storyFrom: 4.45,
    storyTo: 5.35,
  },
  {
    id: 'inlets',
    start: 25,
    end: 28,
    theme: 'paper',
    kicker: 'Flight-chip geometry · one channel',
    title: 'Inlets',
    body: 'Teal is BFluid®, along the outer edges. Orange is the oil phase, along the centre. The streams stay side by side until the valves.',
    visual: 'chip',
  },
  {
    id: 'valves',
    start: 28,
    end: 31,
    theme: 'paper',
    kicker: 'Flight-chip geometry · one channel',
    title: 'Tesla valves',
    body: 'There is no impeller. The pumps hold the flow. The channel shape drives the phases into each other. The channels are 1 mm deep.',
    visual: 'chip',
  },
  {
    id: 'chamber',
    start: 31,
    end: 34,
    theme: 'paper',
    kicker: 'Flight-chip geometry · one channel',
    title: 'Observation chamber',
    body: 'The path opens into a rectangular chamber. This is the field the four cameras record.',
    visual: 'chip',
  },
  {
    id: 'outlet',
    start: 34,
    end: 37,
    theme: 'paper',
    kicker: 'Flight-chip geometry · one channel',
    title: 'Outlet',
    body: 'The mixture leaves through one fitting and is collected in that channel’s bag. Four channels, twelve ports.',
    visual: 'chip',
  },
  {
    id: 'seen',
    start: 37,
    end: 41,
    theme: 'night',
    kicker: 'Science operations',
    title: 'The same channel, in flight.',
    body: 'Orange oil and teal water, in a panorama joined from two cameras. The dyes make the phases measurable by hue. They are not the mixture under study.',
    visual: 'run',
    still: run,
  },
  {
    id: 'ground',
    start: 41,
    end: 45,
    theme: 'photo',
    kicker: 'Before flight',
    title: 'Qualified on the ground.',
    body: 'Built at Chulabhorn Royal Academy with ISHA Lab, PIM, and TMEC, then integrated at GISTDA. Structure, electromagnetic compatibility, and chemical safety were checked before handover.',
    visual: 'photo',
    still: assembly,
  },
  {
    id: 'flight',
    start: 45,
    end: 49.5,
    theme: 'photo',
    kicker: campaign.launch,
    title: 'CRS-34 leaves the pad.',
    body: `${campaign.vehicle}, from ${campaign.launchSite}. The cube flew unpowered.`,
    visual: 'slides',
    slides: [
      {
        at: 0,
        kicker: campaign.launch,
        title: 'CRS-34 leaves the pad.',
        body: `${campaign.vehicle}, from ${campaign.launchSite}. The cube flew unpowered.`,
        media: pad,
      },
      {
        at: 0.5,
        kicker: campaign.launch,
        title: 'On the way up.',
        body: 'Falcon 9 carried the cube to orbit. Dragon then docked with the station.',
        media: ascent,
      },
    ],
  },
  {
    id: 'install',
    start: 49.5,
    end: 55.5,
    theme: 'photo',
    kicker: 'Columbus module',
    title: 'Installed once.',
    body: 'A crew member fitted the cube into the ICE Cubes Facility. After that, every science run was commanded from Bangkok.',
    visual: 'photo',
    still: install,
  },
  {
    id: 'result',
    start: 55.5,
    end: LOOP,
    theme: 'photo',
    kicker: `Science operations · ${campaign.operationsStart} – ${campaign.operationsEnd}`,
    title: 'Set in the first stretch.',
    body: `The mixing index runs from 1, a water hue, to 2, an oil hue. It levelled off within the first ${mixingFindings.convergedWithinPct}% of each channel. CH1 stayed near an even mix. The two rows of CH2 did not.`,
    visual: 'result',
    still: onStation,
  },
];

const chipLines = lines.filter((line) => line.visual === 'chip');
export const CHIP = { start: chipLines[0].start, end: chipLines[chipLines.length - 1].end };

function assertLoop() {
  if (lines[0].start !== 0 || lines[lines.length - 1].end !== LOOP) {
    throw new Error('Presentation loop must run from 0 to 60 seconds.');
  }
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].start !== lines[i - 1].end) {
      throw new Error(`Presentation gap before ${lines[i].id}.`);
    }
  }
}
assertLoop();

export function lineAt(time: number): Line {
  const t = ((time % LOOP) + LOOP) % LOOP;
  return lines.find((line) => t >= line.start && t < line.end) ?? lines[0];
}

export function slideAt(line: Line, time: number): Slide | null {
  if (!line.slides?.length) return null;
  const span = line.end - line.start;
  const p = span <= 0 ? 0 : (time - line.start) / span;
  let current = line.slides[0];
  for (const slide of line.slides) if (p >= slide.at - 1e-6) current = slide;
  return current;
}

export function copyAt(line: Line, time: number) {
  const slide = slideAt(line, time);
  const kicker = slide?.kicker ?? line.kicker;
  const title = slide?.title ?? line.title;
  const body = slide?.body ?? line.body;
  return { kicker, title, dek: slide ? undefined : line.dek, body, key: `${kicker}|${title}|${body}` };
}

export function mediaAt(line: Line, time: number): Media | null {
  const slide = slideAt(line, time);
  if (slide) return slide.media;
  return line.still ?? null;
}

/** Ease across the first moment of a beat, then hold so the sentence is read on the settled view. */
export function arrive(elapsed: number) {
  const x = Math.min(1, Math.max(0, elapsed) / 0.8);
  return 1 - (1 - x) ** 3;
}

export function modelTime(time: number): number | null {
  const line = lineAt(time);
  if (line.visual === 'model' && line.storyFrom != null && line.storyTo != null) {
    return line.storyFrom + (line.storyTo - line.storyFrom) * arrive(time - line.start);
  }
  const next = lines.find((item) => item.visual === 'model' && item.start > time);
  if (next?.storyFrom != null && next.start - time < 0.45) return next.storyFrom;
  return null;
}

export function chipProgress(time: number) {
  return Math.min(1, Math.max(0, (time - CHIP.start) / (CHIP.end - CHIP.start)));
}
