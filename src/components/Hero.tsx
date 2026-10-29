import { campaign } from '../config/facts';
import { assets } from '../config/site';
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
            alt="TIGERS-X mission patch: an orange payload box above Earth, framed by the words Thailand Innovative G-force-Varied Emulsification Research for Space Exploration."
          />
        </figure>
        <div className="hero-copy">
          <h1 id="question-title" className="hero-title">
            <span className="hero-title__name">TIGERS-X</span>
            <span className="hero-title__full">
              Thailand Innovative G{'\u2011'}force Varied Emulsification Research for Space Exploration
            </span>
          </h1>
          <p className="lead">
            TIGERS-X is a low-cost, teleoperated lab-on-chip cube. For {campaign.days} days aboard the International
            Space Station it recorded how an immiscible oil and an aqueous phase redistribute in Tesla-valve
            microchannels under sustained microgravity. After installation, every science run was commanded from the
            ground.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#overview">
              Explore Mission
            </a>
            <a className="button button--light" href="#documentation">
              Academic Resources
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
