import type Phaser from 'phaser';
import { PALETTE } from '../visuals/lobbyTheme';

export interface PanelStyle {
  readonly fill?: number;
  readonly fillAlpha?: number;
  readonly stroke?: number;
  readonly strokeWidth?: number;
  readonly strokeAlpha?: number;
}

/** Draws the rounded translucent plate shared by every floating HUD element. */
export function drawRoundedPanel(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  style: PanelStyle = {},
): void {
  const fill = style.fill ?? PALETTE.hudPanel;
  const fillAlpha = style.fillAlpha ?? 0.88;
  const stroke = style.stroke ?? PALETTE.hudStroke;
  const strokeWidth = style.strokeWidth ?? 2;
  const strokeAlpha = style.strokeAlpha ?? 0.9;

  graphics.fillStyle(fill, fillAlpha);
  graphics.fillRoundedRect(x, y, width, height, radius);

  if (strokeWidth > 0) {
    graphics.lineStyle(strokeWidth, stroke, strokeAlpha);
    graphics.strokeRoundedRect(x, y, width, height, radius);
  }
}

export function hudFont(sizePx: number, color = '#fff7cf', bold = false): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Trebuchet MS',
    fontSize: `${Math.round(sizePx)}px`,
    color,
    fontStyle: bold ? 'bold' : 'normal',
  };
}
