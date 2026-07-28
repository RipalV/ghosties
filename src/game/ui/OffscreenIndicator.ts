import Phaser from 'phaser';
import { PALETTE } from '../visuals/lobbyTheme';
import { drawRoundedPanel, hudFont } from './hudDraw';

const COMPASS = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'] as const;

export interface ScreenBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/**
 * Edge marker that keeps a character findable when the camera has left them
 * behind: it names them, points at them, and reports how far away they are.
 */
export class OffscreenIndicator extends Phaser.GameObjects.Container {
  private readonly plate: Phaser.GameObjects.Graphics;
  private readonly arrow: Phaser.GameObjects.Text;
  private readonly label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, name: string, private readonly uiScale: number) {
    super(scene, 0, 0);

    this.plate = scene.add.graphics();
    this.arrow = scene.add.text(0, 0, COMPASS[0], hudFont(17 * uiScale, '#fff7cf', true)).setOrigin(0.5);
    this.label = scene.add.text(0, 0, name, hudFont(13 * uiScale)).setOrigin(0, 0.5);

    this.add([this.plate, this.arrow, this.label]);
    this.setVisible(false);
    scene.add.existing(this);
  }

  hide(): void {
    this.setVisible(false);
  }

  /**
   * Points from the view centre toward a target that sits outside the view,
   * parking the marker on the nearest edge inside `bounds`.
   */
  pointAt(
    from: { x: number; y: number },
    to: { x: number; y: number },
    distanceLabel: string,
    bounds: ScreenBounds,
  ): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    const stepX = dx === 0 ? Number.POSITIVE_INFINITY : (dx > 0 ? bounds.right - from.x : bounds.left - from.x) / dx;
    const stepY = dy === 0 ? Number.POSITIVE_INFINITY : (dy > 0 ? bounds.bottom - from.y : bounds.top - from.y) / dy;
    const step = Math.max(0, Math.min(stepX, stepY, 1));

    const compassIndex = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
    const glyph = COMPASS[compassIndex];

    // Only rebuild the plate when the text changes; this runs every frame.
    if (glyph !== this.arrow.text || distanceLabel !== this.label.text) {
      this.arrow.setText(glyph);
      this.label.setText(distanceLabel);
      this.redraw();
    }

    this.setPosition(
      Phaser.Math.Clamp(from.x + dx * step, bounds.left, bounds.right),
      Phaser.Math.Clamp(from.y + dy * step, bounds.top, bounds.bottom),
    );
    this.setVisible(true);
  }

  private redraw(): void {
    const height = 30 * this.uiScale;
    const paddingX = 10 * this.uiScale;
    const arrowX = -1 * this.uiScale;
    const width = paddingX * 2 + this.arrow.width + 6 * this.uiScale + this.label.width;

    this.arrow.setX(-width / 2 + paddingX + this.arrow.width / 2 + arrowX);
    this.label.setX(this.arrow.x + this.arrow.width / 2 + 6 * this.uiScale);

    this.plate.clear();
    drawRoundedPanel(this.plate, -width / 2, -height / 2, width, height, height / 2, {
      fill: PALETTE.hudPanelStrong,
      fillAlpha: 0.94,
    });
    this.setSize(width, height);
  }
}
