import Phaser from 'phaser';
import type { ScareAbility } from '../abilities/ScareAbility';

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

    const background = scene.add.rectangle(0, 0, 176, 64, 0x302651, 0.96)
      .setStrokeStyle(2, 0x7c6db0, 1)
      .setInteractive({ useHandCursor: true });
    const icon = scene.add.text(-66, -2, ability.emoji, { fontSize: '25px' }).setOrigin(0.5);
    const title = scene.add.text(-42, -17, ability.name, {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    const detail = scene.add.text(-42, 7, `${shortcut} · ${ability.energyCost} energy`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#cfc5f4',
    });

    background.on('pointerover', () => background.setFillStyle(0x44366f, 1));
    background.on('pointerout', () => background.setFillStyle(0x302651, 0.96));
    background.on('pointerdown', () => {
      background.setScale(0.96);
      onActivate();
    });
    background.on('pointerup', () => background.setScale(1));

    this.add([background, icon, title, detail]);
    this.setDepth(100);
    scene.add.existing(this);
  }
}
