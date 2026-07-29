import Phaser from 'phaser';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';
import { drawRoundedPanel, hudFont } from './hudDraw';

/**
 * Dedicated Observe control. Hit-testing is owned by GameHud in screen space so
 * world-camera zoom cannot misalign the target with the drawn button.
 */
export class ObserveButton extends Phaser.GameObjects.Container {
  readonly size: number;

  private readonly plate: Phaser.GameObjects.Graphics;
  private readonly progressRing: Phaser.GameObjects.Graphics;
  private readonly outOfRangeMark: Phaser.GameObjects.Text;
  private readonly progressLabel: Phaser.GameObjects.Text;
  private readonly onActivate: () => void;
  private observing = false;
  private progress = 0;
  private enabled = true;

  constructor(
    scene: Phaser.Scene,
    private readonly uiScale: number,
    onActivate: () => void,
  ) {
    super(scene, 0, 0);
    this.onActivate = onActivate;
    this.size = HUD_LAYOUT.actionSize * uiScale;

    const half = this.size / 2;
    this.plate = scene.add.graphics();
    this.progressRing = scene.add.graphics();
    const icon = scene.add.text(0, -6 * uiScale, '👁', hudFont(22 * uiScale)).setOrigin(0.5);
    const shortcutLabel = scene.add
      .text(-half + 6 * uiScale, -half + 4 * uiScale, 'O', hudFont(11 * uiScale, '#d8cef7'))
      .setOrigin(0, 0);
    this.outOfRangeMark = scene.add
      .text(half - 8 * uiScale, -half + 6 * uiScale, '↔', hudFont(14 * uiScale, '#fff7cf', true))
      .setOrigin(0.5)
      .setVisible(false);
    this.progressLabel = scene.add
      .text(0, half - 12 * uiScale, '', hudFont(11 * uiScale, '#fff7cf', true))
      .setOrigin(0.5)
      .setVisible(false);

    this.add([this.plate, this.progressRing, icon, shortcutLabel, this.outOfRangeMark, this.progressLabel]);
    this.redraw(false);
    // Do not call setSize — on Containers it shifts displayOrigin and misaligns hits.
    scene.add.existing(this);
  }

  containsPoint(x: number, y: number, pad = 0): boolean {
    const half = this.size / 2 + pad;
    return x >= this.x - half && x <= this.x + half && y >= this.y - half && y <= this.y + half;
  }

  press(): void {
    if (!this.enabled) return;
    this.flashSelected();
    this.onActivate();
  }

  setObserveState(inRange: boolean, observing: boolean, progress: number): void {
    this.observing = observing;
    this.progress = progress;
    this.outOfRangeMark.setVisible(!inRange && !observing);
    this.progressLabel.setVisible(observing);
    if (observing) {
      this.progressLabel.setText(`${Math.round(progress * 100)}%`);
    }
    this.setAlpha(inRange || observing ? 1 : 0.65);
    this.redraw(observing);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  flashSelected(): void {
    this.redraw(true);
    this.setScale(0.95);
    this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 160,
      ease: 'Sine.Out',
      onComplete: () => this.redraw(this.observing),
    });
  }

  private redraw(selected: boolean): void {
    this.plate.clear();
    drawRoundedPanel(
      this.plate,
      -this.size / 2,
      -this.size / 2,
      this.size,
      this.size,
      14 * this.uiScale,
      {
        fill: selected ? PALETTE.hudAccent : PALETTE.hudPanel,
        fillAlpha: 0.94,
        strokeWidth: selected ? 4 : 2,
        strokeAlpha: selected ? 1 : 0.9,
      },
    );

    this.progressRing.clear();
    if (!this.observing || this.progress <= 0) return;

    const radius = this.size * 0.38;
    const start = Phaser.Math.DegToRad(-90);
    const end = start + Math.PI * 2 * this.progress;
    this.progressRing.lineStyle(5 * this.uiScale, PALETTE.hudAccent, 1);
    this.progressRing.beginPath();
    this.progressRing.arc(0, 0, radius, start, end, false);
    this.progressRing.strokePath();
  }
}
