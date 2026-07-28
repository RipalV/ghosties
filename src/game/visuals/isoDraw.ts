import type Phaser from 'phaser';
import { SHADING } from './lobbyTheme';

/**
 * Small isometric drawing helpers. Everything is plain 2D vector drawing that
 * evokes depth: a rhombus top face plus two side faces with a fixed light
 * direction. No 3D renderer or models are involved.
 */

export function shadeColor(color: number, factor: number): number {
  const red = Math.min(255, Math.round(((color >> 16) & 0xff) * factor));
  const green = Math.min(255, Math.round(((color >> 8) & 0xff) * factor));
  const blue = Math.min(255, Math.round((color & 0xff) * factor));
  return (red << 16) | (green << 8) | blue;
}

export interface IsoFootprint {
  /** Base centre in world units. */
  readonly x: number;
  readonly y: number;
  /** Diamond width along the x axis. */
  readonly width: number;
  /** Diamond depth along the y axis. */
  readonly depth: number;
}

/** Draws the flat isometric diamond of a footprint, offset upward by `lift`. */
export function fillIsoDiamond(
  graphics: Phaser.GameObjects.Graphics,
  footprint: IsoFootprint,
  color: number,
  alpha = 1,
  lift = 0,
): void {
  const { x, y, width, depth } = footprint;
  const top = y - lift;

  graphics.fillStyle(color, alpha);
  graphics.beginPath();
  graphics.moveTo(x - width / 2, top);
  graphics.lineTo(x, top - depth / 2);
  graphics.lineTo(x + width / 2, top);
  graphics.lineTo(x, top + depth / 2);
  graphics.closePath();
  graphics.fillPath();
}

export function strokeIsoDiamond(
  graphics: Phaser.GameObjects.Graphics,
  footprint: IsoFootprint,
  color: number,
  width = 2,
  alpha = 1,
  lift = 0,
): void {
  const { x, y, width: footWidth, depth } = footprint;
  const top = y - lift;

  graphics.lineStyle(width, color, alpha);
  graphics.beginPath();
  graphics.moveTo(x - footWidth / 2, top);
  graphics.lineTo(x, top - depth / 2);
  graphics.lineTo(x + footWidth / 2, top);
  graphics.lineTo(x, top + depth / 2);
  graphics.closePath();
  graphics.strokePath();
}

function fillQuad(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly [number, number][],
  color: number,
  alpha = 1,
): void {
  graphics.fillStyle(color, alpha);
  graphics.beginPath();
  graphics.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) {
    graphics.lineTo(points[index][0], points[index][1]);
  }
  graphics.closePath();
  graphics.fillPath();
}

export interface IsoBox extends IsoFootprint {
  readonly height: number;
  readonly color: number;
  /** Optional override for the top face colour, for example piano keys. */
  readonly topColor?: number;
  readonly alpha?: number;
}

/** Draws a solid isometric box: left face, right face, then top face. */
export function drawIsoBox(graphics: Phaser.GameObjects.Graphics, box: IsoBox): void {
  const { x, y, width, depth, height, color } = box;
  const alpha = box.alpha ?? 1;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  const leftX = x - halfWidth;
  const rightX = x + halfWidth;
  const frontY = y + halfDepth;

  fillQuad(
    graphics,
    [
      [leftX, y],
      [x, frontY],
      [x, frontY - height],
      [leftX, y - height],
    ],
    shadeColor(color, SHADING.left),
    alpha,
  );

  fillQuad(
    graphics,
    [
      [x, frontY],
      [rightX, y],
      [rightX, y - height],
      [x, frontY - height],
    ],
    shadeColor(color, SHADING.right),
    alpha,
  );

  fillIsoDiamond(
    graphics,
    { x, y, width, depth },
    box.topColor ?? shadeColor(color, SHADING.top),
    alpha,
    height,
  );
}

/**
 * A grid of recessed slots across a box's left face, following its skew. Used
 * for details that make a silhouette recognisable, such as a key rack.
 */
export function drawFaceSlots(
  graphics: Phaser.GameObjects.Graphics,
  box: IsoBox,
  columns: number,
  rows: number,
  color: number,
): void {
  const { x, y, width, depth, height } = box;
  const startX = x - width / 2;
  const runX = width / 2;
  const runY = depth / 2;

  const alongFace = (t: number): [number, number] => [startX + runX * t, y + runY * t];
  const rowHeight = height / (rows + 1);

  for (let column = 0; column < columns; column += 1) {
    const [nearX, nearY] = alongFace((column + 0.2) / columns);
    const [farX, farY] = alongFace((column + 0.8) / columns);

    for (let row = 0; row < rows; row += 1) {
      const base = rowHeight * (row + 0.7);
      const top = base + rowHeight * 0.55;
      fillQuad(
        graphics,
        [
          [nearX, nearY - base],
          [farX, farY - base],
          [farX, farY - top],
          [nearX, nearY - top],
        ],
        color,
        0.85,
      );
    }
  }
}

/** A soft contact shadow that anchors a prop or character to the floor. */
export function drawContactShadow(
  graphics: Phaser.GameObjects.Graphics,
  footprint: IsoFootprint,
  spread = 1.05,
): void {
  fillIsoDiamond(
    graphics,
    {
      x: footprint.x,
      y: footprint.y + footprint.depth * 0.08,
      width: footprint.width * spread,
      depth: footprint.depth * spread,
    },
    0x000000,
    SHADING.shadowAlpha,
  );
}

/**
 * Draws a wall as a vertical extrusion of one floor edge, so it shares the
 * floor's isometric skew.
 */
export function drawIsoWall(
  graphics: Phaser.GameObjects.Graphics,
  from: { x: number; y: number },
  to: { x: number; y: number },
  height: number,
  color: number,
): void {
  fillQuad(
    graphics,
    [
      [from.x, from.y],
      [to.x, to.y],
      [to.x, to.y - height],
      [from.x, from.y - height],
    ],
    color,
  );
}

/** Interpolates along a wall edge, for placing decorations that follow its skew. */
export function pointAlongEdge(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number,
): { x: number; y: number } {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}
