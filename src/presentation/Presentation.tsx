import { useEffect, useRef, useState } from 'react';
import { mixingIndex } from '../config/facts';
import { assets } from '../config/site';
import { useReducedMotion } from '../lib/hooks';
import { ChannelView } from './ChannelView';
import { PayloadView } from './PayloadView';
import {
  LOOP,
  chipProgress,
  copyAt,
  lineAt,
  lines,
  mediaAt,
  modelTime,
  type Media,
} from './script';
import './presentation.css';

function clockLabel(seconds: number) {
  const whole = Math.min(LOOP - 1, Math.max(0, Math.floor(seconds)));
  return `0:${String(whole).padStart(2, '0')}`;
}

function useFilmClock() {
  const origin = useRef(performance.now());
  const pausedAt = useRef<number | null>(null);
  const [time, setTime] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const end = pausedAt.current ?? performance.now();
      const elapsed = ((end - origin.current) % (LOOP * 1000) + LOOP * 1000) % (LOOP * 1000);
      setTime(elapsed / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const seek = (next: number) => {
    const wrapped = ((next % LOOP) + LOOP) % LOOP;
    const end = pausedAt.current ?? performance.now();
    origin.current = end - wrapped * 1000;
    setTime(wrapped);
  };

  const toggle = () => {
    if (pausedAt.current == null) {
      pausedAt.current = performance.now();
      setPaused(true);
    } else {
      origin.current += performance.now() - pausedAt.current;
      pausedAt.current = null;
      setPaused(false);
    }
  };

  return { time, paused, seek, toggle };
}

function FrameMedia({
  media,
  drift,
  elapsed,
  paused,
}: {
  media: Media;
  drift: boolean;
  elapsed: number;
  paused: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || media.kind !== 'video') return;
    const place = () => {
      const target = elapsed + (media.from ?? 0);
      if (video.readyState >= 1 && Math.abs(video.currentTime - target) > 0.45) {
        const limit = Number.isFinite(video.duration) ? Math.max(0, video.duration - 0.05) : target;
        video.currentTime = Math.min(Math.max(0, target), limit);
      }
      if (paused) video.pause();
      else void video.play().catch(() => {});
    };
    place();
    video.addEventListener('loadeddata', place);
    return () => video.removeEventListener('loadeddata', place);
  }, [elapsed, paused, media]);

  if (media.kind === 'video') {
    return (
      <video
        ref={videoRef}
        key={media.src}
        className={media.fit === 'contain' ? 'is-contain' : undefined}
        src={media.src}
        poster={media.poster}
        muted
        playsInline
        autoPlay
        preload="auto"
        aria-label={media.alt}
      />
    );
  }
  return (
    <img
      key={media.src}
      className={drift ? 'is-drift' : undefined}
      src={media.src}
      alt={media.alt}
      style={{ objectPosition: media.focal ?? '50% 50%' }}
      draggable={false}
    />
  );
}

