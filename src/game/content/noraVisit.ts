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
import { artPointToWorld, LOBBY_ART_SPOTS } from '../world/lobbyArtLayout';
import { MOVEMENT } from '../world/lobbyLayout';

const FIRST_SESSION_VISIT_INDEX = 0;

/** Nora always arrives through the front hotel doors. */
const ENTRANCE = artPointToWorld(LOBBY_ART_SPOTS.doorLanding.x, LOBBY_ART_SPOTS.doorLanding.y);
const SPAWN = artPointToWorld(LOBBY_ART_SPOTS.door.x, LOBBY_ART_SPOTS.door.y);
const EXIT = artPointToWorld(LOBBY_ART_SPOTS.doorLanding.x - 20, LOBBY_ART_SPOTS.doorLanding.y + 30);

/** Nora tours reception → portrait sofa → rug (door entry only). */
const POI_COORDS = [
  artPointToWorld(LOBBY_ART_SPOTS.receptionBell.x + 50, LOBBY_ART_SPOTS.receptionBell.y + 60),
  artPointToWorld(LOBBY_ART_SPOTS.crookedPortrait.x, LOBBY_ART_SPOTS.crookedPortrait.y + 50),
  artPointToWorld(LOBBY_ART_SPOTS.rugCentre.x + 100, LOBBY_ART_SPOTS.rugCentre.y + 50),
  artPointToWorld(LOBBY_ART_SPOTS.rugCentre.x - 120, LOBBY_ART_SPOTS.rugCentre.y + 90),
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

const VISIT_PACING = noraPacing(COMFORT_MARGIN_MS);
const FIRST_VISIT_PACING = noraPacing(COMFORT_MARGIN_MS + FIRST_VISIT_COMFORT_BONUS_MS);

function buildNoraVisitConfig(pacing: VisitPacingResult): VisitorVisitConfig {
  return {
    visitorName: 'Nora',
    spawn: SPAWN,
    entrance: ENTRANCE,
    pointsOfInterest: POI_COORDS.map((poi, index) => ({
      ...poi,
      pauseMs: pacing.poiPauseMs[index] ?? 12000,
    })),
    exit: EXIT,
    successMinFearStage: 'possessed',
    locationReadyAnnounceMs: 1800,
    announceEnterDelayMs: 2200,
    entranceArrivalThreshold: 8,
    exitArrivalThreshold: 8,
  };
}

export const NORA_VISIT = buildNoraVisitConfig(VISIT_PACING);
export const NORA_FIRST_VISIT = buildNoraVisitConfig(FIRST_VISIT_PACING);

export function noraVisitForIndex(visitIndex: number): VisitorVisitConfig {
  return visitIndex === FIRST_SESSION_VISIT_INDEX ? NORA_FIRST_VISIT : NORA_VISIT;
}

export { VISIT_PACING, FIRST_VISIT_PACING };
