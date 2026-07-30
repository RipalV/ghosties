import type { VisitorVisitConfig } from '../session/types';
import { NORA_CONTENT } from './nora';
import { defaultNoraVisitPacing } from './visitTiming';

const ENTRANCE = { x: 740, y: 420 } as const;

const POI_COORDS = [
  { x: 760, y: 430 },
  { x: 1080, y: 400 },
  { x: 1180, y: 560 },
  { x: 820, y: 600 },
] as const;

/**
 * Pause lengths derived from visit pacing maths:
 * 3 × 8000 ms Observe + 5 × 2200 ms scare casts + reposition buffers + travel.
 */
const VISIT_PACING = defaultNoraVisitPacing(
  ENTRANCE,
  POI_COORDS,
  NORA_CONTENT.observation.durationMs,
);

/** Authored Nora visit route — separate from fear/clue content in nora.ts. */
export const NORA_VISIT: VisitorVisitConfig = {
  visitorName: 'Nora',
  spawn: { x: 620, y: 380 },
  entrance: ENTRANCE,
  pointsOfInterest: POI_COORDS.map((poi, index) => ({
    ...poi,
    pauseMs: VISIT_PACING.poiPauseMs[index] ?? 12000,
  })),
  exit: { x: 680, y: 480 },
  successMinFearStage: 'possessed',
  locationReadyAnnounceMs: 1800,
  announceEnterDelayMs: 2200,
  entranceArrivalThreshold: 8,
  exitArrivalThreshold: 8,
};

export { VISIT_PACING };
