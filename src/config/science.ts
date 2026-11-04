import { copy, fill } from '../content';
import { campaign, parabolic } from './facts';
import { assets } from './site';

const vars = {
  windowSeconds: parabolic.windowSeconds,
  days: campaign.days,
  operationsStart: campaign.operationsStart,
  operationsEnd: campaign.operationsEnd,
  gJitter: parabolic.gJitter,
  trials: parabolic.trials,
  platformKg: parabolic.platformKg,
  uniformityGainPct: parabolic.uniformityGainPct,
};

/** Column labels used on the stacked (mobile) comparison table. */
export const platformLabels = {
  parabolic: copy.platforms.parabolicLabel,
  iss: copy.platforms.issLabel,
} as const;

/** Parabolic flight versus the ISS, as reported in the paper (prior study: Seehanam et al., Sci Rep 2025). */
export const platformRows: { factor: string; sub?: string; parabolic: string; iss: string }[] =
  copy.platforms.rows.map((row) => ({
    factor: row.factor,
    parabolic: fill(row.parabolic, vars),
    iss: fill(row.iss, vars),
  }));

const goalIcons = {
  tpn: assets.iconMedical,
  food: assets.iconFood,
  medicine: assets.iconExploration,
} as const;

export const goalCards: { id: keyof typeof copy.science.goals; icon: string; title: string; body: string }[] = (
  Object.keys(copy.science.goals) as (keyof typeof copy.science.goals)[]
).map((id) => ({
  id,
  icon: goalIcons[id],
  title: copy.science.goals[id].title,
  body: copy.science.goals[id].body,
}));
