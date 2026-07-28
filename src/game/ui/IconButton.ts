import Phaser from 'phaser';
import { PALETTE } from '../visuals/lobbyTheme';
import { drawRoundedPanel, hudFont } from './hudDraw';

/**
 * A square glyph button used for the objective and the zoom steps. The optional
 * notification marker is a shape carrying an exclamation mark, so it is visible
 * without depending on colour.
 */
export class IconButton extends Phaser.GameObjects.Container {
  private readonly plate: Phaser.GameObjects.Graphics;
  private readonly marker: Phaser.GameObjects.Container;
  private readonly buttonSize: number;
  private enabled = true;

  constructor(
    scene: Phaser.Scene,
    glyph: string,
    size: number,
    private readonly uiScale: number,
    onActivate: () => void,
  ) {
    super(scene, 0, 0);
    this.buttonSize = size;

    this.plate = scene.add.graphics();
    const label = scene.add.text(0, 0, glyph, hudFont(size * 0.42)).setOrigin(0.5);

    const markerCircle = scene.add.circle(0, 0, 8 * uiScale, PALETTE.hudWarn, 1);
    const markerGlyph = scene.add.text(0, 0, '!', hudFont(11 * uiScale, '#241632', true)).setOrigin(0.5);
    this.marker = scene.add
      .container(size / 2 - 4 * uiScale, -size / 2 + 4 * uiScale, [markerCircle, markerGlyph])
      .setVisible(false);

    this.add([this.plate, label, this.marker]);
    this.redraw();

    const padding = 6 * uiScale;
    this.setSize(size, size).setInteractive({
      hitArea: new Phaser.Geom.Rectangle(
        -size / 2 - padding,
        -size / 2 - padding,
        size + padding * 2,
        size + padding * 2,
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    this.on('pointerdown', () => {
      if (!this.enabled) return;
      this.setScale(0.94);
      onActivate();
    });
    this.on('pointerup', () => this.setScale(1));
    this.on('pointerout', () => this.setScale(1));

    scene.add.existing(this);
  }

  setNotification(show: boolean): void {
    this.marker.setVisible(show);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.45);
  }

  private redraw(): void {
    this.plate.clear();
    drawRoundedPanel(
      this.plate,
      -this.buttonSize / 2,
      -this.buttonSize / 2,
      this.buttonSize,
      this.buttonSize,
      12 * this.uiScale,
    );
  }
}
