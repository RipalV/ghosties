import type { VisitorVisitConfig } from '../session/types';
import { MILO_CONTENT } from './milo';
import { buildVisitPacing, TARGET_OBSERVATIONS, TARGET_SCARES } from './visitTiming';
import { SCARE_CAST_DURATION_MS } from '../scareCast/scareCastSession';
import { artPointToWorld, LOBBY_ART_SPOTS } from '../world/lobbyArtLayout';
import { MOVEMENT } from '../world/lobbyLayout';

/** Milo always arrives down the grand staircase — never the front doors. */
const ENTRANCE = artPointToWorld(LOBBY_ART_SPOTS.stairsLanding.x, LOBBY_ART_SPOTS.stairsLanding.y);
const SPAWN = artPointToWorld(LOBBY_ART_SPOTS.stairs.x, LOBBY_ART_SPOTS.stairs.y);
const EXIT = artPointToWorld(LOBBY_ART_SPOTS.stairsLanding.x - 40, LOBBY_ART_SPOTS.stairsLanding.y + 20);

/** Milo favours the fireplace nook after coming down the stairs. */
const POI_COORDS = [
  artPointToWorld(LOBBY_ART_SPOTS.draftyFireplace.x - 40, LOBBY_ART_SPOTS.draftyFireplace.y + 60),
  artPointToWorld(LOBBY_ART_SPOTS.rugCentre.x + 80, LOBBY_ART_SPOTS.rugCentre.y + 20),
  artPointToWorld(LOBBY_ART_SPOTS.crookedPortrait.x + 60, LOBBY_ART_SPOTS.crookedPortrait.y + 70),
] as const;

const MILO_PACING = buildVisitPacing({
  observationCount: TARGET_OBSERVATIONS,
  scareCount: TARGET_SCARES,
  observationDurationMs: MILO_CONTENT.observation.durationMs,
  scareCastDurationMs: SCARE_CAST_DURATION_MS,
  npcSpeed: MOVEMENT.npcSpeed,
  entrance: ENTRANCE,
  pointsOfInterest: POI_COORDS,
  repositionBufferMs: 2600,
  comfortMarginMs: 11000,
});

export const MILO_VISIT: VisitorVisitConfig = {
  visitorName: 'Milo',
  spawn: SPAWN,
  entrance: ENTRANCE,
  pointsOfInterest: POI_COORDS.map((poi, index) => ({
    ...poi,
    pauseMs: MILO_PACING.poiPauseMs[index] ?? 9000,
  })),
  exit: EXIT,
  successMinFearStage: 'possessed',
  locationReadyAnnounceMs: 1600,
  announceEnterDelayMs: 2000,
  entranceArrivalThreshold: 8,
  exitArrivalThreshold: 8,
};

export { MILO_PACING };
