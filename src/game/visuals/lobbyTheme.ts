/** Storybook haunted-hotel visual configuration — presentation only. */

export const PALETTE = {
  nightSky: 0x141130,
  moon: 0xf2f4ff,
  lawn: 0x2c4a3c,
  lawnLight: 0x35573f,
  path: 0x5d5a6e,
  pathLight: 0x726d84,
  hedge: 0x27452f,
  fence: 0x4a4463,
  fenceLight: 0x6b628a,
  treeTrunk: 0x4a3a30,
  treeDark: 0x22452f,
  treeLight: 0x2f5c3c,

  wallLeft: 0x33254a,
  wallRight: 0x3f2f5a,
  wallTrim: 0x6f5a8f,
  wallpaperAccent: 0x4a3668,
  baseboard: 0x6b4a3a,

  floorDark: 0x3a2a3f,
  floorLight: 0x4a3850,
  floorLine: 0x6a5578,
  rug: 0x6b3350,
  rugTrim: 0xc48aaa,

  wood: 0x6b4a3a,
  woodLight: 0x8a6550,
  sofa: 0x7a4a68,
  piano: 0x3d2c4c,
  pianoKeys: 0xf5e6c8,
  chair: 0x6a4a4a,
  reception: 0x4a556e,
  brass: 0xc9a34e,
  clock: 0x53392c,
  trolley: 0x50506b,
  plantPot: 0x7c4a38,
  plantLeaf: 0x3f7a4e,

  lampWarm: 0xffc878,
  moonlight: 0xa8c4ff,

  ghostBody: 0xb8f2ff,
  ghostStroke: 0xe9fcff,
  ghostGlow: 0x7ad7ff,
  noraSkin: 0xf6c57b,
  noraDress: 0xd4789a,
  noraTrim: 0x5b315e,

  hudPanel: 0x241836,
  hudPanelStrong: 0x1b1128,
  hudStroke: 0x8a78c0,
  hudAccent: 0x4a3a7a,
  hudText: 0xfff7cf,
  hudMuted: 0xd8cef7,
  hudWarn: 0xffb066,
} as const;

/** Shading factors that give every volume a single consistent light direction. */
export const SHADING = {
  top: 1.16,
  left: 0.68,
  right: 0.88,
  shadowAlpha: 0.26,
} as const;

export type LobbyPropKind =
  | 'reception'
  | 'sofa'
  | 'armchair'
  | 'piano'
  | 'table'
  | 'clock'
  | 'trolley'
  | 'plant'
  | 'lamp'
  | 'rug';

export interface LobbyPropDefinition {
  readonly id: string;
  readonly kind: LobbyPropKind;
  readonly x: number;
  readonly y: number;
}

/**
 * Props are recognised by silhouette, so no definition carries a text label.
 * Positions are world units and all sit inside the floor diamond.
 */
export const LOBBY_PROPS: readonly LobbyPropDefinition[] = [
  { id: 'rug', kind: 'rug', x: 880, y: 530 },
  { id: 'reception', kind: 'reception', x: 520, y: 400 },
  { id: 'sofa', kind: 'sofa', x: 700, y: 330 },
  { id: 'piano', kind: 'piano', x: 1120, y: 360 },
  { id: 'clock', kind: 'clock', x: 1000, y: 280 },
  { id: 'armchair', kind: 'armchair', x: 1320, y: 500 },
  { id: 'table', kind: 'table', x: 880, y: 740 },
  { id: 'trolley', kind: 'trolley', x: 620, y: 640 },
  { id: 'plant-left', kind: 'plant', x: 330, y: 500 },
  { id: 'plant-right', kind: 'plant', x: 1430, y: 500 },
  { id: 'lamp-left', kind: 'lamp', x: 620, y: 380 },
  { id: 'lamp-right', kind: 'lamp', x: 1260, y: 420 },
] as const;

export interface ExteriorTree {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

export const EXTERIOR = {
  /** The lot boundary is a diamond slightly larger than the floor. */
  lotInset: 1.14,
  hedgeThickness: 16,
  pathWidth: 90,
  trees: [
    { x: 210, y: 300, scale: 1 },
    { x: 1560, y: 320, scale: 0.9 },
    { x: 320, y: 720, scale: 0.75 },
    { x: 1470, y: 730, scale: 0.8 },
  ] as readonly ExteriorTree[],
} as const;

/** HUD metrics in CSS pixels; multiplied by the render scale at layout time. */
export const HUD_LAYOUT = {
  padding: 12,
  chipHeight: 34,
  chipGap: 8,
  chipPaddingX: 10,
  chipIconRadius: 12,
  objectiveSize: 46,
  cardRadius: 26,
  actionSize: 60,
  actionGap: 10,
  zoomButtonSize: 44,
  minTouchPx: 44,
  toastMaxWidthFraction: 0.6,
} as const;
