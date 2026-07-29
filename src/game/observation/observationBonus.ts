import type { ScareCategory } from '../abilities/ScareAbility';
import { hasUsefulClue, grantObservationBonus } from './discoveryStore';
import type { ClueDefinition, DiscoveryState } from './types';

export const OBSERVATION_BONUS_SCORE = 5;

export function isObservationBonusEligible(
  category: ScareCategory,
  primaryFear: ScareCategory,
  discovery: DiscoveryState,
  clues: readonly ClueDefinition[],
): boolean {
  if (discovery.observationBonusGranted) return false;
  if (category !== primaryFear) return false;
  return hasUsefulClue(discovery, clues);
}

export interface ObservationBonusResult {
  readonly bonus: number;
  readonly discovery: DiscoveryState;
}

export function applyObservationBonus(
  discovery: DiscoveryState,
  category: ScareCategory,
  primaryFear: ScareCategory,
  clues: readonly ClueDefinition[],
): ObservationBonusResult {
  if (!isObservationBonusEligible(category, primaryFear, discovery, clues)) {
    return { bonus: 0, discovery };
  }

  return {
    bonus: OBSERVATION_BONUS_SCORE,
    discovery: grantObservationBonus(discovery),
  };
}
