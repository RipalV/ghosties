import Phaser from 'phaser';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';
import { drawRoundedPanel, hudFont } from './hudDraw';

/**
 * A top-edge pill pairing a round icon with a value, anchored at its left edge
 * and vertical centre. The icon glyph plus the value text mean the chip never
 * relies on colour to be understood.
 */
export class HudChip extends Phaser.GameObjects.Container {
  /** Layout width in game pixels; do not use Container.setSize (breaks sibling layout packing). */
  chipWidth = 0;

  private readonly plate: Phaser.GameObjects.Graphics;
  private readonly value: Phaser.GameObjects.Text;
  private readonly chipHeight: number;
  private readonly iconRadius: number;
  private readonly gap: number;

  constructor(scene: Phaser.Scene, glyph: string, initialValue: string, private readonly uiScale: number) {
    super(scene, 0, 0);

    this.chipHeight = HUD_LAYOUT.chipHeight * uiScale;
    this.iconRadius = HUD_LAYOUT.chipIconRadius * uiScale;
    this.gap = 6 * uiScale;

    this.plate = scene.add.graphics();

    const iconCircle = scene.add.circle(this.chipHeight / 2, 0, this.iconRadius, PALETTE.hudAccent, 1);
    const icon = scene.add.text(this.chipHeight / 2, 0, glyph, hudFont(15 * uiScale)).setOrigin(0.5);
    this.value = scene.add
      .text(this.chipHeight / 2 + this.iconRadius + this.gap, 0, initialValue, hudFont(15 * uiScale, '#fff7cf', true))
      .setOrigin(0, 0.5);

    this.add([this.plate, iconCircle, icon, this.value]);
    this.redraw();
    scene.add.existing(this);
  }

  setValue(text: string): void {
    if (this.value.text === text) return;
    this.value.setText(text);
    this.redraw();
  }

  private redraw(): void {
    const contentWidth =
      this.chipHeight / 2 + this.iconRadius + this.gap + this.value.width + HUD_LAYOUT.chipPaddingX * this.uiScale;
    this.chipWidth = Math.max(this.chipHeight * 2, contentWidth);

    this.plate.clear();
    drawRoundedPanel(this.plate, 0, -this.chipHeight / 2, this.chipWidth, this.chipHeight, this.chipHeight / 2);
  }
}
