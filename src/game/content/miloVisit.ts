import type { VisitorVisitConfig } from '../session/types';
import { MILO_CONTENT } from './milo';
import { buildVisitPacing } from './visitTiming';
import { SCARE_CAST_DURATION_MS } from '../scareCast/scareCastSession';
import { MOVEMENT } from '../world/lobbyLayout';
import { TARGET_OBSERVATIONS, TARGET_SCARES } from './visitTiming';

const ENTRANCE = { x: 920, y: 500 } as const;

/** Different lobby path from Nora — shorter pauses, fewer POIs, snappier pacing. */
const POI_COORDS = [
  { x: 1040, y: 460 },
  { x: 1160, y: 540 },
  { x: 980, y: 620 },
] as const;

const MILO_PACING = buildVisitPacing({
  observationCount: TARGET_OBSERVATIONS,
  scareCount: TARGET_SCARES,
  observationDurationMs: MILO_CONTENT.observation.durationMs,
  scareCastDurationMs: SCARE_CAST_DURATION_MS,
  npcSpeed: MOVEMENT.npcSpeed,
  entrance: ENTRANCE,
  pointsOfInterest: POI_COORDS,
  repositionBufferMs: 1500,
  comfortMarginMs: 3500,
});

/** Authored Milo visit route — separate from fear/clue content in milo.ts. */
export const MILO_VISIT: VisitorVisitConfig = {
  visitorName: 'Milo',
  spawn: { x: 1080, y: 360 },
  entrance: ENTRANCE,
  pointsOfInterest: POI_COORDS.map((poi, index) => ({
    ...poi,
    pauseMs: MILO_PACING.poiPauseMs[index] ?? 9000,
  })),
  exit: { x: 860, y: 480 },
  successMinFearStage: 'possessed',
  locationReadyAnnounceMs: 1600,
  announceEnterDelayMs: 2000,
  entranceArrivalThreshold: 8,
  exitArrivalThreshold: 8,
};

export { MILO_PACING };
