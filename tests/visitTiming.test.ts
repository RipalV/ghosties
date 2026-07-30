import { describe, expect, it } from 'vitest';
import { SCARE_CAST_DURATION_MS } from '../src/game/scareCast/scareCastSession';
import { NORA_CONTENT } from '../src/game/content/nora';
import { VISIT_PACING, FIRST_VISIT_PACING, noraVisitForIndex } from '../src/game/content/noraVisit';
import {
  FIRST_VISIT_COMFORT_BONUS_MS,
  REPOSITION_BUFFER_MS,
  TARGET_OBSERVATIONS,
  TARGET_SCARES,
  buildVisitPacing,
  defaultNoraVisitPacing,
  distributePoiPauses,
  estimateVisitingTravelMs,
  sequentialActionMs,
} from '../src/game/content/visitTiming';
import { MOVEMENT } from '../src/game/world/lobbyLayout';

const ENTRANCE = { x: 740, y: 420 };
const POIS = [
  { x: 760, y: 430 },
  { x: 1080, y: 400 },
  { x: 1180, y: 560 },
  { x: 820, y: 600 },
];

describe('visit pacing maths', () => {
  it('budgets three observations and five scare casts sequentially', () => {
    const actionMs = sequentialActionMs(
      TARGET_OBSERVATIONS,
      TARGET_SCARES,
      NORA_CONTENT.observation.durationMs,
      SCARE_CAST_DURATION_MS,
    );
    expect(actionMs).toBe(3 * 8000 + 5 * SCARE_CAST_DURATION_MS);
    expect(actionMs).toBe(3 * 8000 + 5 * 2200);
  });

  it('allocates enough pause time for the Nora visit route', () => {
    const pacing = defaultNoraVisitPacing(ENTRANCE, POIS, NORA_CONTENT.observation.durationMs);

    expect(pacing.sequentialActionMs).toBe(3 * 8000 + 5 * SCARE_CAST_DURATION_MS);
    expect(pacing.transitionBufferMs).toBe((TARGET_OBSERVATIONS + TARGET_SCARES - 1) * REPOSITION_BUFFER_MS);
    expect(pacing.travelMs).toBeGreaterThan(12_000);
    expect(pacing.totalPauseMs).toBeGreaterThan(70_000);
    expect(pacing.minimumActiveHauntingMs).toBeGreaterThanOrEqual(85_000);
    expect(pacing.poiPauseMs.reduce((sum, pause) => sum + pause, 0)).toBe(pacing.totalPauseMs);
    expect(pacing.poiPauseMs.every((pause) => pause >= 16_000)).toBe(true);
  });

  it('matches exported Nora visit pacing constants', () => {
    expect(VISIT_PACING.poiPauseMs).toHaveLength(4);
    expect(VISIT_PACING.minimumActiveHauntingMs).toBeGreaterThanOrEqual(85_000);
  });

  it('estimates travel from entrance through POIs', () => {
    const travelMs = estimateVisitingTravelMs(ENTRANCE, POIS, MOVEMENT.npcSpeed);
    expect(travelMs).toBeGreaterThan(12_000);
    expect(travelMs).toBeLessThan(14_000);
  });

  it('distributes pause budget across all POIs', () => {
    const pauses = distributePoiPauses(50_500, 4);
    expect(pauses).toHaveLength(4);
    expect(pauses.reduce((sum, pause) => sum + pause, 0)).toBe(50_500);
  });

  it('scales when scare or observation counts change', () => {
    const longer = buildVisitPacing({
      observationCount: 4,
      scareCount: 6,
      observationDurationMs: 8000,
      scareCastDurationMs: 1500,
      npcSpeed: MOVEMENT.npcSpeed,
      entrance: ENTRANCE,
      pointsOfInterest: POIS,
    });
    const baseline = defaultNoraVisitPacing(ENTRANCE, POIS, 8000);
    expect(longer.totalPauseMs).toBeGreaterThan(baseline.totalPauseMs);
  });

  it('gives the first Nora visit extra pause budget for onboarding', () => {
    expect(FIRST_VISIT_PACING.minimumActiveHauntingMs).toBeGreaterThan(
      VISIT_PACING.minimumActiveHauntingMs,
    );
    expect(
      FIRST_VISIT_PACING.minimumActiveHauntingMs - VISIT_PACING.minimumActiveHauntingMs,
    ).toBe(FIRST_VISIT_COMFORT_BONUS_MS);
    expect(noraVisitForIndex(0).pointsOfInterest[0].pauseMs).toBeGreaterThan(
      noraVisitForIndex(2).pointsOfInterest[0].pauseMs,
    );
  });
});