export function Presentation() {
  const { time, paused, seek, toggle } = useFilmClock();
  const reduced = useReducedMotion();
  const line = lineAt(time);
  const copy = copyAt(line, time);
  const media = mediaAt(line, time);
  const storyT = modelTime(time);
  const onChip = line.visual === 'chip';
  const progress = reduced && onChip ? Math.min(1, Math.ceil(Math.max(chipProgress(time), 0.001) * 4) / 4) : chipProgress(time);
  const api = useRef({ seek, toggle, time });
  api.current = { seek, toggle, time };

  useEffect(() => {
    document.documentElement.classList.add('is-film');
    return () => document.documentElement.classList.remove('is-film');
  }, []);

  useEffect(() => {
    const urls = [
      '/media/mission/tigers-x-floating.jpg',
      '/media/mission/zero-g.jpg',
      '/media/mission/payload-development-1.jpg',
      '/media/mission/payload-development-2.jpg',
      '/media/mission/launch-pad-remote.jpg',
      '/media/mission/launch-falcon-9.jpg',
      '/media/mission/installation-poster.jpg',
      '/media/mission/lab-on-a-chip.gif',
      '/media/mission/tigers-x-in-icf.jpg',
      assets.patch,
    ];
    for (const src of urls) {
      const img = new Image();
      img.src = src;
    }
    const clip = document.createElement('video');
    clip.preload = 'auto';
    clip.muted = true;
    clip.src = '/media/mission/installation.mp4';
    clip.load();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        api.current.toggle();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        api.current.seek(api.current.time + 5);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        api.current.seek(api.current.time - 5);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const local = (time - line.start) / (line.end - line.start);

  return (
    <div className={`film theme-${line.theme} is-${line.visual}${line.id === 'title' ? ' is-title' : ''}`}>
      <p className="visually-hidden" aria-live="polite">
        {copy.kicker}. {copy.title}. {copy.dek ? `${copy.dek}. ` : ''}
        {copy.body}
      </p>

      {(line.visual === 'photo' || line.visual === 'slides' || line.visual === 'result') && media && (
        <div className={`film-photo${media.kind === 'video' || media.fit === 'contain' ? ' is-stage' : ''}`} key={media.kind === 'video' ? media.src : media.src}>
          <FrameMedia
            media={media}
            drift={!reduced && media.kind === 'image' && media.fit !== 'contain'}
            elapsed={time - line.start}
            paused={paused}
          />
          <p className="film-credit">{media.credit}</p>
        </div>
      )}

      {line.visual === 'why' && media?.kind === 'image' && (
        <figure className="film-aside">
          <img src={media.src} alt={media.alt} />
          <figcaption>
            The 2025 parabolic-flight platform.
            <span>{media.credit}</span>
          </figcaption>
        </figure>
      )}

      {line.visual === 'run' && media?.kind === 'image' && (
        <figure className="film-run">
          <img src={media.src} alt={media.alt} />
          <figcaption>{media.credit}</figcaption>
        </figure>
      )}

      <div className={`film-model${line.visual === 'model' ? ' is-on' : ''}`} aria-hidden={line.visual === 'model' ? undefined : true}>
        <PayloadView storyT={storyT} />
      </div>

      {onChip && (
        <div className="film-chip">
          <ChannelView progress={progress} />
        </div>
      )}

      <a
        className="film-qr"
        href="https://tigers-x.ishalab.space"
        target="_blank"
        rel="noreferrer"
        aria-label="QR code linking to https://tigers-x.ishalab.space"
      >
        <img src="/media/site-qr.svg" width={112} height={112} alt="" />
      </a>

      {line.id !== 'title' && <p className="film-mark">TIGERS-X</p>}

      {line.id === 'title' && <img className="film-patch" src={assets.patch} alt="" width={120} height={120} />}

      <div className="film-copy" key={copy.key}>
        <p className="film-kicker">{copy.kicker}</p>
        <h1 className="film-title">{copy.title}</h1>
        {copy.dek && <p className="film-dek">{copy.dek}</p>}
        <p className="film-body">{copy.body}</p>
        {line.visual === 'result' && (
          <dl className="film-index">
            {mixingIndex.map((row) => (
              <div key={row.id}>
                <dt>{row.id}</dt>
                <dd>{row.final.toFixed(2)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="film-bar">
        <div className="film-rail" role="group" aria-label="Presentation sections">
          {lines.map((item) => {
            const span = item.end - item.start;
            const fill = time >= item.end ? 1 : time < item.start ? 0 : (time - item.start) / span;
            return (
              <button
                key={item.id}
                type="button"
                className="film-seg"
                style={{ flexGrow: span, ['--p' as string]: String(fill) }}
                aria-current={item.id === line.id ? 'true' : undefined}
                aria-label={`${item.title}, ${Math.round(span)} seconds`}
                onClick={() => seek(item.start)}
              >
                <i />
              </button>
            );
          })}
        </div>
        <div className="film-controls">
          <span className="film-clock">
            {clockLabel(time)}
            <span> / 1:00</span>
          </span>
          <button type="button" className="film-pause" onClick={toggle} aria-pressed={paused}>
            {paused ? 'Play' : 'Pause'}
          </button>
        </div>
      </div>
      <span className="visually-hidden">Section progress {Math.round(local * 100)} percent. Space pauses. Arrow keys skip five seconds.</span>
    </div>
  );
}
