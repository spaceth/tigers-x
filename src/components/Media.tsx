import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { mediaSlots, type MediaItem, type MediaSlot } from '../config/media';
import { useInView, useReducedMotion } from '../lib/hooks';

function MediaFrame({ item, placeholder, sizes }: { item: MediaItem; placeholder: string; sizes?: string }) {
  // Heavy media only loads once the slot is near the viewport.
  const [ref, near] = useInView<HTMLDivElement>({ margin: '600px 0px' });
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const ambient = Boolean(item.ambient) && !reduced;
  const style = { aspectRatio: String(item.aspectRatio) };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ambient) return;
    video.muted = true;
    const pending = video.play();
    pending?.catch(() => {});
  }, [ambient, near]);

  if (!item.src) {
    return (
      <div ref={ref} className="media-frame media-frame--placeholder" style={style} role="img" aria-label={`${placeholder}: media to be added.`}>
        <span className="media-placeholder-title">{placeholder}</span>
        <span className="media-placeholder-kind">{item.kind === 'video' ? 'Video forthcoming' : 'Photograph forthcoming'}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="media-frame" style={style}>
      {near &&
        (item.kind === 'video' ? (
          <video
            ref={videoRef}
            controls={!ambient}
            autoPlay={ambient}
            muted={ambient}
            loop={ambient}
            playsInline
            preload={ambient ? 'auto' : 'metadata'}
            poster={item.poster ?? undefined}
            aria-label={item.alt}
            className={ambient ? 'is-ambient' : undefined}
            style={{ objectPosition: item.focal }}
          >
            <source src={item.src} />
            {item.captions && <track kind="captions" src={item.captions.src} srcLang={item.captions.srclang} label={item.captions.label} default />}
          </video>
        ) : (
          <img
            src={reduced && item.poster ? item.poster : item.src}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            sizes={sizes}
            style={{ objectPosition: item.focal }}
          />
        ))}
    </div>
  );
}

function Caption({ item }: { item: MediaItem }) {
  return (
    <figcaption>
      {item.caption}
      <span className={`media-credit${item.credit ? '' : ' media-credit--pending'}`}>
        {item.credit ?? 'Credit to be added'}
      </span>
    </figcaption>
  );
}

/** One large photograph, with smaller thumbnails that choose which one is shown. */
export function MediaSlideshow({ slotId, className = '' }: { slotId: MediaSlot['id']; className?: string }) {
  const slot = mediaSlots[slotId];
  const [index, setIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const item = slot.items[index] ?? slot.items[0];

  const choose = (next: number, focus = false) => {
    const count = slot.items.length;
    const wrapped = (next + count) % count;
    setIndex(wrapped);
    if (focus) {
      thumbsRef.current?.querySelectorAll('button')[wrapped]?.focus();
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      choose(index + 1, true);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      choose(index - 1, true);
    }
  };

  return (
    <figure className={`media media-slideshow ${className}`} data-slot={slot.id}>
      <MediaFrame item={item} placeholder={slot.placeholder} />
      {slot.items.length > 1 && (
        <div
          ref={thumbsRef}
          className="media-thumbs"
          role="radiogroup"
          aria-label="Photographs of TIGERS-X aboard the station"
          onKeyDown={onKeyDown}
        >
          {slot.items.map((thumb, i) => (
            <button
              key={thumb.id}
              type="button"
              role="radio"
              aria-checked={i === index}
              aria-label={thumb.caption}
              className={i === index ? 'is-current' : undefined}
              onClick={() => choose(i)}
            >
              {thumb.src && <img src={thumb.src} alt="" />}
            </button>
          ))}
        </div>
      )}
      <Caption item={item} />
    </figure>
  );
}

export function MediaFigure({ slotId, className = '' }: { slotId: MediaSlot['id']; className?: string }) {
  const slot = mediaSlots[slotId];
  const [first] = slot.items;
  return (
    <figure className={`media ${className}`} data-slot={slot.id}>
      <MediaFrame item={first} placeholder={slot.placeholder} />
      <Caption item={first} />
    </figure>
  );
}

/** Lead item plus a row of supporting items (development slot). */
export function MediaGallery({ slotId }: { slotId: MediaSlot['id'] }) {
  const slot = mediaSlots[slotId];
  const [lead, ...rest] = slot.items;
  return (
    <div className="media-gallery" data-slot={slot.id}>
      <figure className="media media--lead">
        <MediaFrame item={lead} placeholder={slot.placeholder} />
        <Caption item={lead} />
      </figure>
      {rest.length > 0 && (
        <ul className="media-row" role="list">
          {rest.map((item) => (
            <li key={item.id}>
              <figure className="media">
                <MediaFrame item={item} placeholder={slot.placeholder.replace(/ — .*$/, '') + ' — photograph'} />
                <Caption item={item} />
              </figure>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
