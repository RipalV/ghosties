import { describe, expect, it } from 'vitest';
import {
  clampToFloor,
  floorDistance,
  isOnFloor,
  nearestZoomStepIndex,
  resolveCameraZoom,
} from '../src/game/world/lobbyGeometry';
import { CAMERA, FLOOR, WORLD } from '../src/game/world/lobbyLayout';

describe('lobby floor geometry', () => {
  it('treats the floor centre and edge midpoints as on the floor', () => {
    expect(isOnFloor(FLOOR.centerX, FLOOR.centerY)).toBe(true);
    expect(isOnFloor(FLOOR.centerX - FLOOR.halfWidth, FLOOR.centerY)).toBe(true);
    expect(isOnFloor(FLOOR.centerX, FLOOR.centerY + FLOOR.halfHeight)).toBe(true);
  });

  it('rejects the corners of the bounding box, which fall outside the diamond', () => {
    const x = FLOOR.centerX - FLOOR.halfWidth * 0.8;
    const y = FLOOR.centerY - FLOOR.halfHeight * 0.8;
    expect(isOnFloor(x, y)).toBe(false);
  });

  it('leaves an inside position untouched', () => {
    const clamped = clampToFloor(FLOOR.centerX + 40, FLOOR.centerY - 20);
    expect(clamped).toEqual({ x: FLOOR.centerX + 40, y: FLOOR.centerY - 20 });
  });

  it('projects an outside position onto the playable diamond edge', () => {
    const clamped = clampToFloor(FLOOR.centerX + 4000, FLOOR.centerY + 4000);
    expect(floorDistance(clamped.x, clamped.y, FLOOR.playableInset)).toBeCloseTo(1, 6);
    expect(isOnFloor(clamped.x, clamped.y)).toBe(true);
  });

  it('keeps the clamped position inside the drawn floor for every direction', () => {
    const directions = [
      { x: -5000, y: 0 },
      { x: 5000, y: 0 },
      { x: 0, y: -5000 },
      { x: 0, y: 5000 },
      { x: -3000, y: 2000 },
      { x: 2500, y: -1800 },
    ];

    for (const direction of directions) {
      const clamped = clampToFloor(FLOOR.centerX + direction.x, FLOOR.centerY + direction.y);
      expect(floorDistance(clamped.x, clamped.y)).toBeLessThanOrEqual(FLOOR.playableInset + 1e-9);
    }
  });
});

describe('camera zoom resolution', () => {
  it('shows a constant slice of world height across viewport sizes', () => {
    const short = resolveCameraZoom(892, 412, 1);
    const tall = resolveCameraZoom(1440, 780, 1);

    expect(412 / short).toBeCloseTo(CAMERA.targetWorldHeight, 6);
    expect(780 / tall).toBeCloseTo(CAMERA.targetWorldHeight, 6);
  });

  it('never lets any zoom step show more than the world contains', () => {
    const viewports = [
      { width: 892, height: 412 },
      { width: 2560, height: 1080 },
      { width: 1024, height: 768 },
    ];

    for (const viewport of viewports) {
      for (const step of CAMERA.zoomSteps) {
        const zoom = resolveCameraZoom(viewport.width, viewport.height, step);
        expect(viewport.width / zoom).toBeLessThanOrEqual(WORLD.width + 1e-6);
        expect(viewport.height / zoom).toBeLessThanOrEqual(WORLD.height + 1e-6);
      }
    }
  });

  it('zooms in further than the base step when asked', () => {
    const base = resolveCameraZoom(892, 412, 1);
    const closer = resolveCameraZoom(892, 412, CAMERA.zoomSteps[0]);
    expect(closer).toBeGreaterThan(base);
  });

  it('snaps a freeform pinch scale to the nearest configured step', () => {
    expect(nearestZoomStepIndex(1.24)).toBe(0);
    expect(nearestZoomStepIndex(1.02)).toBe(1);
    expect(nearestZoomStepIndex(0.7)).toBe(2);
  });
});
