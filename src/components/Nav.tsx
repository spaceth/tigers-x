import { useEffect, useState } from 'react';
import { assets, chapters, type ChapterId } from '../config/site';

export function Nav() {
  const [active, setActive] = useState<ChapterId>('question');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as ChapterId);
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const activeLabel = chapters.find((c) => c.id === active)?.label;

  return (
    <header className="site-nav">
      <a className="skip-link" href="#question">
        Skip to content
      </a>
      <div className="site-nav-inner">
        <a className="wordmark" href="#question" aria-label="TIGERS-X, back to the beginning">
          <img src={assets.patch} alt="" width={28} height={28} />
          <span>TIGERS-X</span>
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="chapter-list"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-label">{activeLabel}</span>
          <span className="nav-toggle-icon" aria-hidden="true" />
          <span className="visually-hidden">{open ? 'Close chapter list' : 'Open chapter list'}</span>
        </button>
        <nav aria-label="Chapters">
          <ol id="chapter-list" className={`chapter-list${open ? ' is-open' : ''}`}>
            {chapters.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`} aria-current={active === c.id ? 'location' : undefined} onClick={() => setOpen(false)}>
                  {c.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </header>
  );
}
