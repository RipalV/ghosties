import type { ScareResult } from '../fear/FearEngine';

/** Minimum exposure (0–1) required to grant the observation bonus on a matching scare. */
export const OBSERVATION_BONUS_MIN_EXPOSURE = 0.5;

export type ExposureOutcomeKind = 'miss' | 'partial' | 'full';

export function classifyExposureOutcome(exposureRatio: number): ExposureOutcomeKind {
  if (exposureRatio <= 0) return 'miss';
  if (exposureRatio >= 1) return 'full';
  return 'partial';
}

export function observationBonusAllowed(exposureRatio: number): boolean {
  return exposureRatio >= OBSERVATION_BONUS_MIN_EXPOSURE;
}

/** Scare fear/score/energy apply only when Nora had some exposure during the cast. */
export function shouldApplyScareOutcome(exposureRatio: number): boolean {
  return exposureRatio > 0;
}

export function scaleScareResult(result: ScareResult, exposureRatio: number): ScareResult {
  const kind = classifyExposureOutcome(exposureRatio);

  if (kind === 'miss') {
    return {
      ...result,
      fearGained: 0,
      scoreDelta: 0,
      reaction: 'Too far — the scare never reached Nora.',
    };
  }

  if (kind === 'full') {
    return result;
  }

  const scaledFear = Math.round(result.fearGained * exposureRatio);
  const scaledScore =
    result.scoreDelta === 0 ? 0 : Math.round(result.scoreDelta * exposureRatio);

  let reaction = result.reaction;
  if (result.strength === 'none') {
    reaction = `Only partly reached her — ${result.reaction}`;
  } else if (scaledFear > 0) {
    reaction = `Partly caught! ${result.reaction}`;
  } else {
    reaction = 'Only partly caught — Nora barely noticed.';
  }

  return {
    ...result,
    fearGained: scaledFear,
    scoreDelta: scaledScore,
    reaction,
  };
}
