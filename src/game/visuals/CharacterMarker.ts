import Phaser from 'phaser';
import { PALETTE } from './lobbyTheme';

const BAR_WIDTH = 58;
const BAR_HEIGHT = 7;
const PANEL_HEIGHT = 22;

/**
 * A small floating badge above a character's head, optionally with a slim
 * state bar. State is always spelled out in text as well as shown by the bar,
 * so it never depends on colour alone.
 */
export class CharacterMarker extends Phaser.GameObjects.Container {
  private readonly label: Phaser.GameObjects.Text;
  private readonly panel: Phaser.GameObjects.Rectangle;
  private readonly barTrack?: Phaser.GameObjects.Rectangle;
  private readonly barFill?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, offsetY: number, initialLabel: string, withBar: boolean) {
    super(scene, 0, offsetY);

    this.panel = scene.add.rectangle(0, 0, 80, PANEL_HEIGHT, PALETTE.hudPanelStrong, 0.9)
      .setStrokeStyle(2, PALETTE.hudStroke, 0.9);
    this.label = scene.add.text(0, 0, initialLabel, {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#fff7cf',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add([this.panel, this.label]);

    if (withBar) {
      this.barTrack = scene.add.rectangle(0, 18, BAR_WIDTH, BAR_HEIGHT, PALETTE.hudAccent, 0.95)
        .setStrokeStyle(2, PALETTE.hudStroke, 0.8);
      this.barFill = scene.add.rectangle(-BAR_WIDTH / 2 + 2, 18, 0, BAR_HEIGHT - 3, PALETTE.hudText, 1)
        .setOrigin(0, 0.5);
      this.add([this.barTrack, this.barFill]);
    }

    this.resizePanel();
    scene.add.existing(this);
  }

  setLabel(text: string): void {
    this.label.setText(text);
    this.resizePanel();
  }

  /** `ratio` is clamped to 0..1. */
  setBarRatio(ratio: number): void {
    if (!this.barFill) return;
    const clamped = Phaser.Math.Clamp(ratio, 0, 1);
    this.barFill.setDisplaySize((BAR_WIDTH - 4) * clamped, BAR_HEIGHT - 3);
  }

  private resizePanel(): void {
    this.panel.setSize(Math.max(60, this.label.width + 16), PANEL_HEIGHT);
  }
}
