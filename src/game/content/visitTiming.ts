import { SCARE_CAST_DURATION_MS } from '../scareCast/scareCastSession';
import { MOVEMENT } from '../world/lobbyLayout';

/** Vertical-slice pacing goal: three full Observe passes and five scare casts per visit. */
export const TARGET_OBSERVATIONS = 3;
export const TARGET_SCARES = 5;

/** Time to reposition or read feedback between sequential Observe/scare actions. */
export const REPOSITION_BUFFER_MS = 2000;

/** Extra pause budget so the route never feels like a speed-run. */
export const COMFORT_MARGIN_MS = 5000;

export interface VisitPacingPoint {
  readonly x: number;
  readonly y: number;
}

export interface VisitPacingInput {
  readonly observationCount: number;
  readonly scareCount: number;
  readonly observationDurationMs: number;
  readonly scareCastDurationMs: number;
  readonly npcSpeed: number;
  readonly entrance: VisitPacingPoint;
  readonly pointsOfInterest: readonly VisitPacingPoint[];
  readonly repositionBufferMs?: number;
  readonly comfortMarginMs?: number;
}

export interface VisitPacingResult {
  readonly sequentialActionMs: number;
  readonly transitionBufferMs: number;
  readonly travelMs: number;
  readonly minimumActiveHauntingMs: number;
  readonly totalPauseMs: number;
  readonly poiPauseMs: readonly number[];
}

function worldDistance(a: VisitPacingPoint, b: VisitPacingPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

/** Travel time while Nora walks between entrance and POIs during active haunting. */
export function estimateVisitingTravelMs(
  entrance: VisitPacingPoint,
  pointsOfInterest: readonly VisitPacingPoint[],
  npcSpeed: number,
): number {
  if (pointsOfInterest.length === 0 || npcSpeed <= 0) return 0;

  let total = 0;
  let from = entrance;
  for (const poi of pointsOfInterest) {
    total += (worldDistance(from, poi) / npcSpeed) * 1000;
    from = poi;
  }
  return Math.ceil(total);
}

/** Minimum sequential time for Observe + scare actions (mutually exclusive). */
export function sequentialActionMs(
  observationCount: number,
  scareCount: number,
  observationDurationMs: number,
  scareCastDurationMs: number,
): number {
  return observationCount * observationDurationMs + scareCount * scareCastDurationMs;
}

export function buildVisitPacing(input: VisitPacingInput): VisitPacingResult {
  const repositionBufferMs = input.repositionBufferMs ?? REPOSITION_BUFFER_MS;
  const comfortMarginMs = input.comfortMarginMs ?? COMFORT_MARGIN_MS;
  const actionMs = sequentialActionMs(
    input.observationCount,
    input.scareCount,
    input.observationDurationMs,
    input.scareCastDurationMs,
  );
  const actionCount = input.observationCount + input.scareCount;
  const transitionBufferMs =
    actionCount > 1 ? (actionCount - 1) * repositionBufferMs : 0;
  const travelMs = estimateVisitingTravelMs(
    input.entrance,
    input.pointsOfInterest,
    input.npcSpeed,
  );
  const minimumActiveHauntingMs = actionMs + transitionBufferMs + comfortMarginMs + travelMs;
  const totalPauseMs = minimumActiveHauntingMs - travelMs;
  const poiPauseMs = distributePoiPauses(totalPauseMs, input.pointsOfInterest.length);

  return {
    sequentialActionMs: actionMs,
    transitionBufferMs,
    travelMs,
    minimumActiveHauntingMs,
    totalPauseMs,
    poiPauseMs,
  };
}

/** Split pause budget across POIs — middle stops get slightly longer dwell time. */
export function distributePoiPauses(totalPauseMs: number, poiCount: number): readonly number[] {
  if (poiCount <= 0) return [];
  if (poiCount === 1) return [Math.ceil(totalPauseMs)];

  const weights = Array.from({ length: poiCount }, (_, index) => {
    if (index === 0 || index === poiCount - 1) return 0.95;
    return 1.05;
  });
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const base = totalPauseMs / weightSum;

  const pauses = weights.map((weight) => Math.floor(base * weight));
  let remainder = totalPauseMs - pauses.reduce((sum, pause) => sum + pause, 0);
  let index = Math.floor(poiCount / 2);
  while (remainder > 0) {
    pauses[index] += 1;
    remainder -= 1;
    index = (index + 1) % poiCount;
  }
  return pauses;
}

/** Defaults used by Nora's authored visit route. */
export function defaultNoraVisitPacing(
  entrance: VisitPacingPoint,
  pointsOfInterest: readonly VisitPacingPoint[],
  observationDurationMs: number,
): VisitPacingResult {
  return buildVisitPacing({
    observationCount: TARGET_OBSERVATIONS,
    scareCount: TARGET_SCARES,
    observationDurationMs,
    scareCastDurationMs: SCARE_CAST_DURATION_MS,
    npcSpeed: MOVEMENT.npcSpeed,
    entrance,
    pointsOfInterest,
  });
}
