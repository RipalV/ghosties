import Phaser from 'phaser';
import type { ScareAbility } from '../abilities/ScareAbility';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';
import { drawRoundedPanel, hudFont } from './hudDraw';

/**
 * One square tile in the scare action grid. Hit-testing is owned by GameHud in
 * screen space (UI camera), not Phaser's interactive system — the world camera
 * zoom would otherwise misalign hit targets.
 */
export class ActionButton extends Phaser.GameObjects.Container {
  readonly ability: ScareAbility;
  readonly size: number;

  private readonly plate: Phaser.GameObjects.Graphics;
  private readonly lock: Phaser.GameObjects.Text;
  private readonly onActivate: () => void;
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
    this.onActivate = onActivate;
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
    // Do not call setSize — on Containers it shifts displayOrigin and misaligns hits.
    scene.add.existing(this);
  }

  containsPoint(x: number, y: number, pad = 0): boolean {
    const half = this.size / 2 + pad;
    return x >= this.x - half && x <= this.x + half && y >= this.y - half && y <= this.y + half;
  }

  press(): void {
    this.flashSelected();
    this.onActivate();
  }

  setAffordable(affordable: boolean): void {
    if (this.affordable === affordable) return;
    this.affordable = affordable;
    this.lock.setVisible(!affordable);
    this.redraw(false);
    this.setAlpha(affordable ? 1 : 0.55);
  }

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
