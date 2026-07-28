import Phaser from 'phaser';
import { STARTING_ABILITIES, type ScareAbility } from '../abilities/ScareAbility';
import { Ghost } from '../entities/Ghost';
import { Npc } from '../entities/Npc';
import { getFearStage, resolveScare } from '../fear/FearEngine';
import { GameHud } from '../ui/GameHud';
import { LobbyAmbience } from '../visuals/LobbyAmbience';
import { LobbyEnvironment } from '../visuals/LobbyEnvironment';
import { SceneBackdrop } from '../visuals/SceneBackdrop';
import { HUD_LAYOUT, ROOM } from '../visuals/lobbyTheme';

export class GameScene extends Phaser.Scene {
  private ghost!: Ghost;
  private npc!: Npc;
  private ambience!: LobbyAmbience;
  private hud!: GameHud;
  private backdrop!: SceneBackdrop;
  /** Holds the fixed-coordinate lobby so gameplay maths stays viewport-independent. */
  private lobby!: Phaser.GameObjects.Container;
  private score = 0;
  private energy = 100;
  private keys!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private abilityKeys!: Phaser.Input.Keyboard.Key[];

  constructor() {
    super('game');
  }

  create(): void {
    this.backdrop = new SceneBackdrop(this);
    this.lobby = this.add.container(0, 0).setDepth(0);

    const environment = new LobbyEnvironment(this);
    this.ambience = new LobbyAmbience(this);
    this.hud = new GameHud(this);

    this.ghost = new Ghost(this, 210, 330);
    this.npc = new Npc(this, 510, 300);
    this.lobby.add([environment.container, this.ambience.container, this.npc, this.ghost]);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y >= this.hud.controlBandTop) return;
      this.ghost.setTarget(
        (pointer.x - this.lobby.x) / this.lobby.scaleX,
        (pointer.y - this.lobby.y) / this.lobby.scaleY,
      );
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

    this.hud.createAbilityControls(STARTING_ABILITIES, (ability) => this.useAbility(ability));
    this.hud.setStatus('Move with WASD or tap the floor. Get close, then try a scare.');
    this.updateHud();

    this.layout();
    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.layout, this));
  }

  /** Fits the fixed lobby into the live viewport and re-anchors the HUD to its edges. */
  private layout(): void {
    const { width, height } = this.scale.gameSize;
    this.backdrop.resize(width, height);

    const available = Math.max(160, height - HUD_LAYOUT.topBandHeight - HUD_LAYOUT.bottomBandHeight);
    const scale = Math.min(width / ROOM.width, available / ROOM.artHeight);

    this.lobby.setScale(scale);
    this.lobby.setPosition(
      (width - ROOM.width * scale) / 2,
      HUD_LAYOUT.topBandHeight + (available - ROOM.artHeight * scale) / 2,
    );

    this.hud.layout(width, height);
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
