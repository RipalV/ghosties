import Phaser from 'phaser';
import type { ScareAbility } from '../abilities/ScareAbility';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';

export class AbilityButton extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    ability: ScareAbility,
    shortcut: string,
    onActivate: () => void,
  ) {
    super(scene, x, y);

    const width = HUD_LAYOUT.abilityWidth;
    const height = HUD_LAYOUT.abilityHeight;
    const hitPad = 6;

    const background = scene.add.rectangle(0, 0, width, height, PALETTE.hudPanel, 0.94)
      .setStrokeStyle(3, PALETTE.hudStroke, 1)
      .setInteractive({
        hitArea: new Phaser.Geom.Rectangle(
          -width / 2 - hitPad,
          -height / 2 - hitPad,
          width + hitPad * 2,
          height + hitPad * 2,
        ),
        hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        useHandCursor: true,
      });

    const icon = scene.add.text(-width / 2 + 28, 0, ability.emoji, { fontSize: '28px' }).setOrigin(0.5);
    const title = scene.add.text(-width / 2 + 54, -14, ability.name, {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    const detail = scene.add.text(-width / 2 + 54, 10, `${shortcut} · ${ability.energyCost} energy`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '13px',
      color: '#cfc5f4',
    });

    background.on('pointerover', () => background.setFillStyle(0x44366f, 1));
    background.on('pointerout', () => background.setFillStyle(PALETTE.hudPanel, 0.94));
    background.on('pointerdown', () => {
      background.setScale(0.97);
      onActivate();
    });
    background.on('pointerup', () => background.setScale(1));

    this.add([background, icon, title, detail]);
    this.setDepth(110);
    scene.add.existing(this);
  }
}
