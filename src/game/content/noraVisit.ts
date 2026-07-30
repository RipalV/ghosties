import type { VisitorVisitConfig } from '../session/types';
import { NORA_CONTENT } from './nora';
import {
  COMFORT_MARGIN_MS,
  FIRST_VISIT_COMFORT_BONUS_MS,
  TARGET_OBSERVATIONS,
  TARGET_SCARES,
  buildVisitPacing,
  type VisitPacingResult,
} from './visitTiming';
import { SCARE_CAST_DURATION_MS } from '../scareCast/scareCastSession';
import { MOVEMENT } from '../world/lobbyLayout';

const FIRST_SESSION_VISIT_INDEX = 0;

const ENTRANCE = { x: 740, y: 420 } as const;

const POI_COORDS = [
  { x: 620, y: 350 },
  { x: 520, y: 370 },
  { x: 1180, y: 560 },
  { x: 820, y: 600 },
] as const;

function noraPacing(comfortMarginMs: number): VisitPacingResult {
  return buildVisitPacing({
    observationCount: TARGET_OBSERVATIONS,
    scareCount: TARGET_SCARES,
    observationDurationMs: NORA_CONTENT.observation.durationMs,
    scareCastDurationMs: SCARE_CAST_DURATION_MS,
    npcSpeed: MOVEMENT.npcSpeed,
    entrance: ENTRANCE,
    pointsOfInterest: POI_COORDS,
    comfortMarginMs,
  });
}

/** Standard Nora visit — repeat rotations after the first session visit. */
const VISIT_PACING = noraPacing(COMFORT_MARGIN_MS);

/** First Nora visit of the session — longer pauses for guided onboarding. */
const FIRST_VISIT_PACING = noraPacing(COMFORT_MARGIN_MS + FIRST_VISIT_COMFORT_BONUS_MS);

function buildNoraVisitConfig(pacing: VisitPacingResult): VisitorVisitConfig {
  return {
    visitorName: 'Nora',
    spawn: { x: 620, y: 380 },
    entrance: ENTRANCE,
    pointsOfInterest: POI_COORDS.map((poi, index) => ({
      ...poi,
      pauseMs: pacing.poiPauseMs[index] ?? 12000,
    })),
    exit: { x: 680, y: 480 },
    successMinFearStage: 'possessed',
    locationReadyAnnounceMs: 1800,
    announceEnterDelayMs: 2200,
    entranceArrivalThreshold: 8,
    exitArrivalThreshold: 8,
  };
}

/** Authored Nora visit route — separate from fear/clue content in nora.ts. */
export const NORA_VISIT = buildNoraVisitConfig(VISIT_PACING);

export const NORA_FIRST_VISIT = buildNoraVisitConfig(FIRST_VISIT_PACING);

/** First session visit uses longer POI pauses; later Nora visits use standard pacing. */
export function noraVisitForIndex(visitIndex: number): VisitorVisitConfig {
  return visitIndex === FIRST_SESSION_VISIT_INDEX ? NORA_FIRST_VISIT : NORA_VISIT;
}

export { VISIT_PACING, FIRST_VISIT_PACING };
