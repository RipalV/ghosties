import { CAMERA, FLOOR, WORLD } from './lobbyLayout';

export interface WorldPoint {
  readonly x: number;
  readonly y: number;
}

function radii(inset: number): { halfWidth: number; halfHeight: number } {
  return {
    halfWidth: FLOOR.halfWidth * inset,
    halfHeight: FLOOR.halfHeight * inset,
  };
}

/** Normalised diamond distance: 0 at the centre, 1 on the edge, above 1 outside. */
export function floorDistance(x: number, y: number, inset = 1): number {
  const { halfWidth, halfHeight } = radii(inset);
  return Math.abs(x - FLOOR.centerX) / halfWidth + Math.abs(y - FLOOR.centerY) / halfHeight;
}

export function isOnFloor(x: number, y: number, inset = 1): boolean {
  return floorDistance(x, y, inset) <= 1;
}

/**
 * Keeps a position on the isometric floor by projecting it back onto the
 * diamond edge along the ray from the floor centre.
 */
export function clampToFloor(x: number, y: number, inset = FLOOR.playableInset): WorldPoint {
  const { halfWidth, halfHeight } = radii(inset);
  const dx = (x - FLOOR.centerX) / halfWidth;
  const dy = (y - FLOOR.centerY) / halfHeight;
  const distance = Math.abs(dx) + Math.abs(dy);

  if (distance <= 1 || distance === 0) return { x, y };

  return {
    x: FLOOR.centerX + (dx / distance) * halfWidth,
    y: FLOOR.centerY + (dy / distance) * halfHeight,
  };
}

/** The four diamond corners, useful for drawing and for camera framing. */
export function floorCorners(inset = 1): readonly WorldPoint[] {
  const { halfWidth, halfHeight } = radii(inset);
  return [
    { x: FLOOR.centerX - halfWidth, y: FLOOR.centerY },
    { x: FLOOR.centerX, y: FLOOR.centerY - halfHeight },
    { x: FLOOR.centerX + halfWidth, y: FLOOR.centerY },
    { x: FLOOR.centerX, y: FLOOR.centerY + halfHeight },
  ];
}

/**
 * Camera zoom for a viewport measured in render pixels. The base zoom keeps a
 * constant slice of world height visible; the result is clamped so the view can
 * never extend past the world bounds.
 */
export function resolveCameraZoom(
  viewportWidth: number,
  viewportHeight: number,
  stepMultiplier: number,
): number {
  const base = viewportHeight / CAMERA.targetWorldHeight;
  const smallestAllowed = Math.max(viewportWidth / WORLD.width, viewportHeight / WORLD.height);
  return Math.max(base * stepMultiplier, smallestAllowed);
}

export function clampZoomStepIndex(index: number): number {
  return Math.min(Math.max(index, 0), CAMERA.zoomSteps.length - 1);
}

/** Picks the zoom step whose multiplier is closest to a freeform pinch scale. */
export function nearestZoomStepIndex(multiplier: number): number {
  let nearest = 0;
  let smallestGap = Number.POSITIVE_INFINITY;

  CAMERA.zoomSteps.forEach((step, index) => {
    const gap = Math.abs(step - multiplier);
    if (gap < smallestGap) {
      smallestGap = gap;
      nearest = index;
    }
  });

  return nearest;
}
