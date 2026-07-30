import { describe, expect, it } from 'vitest';
import {
  ghostCastSpeedTarget,
  ghostTravelSpeed,
  tickGhostSpeedMultiplier,
} from '../src/game/scareCast/ghostCastMovement';
import { MOVEMENT } from '../src/game/world/lobbyLayout';

describe('ghostCastSpeedTarget', () => {
  it('targets full speed when not casting', () => {
    expect(ghostCastSpeedTarget(false, MOVEMENT.ghostCastSpeedMultiplier)).toBe(1);
  });

  it('targets cast multiplier while casting', () => {
    expect(ghostCastSpeedTarget(true, MOVEMENT.ghostCastSpeedMultiplier)).toBe(
      MOVEMENT.ghostCastSpeedMultiplier,
    );
  });
});

describe('tickGhostSpeedMultiplier', () => {
  const castMultiplier = MOVEMENT.ghostCastSpeedMultiplier;
  const transitionMs = MOVEMENT.ghostCastSpeedTransitionMs;

  it('eases toward cast speed when casting starts', () => {
    const next = tickGhostSpeedMultiplier(1, true, castMultiplier, 100, transitionMs);
    expect(next).toBeGreaterThan(castMultiplier);
    expect(next).toBeLessThan(1);
  });

  it('eases back to full speed when casting ends', () => {
    const next = tickGhostSpeedMultiplier(castMultiplier, false, castMultiplier, 100, transitionMs);
    expect(next).toBeGreaterThan(castMultiplier);
    expect(next).toBeLessThan(1);
  });

  it('reaches cast target after the transition duration', () => {
    let multiplier = 1;
    for (let elapsed = 0; elapsed < transitionMs; elapsed += 50) {
      multiplier = tickGhostSpeedMultiplier(multiplier, true, castMultiplier, 50, transitionMs);
    }
    expect(multiplier).toBeCloseTo(castMultiplier, 5);
  });

  it('reaches full speed after the transition duration', () => {
    let multiplier: number = castMultiplier;
    for (let elapsed = 0; elapsed < transitionMs; elapsed += 50) {
      multiplier = tickGhostSpeedMultiplier(multiplier, false, castMultiplier, 50, transitionMs);
    }
    expect(multiplier).toBeCloseTo(1, 5);
  });
});

describe('ghostTravelSpeed', () => {
  it('applies the current speed multiplier', () => {
    expect(ghostTravelSpeed(MOVEMENT.ghostSpeed, MOVEMENT.ghostCastSpeedMultiplier)).toBe(
      MOVEMENT.ghostSpeed * MOVEMENT.ghostCastSpeedMultiplier,
    );
  });
});
