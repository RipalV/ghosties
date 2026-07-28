import type { ScareCategory } from '../abilities/ScareAbility';

export type FearStrength = 'high' | 'medium' | 'none';
export type FearStage = 'calm' | 'curious' | 'uneasy' | 'frightened' | 'runaway' | 'swoon' | 'possessed';

export interface FearProfile {
  highFears: ScareCategory[];
  mediumFears: ScareCategory[];
  ineffectiveFears: ScareCategory[];
}

export interface ScareHistory {
  usesByCategory: Partial<Record<ScareCategory, number>>;
}

export interface ScareResult {
  strength: FearStrength;
  baseFear: number;
  noveltyMultiplier: number;
  fearGained: number;
  scoreDelta: number;
  reaction: string;
}

const BASE_FEAR: Record<FearStrength, number> = {
  high: 28,
  medium: 16,
  none: 0,
};

export function getFearStrength(profile: FearProfile, category: ScareCategory): FearStrength {
  if (profile.highFears.includes(category)) return 'high';
  if (profile.mediumFears.includes(category)) return 'medium';
  return 'none';
}

export function getNoveltyMultiplier(previousUses: number): number {
  if (previousUses <= 0) return 1;
  if (previousUses === 1) return 0.7;
  if (previousUses === 2) return 0.35;
  return 0.1;
}

export function resolveScare(
  profile: FearProfile,
  history: ScareHistory,
  category: ScareCategory,
): ScareResult {
  const strength = getFearStrength(profile, category);
  const previousUses = history.usesByCategory[category] ?? 0;
  const noveltyMultiplier = getNoveltyMultiplier(previousUses);
  const baseFear = BASE_FEAR[strength];
  const fearGained = Math.round(baseFear * noveltyMultiplier);

  if (strength === 'none') {
    return {
      strength,
      baseFear,
      noveltyMultiplier,
      fearGained: 0,
      scoreDelta: -5,
      reaction: 'That was funny, not frightening!',
    };
  }

  const scoreDelta = fearGained + (previousUses === 0 ? 5 : 0);
  return {
    strength,
    baseFear,
    noveltyMultiplier,
    fearGained,
    scoreDelta,
    reaction: strength === 'high' ? 'Perfect scare!' : 'That made them uneasy.',
  };
}

export function getFearStage(fear: number): FearStage {
  if (fear >= 100) return 'possessed';
  if (fear >= 85) return 'swoon';
  if (fear >= 65) return 'runaway';
  if (fear >= 45) return 'frightened';
  if (fear >= 25) return 'uneasy';
  if (fear >= 10) return 'curious';
  return 'calm';
}
