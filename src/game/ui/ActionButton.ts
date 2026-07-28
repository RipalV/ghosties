import Phaser from 'phaser';
import type { ScareAbility } from '../abilities/ScareAbility';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';
import { drawRoundedPanel, hudFont } from './hudDraw';

/**
 * One square tile in the scare action grid. It shows the ability icon, its
 * keyboard shortcut, and its energy cost, and marks itself unavailable with a
 * dimmed plate plus a lock glyph rather than by colour alone.
 */
export class ActionButton extends Phaser.GameObjects.Container {
  readonly ability: ScareAbility;

  private readonly plate: Phaser.GameObjects.Graphics;
  private readonly lock: Phaser.GameObjects.Text;
  private readonly size: number;
  private affordable = true;

  constructor(
    scene: Phaser.Scene,
    ability: ScareAbility,
    shortcut: string,
    private readonly uiScale: number,
    onActivate: () => void,
  ) {
    super(scene, 0, 0);
    this.ability = ability;
    this.size = HUD_LAYOUT.actionSize * uiScale;

    const half = this.size / 2;
    this.plate = scene.add.graphics();

    const icon = scene.add.text(0, -4 * uiScale, ability.emoji, hudFont(25 * uiScale)).setOrigin(0.5);
    const shortcutLabel = scene.add
      .text(-half + 6 * uiScale, -half + 4 * uiScale, shortcut, hudFont(11 * uiScale, '#d8cef7'))
      .setOrigin(0, 0);

    const costCircle = scene.add.circle(half - 12 * uiScale, half - 11 * uiScale, 10 * uiScale, PALETTE.hudAccent, 1);
    const costLabel = scene.add
      .text(half - 12 * uiScale, half - 11 * uiScale, String(ability.energyCost), hudFont(11 * uiScale, '#fff7cf', true))
      .setOrigin(0.5);

    this.lock = scene.add.text(0, 0, '🚫', hudFont(28 * uiScale)).setOrigin(0.5).setVisible(false);

    this.add([this.plate, icon, shortcutLabel, costCircle, costLabel, this.lock]);
    this.redraw(false);

    const padding = 4 * uiScale;
    this.setSize(this.size, this.size).setInteractive({
      hitArea: new Phaser.Geom.Rectangle(
        -half - padding,
        -half - padding,
        this.size + padding * 2,
        this.size + padding * 2,
      ),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    this.on('pointerdown', () => {
      this.flashSelected();
      onActivate();
    });

    scene.add.existing(this);
  }

  setAffordable(affordable: boolean): void {
    if (this.affordable === affordable) return;
    this.affordable = affordable;
    this.lock.setVisible(!affordable);
    this.redraw(false);
    this.setAlpha(affordable ? 1 : 0.55);
  }

  /** Brief "selected" read after activation, as required for touch feedback. */
  flashSelected(): void {
    this.redraw(true);
    this.setScale(0.95);
    this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 160,
      ease: 'Sine.Out',
      onComplete: () => this.redraw(false),
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
  }
}
