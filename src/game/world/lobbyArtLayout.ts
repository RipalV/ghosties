import { WORLD } from './lobbyLayout';

/** Phaser texture key for the painted Crooked Moon lobby backdrop. */
export const LOBBY_ART_KEY = 'lobby-bg';

/** Served from Vite `public/`. */
export const LOBBY_ART_PATH = '/assets/lobby/crooked-moon-lobby.jpg';

/** Native pixel size of the upscaled lobby art asset (2× concept). */
export const LOBBY_ART_NATIVE = {
  width: 2048,
  height: 1244,
} as const;

export interface ArtTransform {
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly displayWidth: number;
  readonly displayHeight: number;
}

/** Cover-fit the art into the fixed world so the lobby fills the camera frame. */
export function lobbyArtTransform(): ArtTransform {
  const scale = Math.max(
    WORLD.width / LOBBY_ART_NATIVE.width,
    WORLD.height / LOBBY_ART_NATIVE.height,
  );
  const displayWidth = LOBBY_ART_NATIVE.width * scale;
  const displayHeight = LOBBY_ART_NATIVE.height * scale;
  return {
    scale,
    offsetX: (WORLD.width - displayWidth) / 2,
    offsetY: (WORLD.height - displayHeight) / 2,
    displayWidth,
    displayHeight,
  };
}

/** Map a point in native art pixels into world units. */
export function artPointToWorld(artX: number, artY: number): { x: number; y: number } {
  const { scale, offsetX, offsetY } = lobbyArtTransform();
  return {
    x: artX * scale + offsetX,
    y: artY * scale + offsetY,
  };
}

/**
 * Landmark spots in the upscaled concept art (native pixels).
 * Door and stairs are the only visitor entry portals — never mid-lobby spawns.
 * Labels match design callouts and are never drawn in-game.
 */
export const LOBBY_ART_SPOTS = {
  /** Front hotel doors — Nora’s arrival portal. */
  door: { x: 380, y: 360 },
  /** Just inside the doors (playable floor). */
  doorLanding: { x: 460, y: 430 },
  /** Grand staircase — Milo’s arrival portal. */
  stairs: { x: 1780, y: 720 },
  /** Stair foot landing (playable floor). */
  stairsLanding: { x: 1680, y: 780 },
  /** Reception service bell — Object Nudge. */
  receptionBell: { x: 580, y: 496 },
  /** Floor under the crooked portrait / sofa — Whisper. */
  crookedPortrait: { x: 1160, y: 620 },
  /** Drafty fireplace hearth — Cold Puff. */
  draftyFireplace: { x: 1610, y: 580 },
  /** Rug centre — open haunt floor. */
  rugCentre: { x: 1020, y: 720 },
} as const;
