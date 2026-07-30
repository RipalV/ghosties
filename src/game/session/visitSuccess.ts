import type { FearStage } from '../fear/FearEngine';
import type { HauntingPhase, VisitOutcome } from './types';

const STAGE_ORDER: readonly FearStage[] = [
  'calm',
  'curious',
  'uneasy',
  'frightened',
  'runaway',
  'swoon',
  'possessed',
];

export function meetsMinFearStage(current: FearStage, minimum: FearStage): boolean {
  return STAGE_ORDER.indexOf(current) >= STAGE_ORDER.indexOf(minimum);
}

export function shouldDepartOnSuccess(
  fearStage: FearStage,
  minStage: FearStage,
): boolean {
  return meetsMinFearStage(fearStage, minStage);
}

export function shouldDepartOnRouteComplete(
  routeComplete: boolean,
  phase: HauntingPhase,
): boolean {
  return routeComplete && phase === 'activeHaunting';
}

export function visitOutcomeForDeparture(success: boolean): VisitOutcome {
  return success ? 'haunted' : 'unimpressed';
}
