import Phaser from 'phaser';
import { STARTING_ABILITIES, type ScareAbility } from '../abilities/ScareAbility';
import { Ghost } from '../entities/Ghost';
import { Npc } from '../entities/Npc';
import { getFearStage, resolveScare } from '../fear/FearEngine';
import { AbilityButton } from '../ui/AbilityButton';

export class GameScene extends Phaser.Scene {
  private ghost!: Ghost;
  private npc!: Npc;
  private score = 0;
  private energy = 100;
  private scoreText!: Phaser.GameObjects.Text;
  private fearText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private keys!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private abilityKeys!: Phaser.Input.Keyboard.Key[];

  constructor() {
    super('game');
  }

  create(): void {
    this.drawRoom();
    this.createHeader();

    this.ghost = new Ghost(this, 210, 330);
    this.npc = new Npc(this, 510, 300);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < 500) this.ghost.setTarget(pointer.worldX, pointer.worldY);
    });

    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable.');
    this.keys = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as typeof this.keys;

    this.abilityKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    ];

    STARTING_ABILITIES.forEach((ability, index) => {
      new AbilityButton(this, 290 + index * 190, 550, ability, String(index + 1), () => this.useAbility(ability));
    });

    this.statusText = this.add.text(480, 488, 'Move with WASD or tap the floor. Get close, then try a scare.', {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#fff7cf',
      align: 'center',
      wordWrap: { width: 820 },
    }).setOrigin(0.5).setDepth(100);

    this.updateHud();
  }

  update(time: number, delta: number): void {
    this.ghost.setKeyboardDirection(
      Number(this.keys.right.isDown) - Number(this.keys.left.isDown),
      Number(this.keys.down.isDown) - Number(this.keys.up.isDown),
    );
    this.ghost.update(delta);
    this.npc.update(time, delta);

    this.abilityKeys.forEach((key, index) => {
      if (Phaser.Input.Keyboard.JustDown(key)) this.useAbility(STARTING_ABILITIES[index]);
    });
  }

  private drawRoom(): void {
    this.add.rectangle(480, 300, 960, 600, 0x17142b);

    const floor = this.add.graphics();
    floor.fillStyle(0x2b2245, 1);
    floor.lineStyle(1, 0x493b6f, 0.8);

    const tileWidth = 80;
    const tileHeight = 40;
    for (let row = -1; row < 10; row += 1) {
      for (let column = -2; column < 13; column += 1) {
        const x = 480 + (column - row) * (tileWidth / 2);
        const y = 100 + (column + row) * (tileHeight / 2);
        if (y < 105 || y > 470 || x < 50 || x > 910) continue;

        floor.beginPath();
        floor.moveTo(x, y - tileHeight / 2);
        floor.lineTo(x + tileWidth / 2, y);
        floor.lineTo(x, y + tileHeight / 2);
        floor.lineTo(x - tileWidth / 2, y);
        floor.closePath();
        floor.fillPath();
        floor.strokePath();
      }
    }

    this.add.rectangle(480, 84, 860, 40, 0x3c2c5d).setStrokeStyle(3, 0x745f9e);
    this.add.rectangle(65, 286, 40, 365, 0x3c2c5d).setStrokeStyle(3, 0x745f9e);
    this.add.rectangle(895, 286, 40, 365, 0x3c2c5d).setStrokeStyle(3, 0x745f9e);

    this.drawFurniture();
  }

  private drawFurniture(): void {
    this.add.rectangle(730, 180, 130, 60, 0x5f4168).setStrokeStyle(3, 0xaa7ea9);
    this.add.text(730, 180, 'PIANO', {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#f6d6ab',
    }).setOrigin(0.5);

    this.add.rectangle(250, 185, 105, 56, 0x6a4a65).setStrokeStyle(3, 0xb889a8);
    this.add.text(250, 185, 'SOFA', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#f6d6ab',
    }).setOrigin(0.5);

    this.add.rectangle(750, 410, 80, 58, 0x5d4858).setStrokeStyle(3, 0xa98e91);
    this.add.text(750, 410, 'CHAIR', {
      fontFamily: 'Trebuchet MS',
      fontSize: '13px',
      color: '#f6d6ab',
    }).setOrigin(0.5);

    this.add.rectangle(280, 405, 110, 55, 0x4e536d).setStrokeStyle(3, 0x8e98bd);
    this.add.text(280, 405, 'RECEPTION', {
      fontFamily: 'Trebuchet MS',
      fontSize: '13px',
      color: '#e1e9ff',
    }).setOrigin(0.5);
  }

  private createHeader(): void {
    this.add.text(38, 22, 'PROJECT BOO', {
      fontFamily: 'Trebuchet MS',
      fontSize: '30px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setDepth(100);
    this.add.text(39, 57, 'Playable Room Prototype', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#bdb0ec',
    }).setDepth(100);

    this.scoreText = this.add.text(920, 25, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#fff7cf',
      align: 'right',
    }).setOrigin(1, 0).setDepth(100);

    this.fearText = this.add.text(920, 55, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#d8cef7',
      align: 'right',
    }).setOrigin(1, 0).setDepth(100);
  }

  private useAbility(ability: ScareAbility): void {
    if (this.energy < ability.energyCost) {
      this.setStatus('Not enough ghost energy. Give Nora a moment to recover.');
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.ghost.x, this.ghost.y, this.npc.x, this.npc.y);
    if (distance > ability.range) {
      this.setStatus(`${ability.name} missed — move closer to Nora.`);
      return;
    }

    this.energy -= ability.energyCost;
    const result = resolveScare(this.npc.fearProfile, this.npc.scareHistory, ability.category);
    this.npc.scareHistory.usesByCategory[ability.category] =
      (this.npc.scareHistory.usesByCategory[ability.category] ?? 0) + 1;

    this.npc.fear = Phaser.Math.Clamp(this.npc.fear + result.fearGained, 0, 100);
    this.npc.stage = getFearStage(this.npc.fear);
    this.score = Math.max(0, this.score + result.scoreDelta);

    const failed = result.strength === 'none';
    if (failed) this.ghost.showFailedScareGlimpse();

    this.npc.react(
      failed ? 'Ha! I saw you!' : `${result.reaction}\n+${result.fearGained} fear`,
      this.npc.stage,
      failed,
    );

    const repetitionNote = result.noveltyMultiplier < 1
      ? ` Novelty is down to ${Math.round(result.noveltyMultiplier * 100)}%.`
      : '';
    this.setStatus(`${ability.name}: ${result.reaction}${repetitionNote}`);
    this.updateHud();

    if (this.npc.stage === 'possessed') {
      this.setStatus('Nora is goofily possessed — haunting complete! 👻');
    }

    this.time.delayedCall(1800, () => {
      this.energy = Math.min(100, this.energy + 4);
      this.updateHud();
    });
  }

  private updateHud(): void {
    this.scoreText.setText(`Score ${this.score}  ·  Energy ${this.energy}`);
    this.fearText.setText(`Nora: ${this.npc ? this.npc.stage.toUpperCase() : 'CALM'} · Fear ${this.npc?.fear ?? 0}/100`);
  }

  private setStatus(message: string): void {
    this.statusText?.setText(message);
  }
}
