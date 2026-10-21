import { mediaSlots, type MediaItem, type MediaSlot } from '../config/media';
import { useInView } from '../lib/hooks';

function MediaFrame({ item, placeholder, sizes }: { item: MediaItem; placeholder: string; sizes?: string }) {
  // Heavy media only loads once the slot is near the viewport.
  const [ref, near] = useInView<HTMLDivElement>({ margin: '600px 0px' });
  const style = { aspectRatio: String(item.aspectRatio) };

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
            controls
            playsInline
            preload="metadata"
            poster={item.poster ?? undefined}
            aria-label={item.alt}
            style={{ objectPosition: item.focal }}
          >
            <source src={item.src} />
            {item.captions && <track kind="captions" src={item.captions.src} srcLang={item.captions.srclang} label={item.captions.label} default />}
          </video>
        ) : (
          <img src={item.src} alt={item.alt} loading="lazy" decoding="async" sizes={sizes} style={{ objectPosition: item.focal }} />
        ))}
    </div>
  );
}

function Caption({ item }: { item: MediaItem }) {
  return (
    <figcaption>
      {item.caption}
      {item.credit && <span className="media-credit"> {item.credit}</span>}
    </figcaption>
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
