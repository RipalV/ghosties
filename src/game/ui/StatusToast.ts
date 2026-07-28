import Phaser from 'phaser';
import { PALETTE } from '../visuals/lobbyTheme';
import { drawRoundedPanel } from './hudDraw';

const VISIBLE_MS = 3200;

/**
 * Transient status feedback. Messages explain what happened and then clear
 * themselves, so no permanent full-width strip is needed.
 */
export class StatusToast extends Phaser.GameObjects.Container {
  private readonly plate: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private hideEvent?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, private readonly uiScale: number) {
    super(scene, 0, 0);

    this.plate = scene.add.graphics();
    this.label = scene.add
      .text(0, 0, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: `${Math.round(15 * uiScale)}px`,
        color: '#fff7cf',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add([this.plate, this.label]);
    this.setAlpha(0);
    scene.add.existing(this);
  }

  setWrapWidth(width: number): void {
    this.label.setWordWrapWidth(width);
    this.redraw();
  }

  show(message: string): void {
    this.label.setText(message);
    this.redraw();

    this.hideEvent?.remove();
    this.scene.tweens.killTweensOf(this);
    this.setAlpha(1);

    this.hideEvent = this.scene.time.delayedCall(VISIBLE_MS, () => {
      this.scene.tweens.add({ targets: this, alpha: 0, duration: 420, ease: 'Sine.In' });
    });
  }

  private redraw(): void {
    const paddingX = 14 * this.uiScale;
    const paddingY = 8 * this.uiScale;
    const width = this.label.width + paddingX * 2;
    const height = this.label.height + paddingY * 2;

    this.plate.clear();
    drawRoundedPanel(this.plate, -width / 2, -height / 2, width, height, 12 * this.uiScale, {
      fill: PALETTE.hudPanelStrong,
      fillAlpha: 0.92,
    });
    this.setSize(width, height);
  }
}
