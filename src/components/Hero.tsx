import { campaign } from '../config/facts';
import { assets } from '../config/site';
import { copy, fill } from '../content';
import { HeroSky } from './HeroSky';

/** Opening sky: patch, title, and one line. At least one viewport; taller when the copy needs it. */
export function Hero() {
  return (
    <div className="hero-sky theme-night">
      <HeroSky />
      <div className="container hero">
        <figure className="hero-patch">
          <img
            src={assets.patch}
            width={2048}
            height={2048}
            alt={copy.hero.patchAlt}
          />
        </figure>
        <div className="hero-copy">
          <h1 id="question-title" className="hero-title">
            <span className="hero-title__name">{copy.hero.name}</span>
            <span className="hero-title__full">{copy.hero.fullName}</span>
          </h1>
          <p className="lead">{fill(copy.hero.lead, { days: campaign.days })}</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#overview">
              {copy.hero.explore}
            </a>
            <a className="button button--light" href="#documentation">
              {copy.hero.resources}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
