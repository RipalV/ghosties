import Phaser from 'phaser';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';
import { drawRoundedPanel, hudFont } from './hudDraw';

/**
 * The bottom-corner card identifying whose actions the grid belongs to: a round
 * portrait with the character's name above it.
 */
export class CharacterCard extends Phaser.GameObjects.Container {
  readonly radius: number;

  constructor(scene: Phaser.Scene, glyph: string, name: string, uiScale: number) {
    super(scene, 0, 0);
    this.radius = HUD_LAYOUT.cardRadius * uiScale;

    const plate = scene.add.graphics();
    plate.fillStyle(PALETTE.hudPanelStrong, 0.92);
    plate.fillCircle(0, 0, this.radius);
    plate.lineStyle(3, PALETTE.hudStroke, 1);
    plate.strokeCircle(0, 0, this.radius);

    const portrait = scene.add.text(0, 0, glyph, hudFont(this.radius * 1.05)).setOrigin(0.5);

    const namePlate = scene.add.graphics();
    const label = scene.add
      .text(0, -this.radius - 14 * uiScale, name, hudFont(12 * uiScale, '#fff7cf', true))
      .setOrigin(0.5);
    const labelWidth = label.width + 14 * uiScale;
    const labelHeight = 20 * uiScale;
    drawRoundedPanel(
      namePlate,
      -labelWidth / 2,
      -this.radius - 14 * uiScale - labelHeight / 2,
      labelWidth,
      labelHeight,
      labelHeight / 2,
    );

    this.add([plate, portrait, namePlate, label]);
    scene.add.existing(this);
  }
}
