/** Target travel multiplier while casting (slow) vs idle movement (1). */
export function ghostCastSpeedTarget(isCasting: boolean, castSpeedMultiplier: number): number {
  return isCasting ? castSpeedMultiplier : 1;
}

/**
 * Ease the ghost's travel multiplier toward the cast or normal target so speed
 * does not snap when a scare starts or finishes.
 */
export function tickGhostSpeedMultiplier(
  currentMultiplier: number,
  isCasting: boolean,
  castSpeedMultiplier: number,
  deltaMs: number,
  transitionMs: number,
): number {
  const target = ghostCastSpeedTarget(isCasting, castSpeedMultiplier);
  if (transitionMs <= 0 || currentMultiplier === target) return target;

  const delta = target - currentMultiplier;
  const maxStep = (Math.abs(1 - castSpeedMultiplier) / transitionMs) * deltaMs;
  if (Math.abs(delta) <= maxStep) return target;
  return currentMultiplier + Math.sign(delta) * maxStep;
}

/** Effective ghost travel speed from base speed and the current multiplier. */
export function ghostTravelSpeed(baseSpeed: number, speedMultiplier: number): number {
  return baseSpeed * speedMultiplier;
}
