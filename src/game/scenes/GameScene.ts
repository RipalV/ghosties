import Phaser from 'phaser';
import { STARTING_ABILITIES, type ScareAbility } from '../abilities/ScareAbility';
import { Ghost } from '../entities/Ghost';
import { Npc } from '../entities/Npc';
import { getFearStage, resolveScare } from '../fear/FearEngine';
import { AbilityButton } from '../ui/AbilityButton';
import { GameHud } from '../ui/GameHud';
import { LobbyAmbience } from '../visuals/LobbyAmbience';
import { LobbyEnvironment } from '../visuals/LobbyEnvironment';
import { HUD_LAYOUT } from '../visuals/lobbyTheme';

export class GameScene extends Phaser.Scene {
  private ghost!: Ghost;
  private npc!: Npc;
  private ambience!: LobbyAmbience;
  private hud!: GameHud;
  private score = 0;
  private energy = 100;
  private keys!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private abilityKeys!: Phaser.Input.Keyboard.Key[];

  constructor() {
    super('game');
  }

  create(): void {
    new LobbyEnvironment(this);
    this.ambience = new LobbyAmbience(this);
    this.hud = new GameHud(this);

    this.ghost = new Ghost(this, 210, 330);
    this.npc = new Npc(this, 510, 300);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Keep taps on the floor playable; ignore the ability strip.
      if (pointer.y < HUD_LAYOUT.abilityY - HUD_LAYOUT.abilityHeight / 2 - 8) {
        this.ghost.setTarget(pointer.worldX, pointer.worldY);
      }
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
      new AbilityButton(
        this,
        HUD_LAYOUT.abilityStartX + index * HUD_LAYOUT.abilityGap,
        HUD_LAYOUT.abilityY,
        ability,
        String(index + 1),
        () => this.useAbility(ability),
      );
    });

    this.hud.setStatus('Move with WASD or tap the floor. Get close, then try a scare.');
    this.updateHud();

    this.scale.on('resize', () => this.hud.onResize());
  }

  update(time: number, delta: number): void {
    this.ghost.setKeyboardDirection(
      Number(this.keys.right.isDown) - Number(this.keys.left.isDown),
      Number(this.keys.down.isDown) - Number(this.keys.up.isDown),
    );
    this.ghost.update(delta);
    this.npc.update(time, delta);
    this.ambience.update(delta);

    this.abilityKeys.forEach((key, index) => {
      if (Phaser.Input.Keyboard.JustDown(key)) this.useAbility(STARTING_ABILITIES[index]);
    });
  }

  private useAbility(ability: ScareAbility): void {
    if (this.energy < ability.energyCost) {
      this.hud.setStatus('Not enough ghost energy. Give Nora a moment to recover.');
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.ghost.x, this.ghost.y, this.npc.x, this.npc.y);
    if (distance > ability.range) {
      this.hud.setStatus(`${ability.name} missed — move closer to Nora.`);
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
    this.ghost.playScarePulse(!failed);

    this.npc.react(
      failed ? 'Ha! I saw you!' : `${result.reaction}\n+${result.fearGained} fear`,
      this.npc.stage,
      failed,
    );

    const repetitionNote = result.noveltyMultiplier < 1
      ? ` Novelty is down to ${Math.round(result.noveltyMultiplier * 100)}%.`
      : '';
    this.hud.setStatus(`${ability.name}: ${result.reaction}${repetitionNote}`);
    this.updateHud();

    if (this.npc.stage === 'possessed') {
      this.hud.setStatus('Nora is goofily possessed — haunting complete! 👻');
    }

    this.time.delayedCall(1800, () => {
      this.energy = Math.min(100, this.energy + 4);
      this.updateHud();
    });
  }

  private updateHud(): void {
    this.hud.update({
      score: this.score,
      energy: this.energy,
      fear: this.npc?.fear ?? 0,
      stage: this.npc?.stage ?? 'calm',
    });
  }
}
