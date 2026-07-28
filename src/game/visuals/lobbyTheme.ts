/** Storybook haunted-hotel visual configuration — presentation only. */

export const ROOM = {
  width: 960,
  height: 600,
  playMinX: 90,
  playMaxX: 870,
  playMinY: 120,
  playMaxY: 470,
} as const;

export const PALETTE = {
  nightSky: 0x1a1430,
  wall: 0x3a2a52,
  wallTrim: 0x6f5a8f,
  wallpaperAccent: 0x4a3668,
  floorDark: 0x3a2a3f,
  floorLight: 0x4a3850,
  floorLine: 0x6a5578,
  wood: 0x6b4a3a,
  woodLight: 0x8a6550,
  sofa: 0x7a4a68,
  sofaTrim: 0xc48aaa,
  piano: 0x4a3558,
  pianoKeys: 0xf5e6c8,
  chair: 0x6a4a4a,
  reception: 0x4a556e,
  receptionTrim: 0x9aacd0,
  lampWarm: 0xffc878,
  moonlight: 0xa8c4ff,
  ghostBody: 0xb8f2ff,
  ghostStroke: 0xe9fcff,
  ghostGlow: 0x7ad7ff,
  noraSkin: 0xf6c57b,
  noraDress: 0xd4789a,
  noraTrim: 0x5b315e,
  hudPanel: 0x241836,
  hudStroke: 0x8a78c0,
  hudText: 0xfff7cf,
  hudMuted: 0xd8cef7,
  status: 0xfff7cf,
} as const;

export interface LobbyPropDefinition {
  readonly id: string;
  readonly kind: 'sofa' | 'piano' | 'chair' | 'reception' | 'lamp' | 'plant' | 'painting';
  readonly x: number;
  readonly y: number;
  readonly label: string;
}

export const LOBBY_PROPS: readonly LobbyPropDefinition[] = [
  { id: 'sofa', kind: 'sofa', x: 250, y: 185, label: 'Sofa' },
  { id: 'piano', kind: 'piano', x: 730, y: 180, label: 'Piano' },
  { id: 'painting', kind: 'painting', x: 480, y: 95, label: '' },
  { id: 'lamp-left', kind: 'lamp', x: 150, y: 210, label: '' },
  { id: 'lamp-right', kind: 'lamp', x: 820, y: 230, label: '' },
  { id: 'plant', kind: 'plant', x: 880, y: 380, label: '' },
  { id: 'reception', kind: 'reception', x: 280, y: 405, label: 'Desk' },
  { id: 'chair', kind: 'chair', x: 750, y: 410, label: 'Chair' },
] as const;

export const HUD_LAYOUT = {
  leftX: 24,
  rightX: 936,
  topY: 16,
  statusY: 478,
  abilityY: 548,
  abilityStartX: 150,
  abilityGap: 220,
  abilityWidth: 200,
  abilityHeight: 72,
  minTouchPx: 44,
} as const;
