/**
 * Spatial layout of the lobby in fixed world units.
 *
 * These values are deliberately independent of the viewport: ability ranges,
 * NPC routes, and movement clamps are all expressed here so they behave
 * identically on every device.
 */

export const WORLD = {
  width: 1760,
  height: 880,
} as const;

/**
 * The floor is an isometric diamond centred in the world. A point is on the
 * floor when |dx| / halfWidth + |dy| / halfHeight <= 1.
 */
export const FLOOR = {
  centerX: 880,
  centerY: 500,
  halfWidth: 700,
  halfHeight: 320,
  /** Characters stay inside this fraction of the diamond so they never cross a wall. */
  playableInset: 0.9,
  tileWidth: 116,
  tileHeight: 53,
} as const;

export const WALL = {
  height: 150,
  baseboardHeight: 14,
} as const;

export const CAMERA = {
  /** Base zoom always shows this much world height, whatever the viewport. */
  targetWorldHeight: 560,
  /** Multipliers applied to the base zoom; index 1 is the default. */
  zoomSteps: [1.3, 1, 0.8],
  defaultZoomStepIndex: 1,
  followLerp: 0.09,
  /** Deadzone as a fraction of the visible view, keeping the ghost clear of HUD corners. */
  deadzoneWidthFraction: 0.34,
  deadzoneHeightFraction: 0.3,
} as const;

export const GHOST_START = { x: 700, y: 520 } as const;

/** Nora's routine stays near the middle of the lobby so she is usually in view. */
export const NORA_ROUTE = [
  { x: 760, y: 430 },
  { x: 1080, y: 400 },
  { x: 1180, y: 560 },
  { x: 820, y: 600 },
] as const;

export const MOVEMENT = {
  /** Raised alongside the larger lobby so crossing it stays brisk (design decision 3). */
  ghostSpeed: 300,
  npcSpeed: 70,
} as const;
