import type { WorldPoint } from './types';

export function worldDistance(a: WorldPoint, b: WorldPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

export function isWithinRadius(
  point: WorldPoint,
  centre: WorldPoint,
  radius: number,
): boolean {
  return worldDistance(point, centre) <= radius;
}
