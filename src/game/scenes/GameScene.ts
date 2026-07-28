import Phaser from 'phaser';
import { STARTING_ABILITIES, type ScareAbility } from '../abilities/ScareAbility';
import { Ghost } from '../entities/Ghost';
import { Npc, NPC_MAX_FEAR } from '../entities/Npc';
import { getFearStage, resolveScare } from '../fear/FearEngine';
import { GameHud } from '../ui/GameHud';
import { LobbyAmbience } from '../visuals/LobbyAmbience';
import { LobbyEnvironment } from '../visuals/LobbyEnvironment';
import {
  clampZoomStepIndex,
  nearestZoomStepIndex,
  resolveCameraZoom,
} from '../world/lobbyGeometry';
import { CAMERA, GHOST_START, NORA_ROUTE, WORLD } from '../world/lobbyLayout';

const OBJECTIVE = 'Haunt Nora gently — get close, then try a scare she has not seen yet.';
/** How far inside the viewport edge (in CSS pixels) Nora must be to drop the marker. */
const ON_SCREEN_INSET = 24;
const PINCH_THRESHOLD = 0.15;

export class GameScene extends Phaser.Scene {
  private ghost!: Ghost;
  private npc!: Npc;
  private ambience!: LobbyAmbience;
  private hud!: GameHud;
  /** Holds the fixed-coordinate lobby world that the camera frames. */
  private world!: Phaser.GameObjects.Container;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  /** Game units per CSS pixel; game units are device pixels (see main.ts). */
  private uiScale = 1;
  private zoomStepIndex: number = CAMERA.defaultZoomStepIndex;
  private pinchStartDistance = 0;
  private pinchStartStepIndex: number = CAMERA.defaultZoomStepIndex;
  private score = 0;
  private energy = 100;
  private keys!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private abilityKeys!: Phaser.Input.Keyboard.Key[];

  constructor() {
    super('game');
  }

  create(): void {
    this.uiScale = 1 / this.scale.zoom;

    this.world = this.add.container(0, 0);
    const environment = new LobbyEnvironment(this);
    this.ambience = new LobbyAmbience(this);
    this.ghost = new Ghost(this, GHOST_START.x, GHOST_START.y);
    this.npc = new Npc(this, NORA_ROUTE[0].x, NORA_ROUTE[0].y);
    this.world.add([environment.container, this.ambience.container, this.npc, this.ghost]);

    this.hud = new GameHud(this, this.uiScale, {
      objective: OBJECTIVE,
      onZoomIn: () => this.setZoomStep(this.zoomStepIndex - 1),
      onZoomOut: () => this.setZoomStep(this.zoomStepIndex + 1),
    });

    this.setupCameras();
    this.setupInput();

    this.hud.createAbilityControls(STARTING_ABILITIES, (ability) => this.useAbility(ability));
    this.hud.setStatus('Move with WASD or tap the floor. Get close, then try a scare.');
    this.updateHud();

    this.layout();
    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.layout, this));
  }

  private setupCameras(): void {
    const { width, height } = this.scale.gameSize;
    const main = this.cameras.main;

    main.setBounds(0, 0, WORLD.width, WORLD.height);
    main.startFollow(this.ghost, false, CAMERA.followLerp, CAMERA.followLerp);
    main.ignore(this.hud.root);

    // A second camera keeps the HUD at a constant size whatever the world zoom.
    this.uiCamera = this.cameras.add(0, 0, width, height);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.ignore(this.world);
  }

  private setupInput(): void {
    // A second pointer lets a pinch snap between zoom steps.
    this.input.addPointer(1);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.input.pointer2?.isDown) return;
      if (this.hud.blocksPointer(pointer.x, pointer.y)) return;

      const target = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.ghost.setTarget(target.x, target.y);
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
  }

  /** Re-frames the camera and re-anchors the HUD whenever the viewport changes. */
  private layout(): void {
    const { width, height } = this.scale.gameSize;

    this.cameras.main.setSize(width, height);
    this.uiCamera.setSize(width, height);
    this.uiCamera.setScroll(0, 0);

    this.applyZoom(width, height);
    this.hud.layout(width, height);
  }

  private applyZoom(width: number, height: number): void {
    const steps = CAMERA.zoomSteps;
    const zoom = resolveCameraZoom(width, height, steps[this.zoomStepIndex]);
    const main = this.cameras.main;

    main.setZoom(zoom);
    // The deadzone is world-space, so derive it from the visible slice.
    main.setDeadzone(
      (width / zoom) * CAMERA.deadzoneWidthFraction,
      (height / zoom) * CAMERA.deadzoneHeightFraction,
    );

    const wider = this.zoomStepIndex + 1 < steps.length
      ? resolveCameraZoom(width, height, steps[this.zoomStepIndex + 1])
      : zoom;
    this.hud.setZoomAvailability(this.zoomStepIndex > 0, wider < zoom - 1e-6);
  }

  private setZoomStep(index: number): void {
    const next = clampZoomStepIndex(index);
    if (next === this.zoomStepIndex) return;

    this.zoomStepIndex = next;
    const { width, height } = this.scale.gameSize;
    this.applyZoom(width, height);
  }

  update(time: number, delta: number): void {
    this.ghost.setKeyboardDirection(
      Number(this.keys.right.isDown) - Number(this.keys.left.isDown),
      Number(this.keys.down.isDown) - Number(this.keys.up.isDown),
    );
    this.ghost.update(delta);
    this.npc.update(time, delta);
    this.ambience.update(delta);
    this.updatePinchZoom();
    this.updateNpcIndicator();

    this.abilityKeys.forEach((key, index) => {
      if (Phaser.Input.Keyboard.JustDown(key)) this.useAbility(STARTING_ABILITIES[index]);
    });
  }

  private updatePinchZoom(): void {
    const first = this.input.pointer1;
    const second = this.input.pointer2;

    if (!first?.isDown || !second?.isDown) {
      this.pinchStartDistance = 0;
      return;
    }

    const distance = Phaser.Math.Distance.Between(first.x, first.y, second.x, second.y);

    if (this.pinchStartDistance === 0) {
      this.pinchStartDistance = distance;
      this.pinchStartStepIndex = this.zoomStepIndex;
      return;
    }

    const ratio = distance / this.pinchStartDistance;
    if (Math.abs(ratio - 1) < PINCH_THRESHOLD) return;

    this.setZoomStep(nearestZoomStepIndex(CAMERA.zoomSteps[this.pinchStartStepIndex] * ratio));
  }

  private updateNpcIndicator(): void {
    const main = this.cameras.main;
    const { width, height } = this.scale.gameSize;
    const screenX = (this.npc.x - main.worldView.x) * main.zoom;
    const screenY = (this.npc.y - main.worldView.y) * main.zoom;

    const inset = ON_SCREEN_INSET * this.uiScale;
    const visible =
      screenX > inset &&
      screenX < width - inset &&
      screenY > inset &&
      screenY < height - inset;

    if (visible) {
      this.hud.hideNpcIndicator();
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.ghost.x, this.ghost.y, this.npc.x, this.npc.y);
    this.hud.showNpcIndicator({ x: screenX, y: screenY }, distance);
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

    const fear = Phaser.Math.Clamp(this.npc.fear + result.fearGained, 0, NPC_MAX_FEAR);
    this.npc.syncFear(fear, getFearStage(fear));
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
      this.hud.setObjective(true);
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
