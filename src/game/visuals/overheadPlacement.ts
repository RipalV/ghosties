/**
 * Placement rules for the badges and speech bubbles drawn above a character's
 * head. The camera can leave a character right under the top of the view or
 * behind the top HUD chips, so anything drawn above the head needs to be able
 * to move below it instead of being clipped.
 */

/** World units spanned by a CSS-pixel measurement at the current zoom levels. */
export function cssToWorldUnits(
  cssPixels: number,
  cameraZoom: number,
  renderZoom: number,
): number {
  return cssPixels / (cameraZoom * renderZoom);
}

/**
 * Whether a badge of `height` world units, drawn `aboveY` above the character,
 * still clears `clearance` world units below the top of the camera view.
 */
export function fitsAboveHead(
  characterY: number,
  aboveY: number,
  height: number,
  viewTop: number,
  clearance: number,
): boolean {
  return characterY + aboveY - height / 2 >= viewTop + clearance;
}
