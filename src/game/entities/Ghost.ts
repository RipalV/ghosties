import Phaser from 'phaser';
import { CharacterMarker } from '../visuals/CharacterMarker';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';
import { cssToWorldUnits, fitsAboveHead } from '../visuals/overheadPlacement';
import { clampToFloor } from '../world/lobbyGeometry';
import { MOVEMENT } from '../world/lobbyLayout';
import { ghostTravelSpeed, tickGhostSpeedMultiplier } from '../scareCast/ghostCastMovement';

const MARKER_ABOVE_Y = -74;
const MARKER_BELOW_Y = 70;
/** Screen space the top chips and objective button occupy, in CSS pixels. */
const TOP_HUD_CLEARANCE_CSS =
  HUD_LAYOUT.padding + Math.max(HUD_LAYOUT.chipHeight, HUD_LAYOUT.objectiveSize) + 8;

export class Ghost extends Phaser.GameObjects.Container {
  private readonly bodyShape: Phaser.GameObjects.Arc;
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly face: Phaser.GameObjects.Text;
  private readonly marker: CharacterMarker;
  private target = new Phaser.Math.Vector2();
  private readonly speed = MOVEMENT.ghostSpeed;
  private keyboardDirection = new Phaser.Math.Vector2();
  private glimpseTween?: Phaser.Tweens.Tween;
  private wasMoving = false;
  private castingPresentation = false;
  private speedMultiplier = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.shadow = scene.add.ellipse(0, 42, 52, 20, 0x000000, 0.2);
    this.glow = scene.add.circle(0, 4, 44, PALETTE.ghostGlow, 0.26);
    this.bodyShape = scene.add.circle(0, 0, 28, PALETTE.ghostBody, 0.82);
    this.bodyShape.setStrokeStyle(3, PALETTE.ghostStroke, 0.95);
    const tail = scene.add.triangle(0, 34, -24, -6, 0, 18, 24, -6, PALETTE.ghostBody, 0.76);
    tail.setStrokeStyle(3, PALETTE.ghostStroke, 0.9);
    this.face = scene.add.text(0, -2, '•ᴗ•', {
      fontFamily: 'Trebuchet MS',
      fontSize: '21px',
      color: '#203050',
    }).setOrigin(0.5);

    this.add([this.shadow, this.glow, tail, this.bodyShape, this.face]);

    this.marker = new CharacterMarker(scene, MARKER_ABOVE_Y, 'HIDDEN', false);
    this.add(this.marker);

    this.setDepth(50);
    // Slightly see-through: hidden enough to be sneaky, solid enough to read.
    this.setAlpha(0.78);
    this.target.set(x, y);
    scene.add.existing(this);

    scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.12, to: 0.26 },
      scale: { from: 0.95, to: 1.08 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    scene.tweens.add({
      targets: [this.bodyShape, this.face],
      y: '-=5',
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  setTarget(x: number, y: number): void {
    const inside = clampToFloor(x, y);
    this.target.set(inside.x, inside.y);
  }

  setKeyboardDirection(x: number, y: number): void {
    this.keyboardDirection.set(x, y);
  }

  update(deltaMs: number): void {
    this.placeMarker();

    const seconds = deltaMs / 1000;
    this.speedMultiplier = tickGhostSpeedMultiplier(
      this.speedMultiplier,
      this.castingPresentation,
      MOVEMENT.ghostCastSpeedMultiplier,
      deltaMs,
      MOVEMENT.ghostCastSpeedTransitionMs,
    );
    const speed = ghostTravelSpeed(this.speed, this.speedMultiplier);
    const keyboard = this.keyboardDirection.clone();
    let moving = false;

    if (keyboard.lengthSq() > 0) {
      keyboard.normalize().scale(speed * seconds);
      this.moveWithinFloor(this.x + keyboard.x, this.y + keyboard.y);
      this.target.set(this.x, this.y);
      moving = true;
    } else {
      const direction = this.target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
      const distance = direction.length();
      if (distance >= 5) {
        direction.normalize().scale(Math.min(distance, speed * seconds));
        this.moveWithinFloor(this.x + direction.x, this.y + direction.y);
        moving = true;
      }
    }

    if (moving && !this.wasMoving) {
      this.bodyShape.setScale(1.04);
    } else if (!moving && this.wasMoving) {
      this.bodyShape.setScale(1);
    }
    this.wasMoving = moving;
  }

  /** World-space cue while a scare cast is winding up — face + marker, not colour alone. */
  setCastingPresentation(active: boolean): void {
    if (active === this.castingPresentation) return;
    this.castingPresentation = active;

    if (active) {
      this.glimpseTween?.stop();
      this.setScale(1);
      this.face.setText('◕‿◕');
      this.marker.setLabel('CASTING');
      this.setAlpha(0.92);
      return;
    }

    this.setAlpha(0.78);
    this.setScale(1);
    this.bodyShape.setScale(this.wasMoving ? 1.04 : 1);
    this.face.setText('•ᴗ•');
    this.marker.setLabel('HIDDEN');
  }

  showFailedScareGlimpse(): void {
    this.setCastingPresentation(false);
    this.glimpseTween?.stop();
    this.setAlpha(1);
    this.setScale(1.15);
    this.face.setText('⊙﹏⊙');
    this.marker.setLabel('SEEN!');

    this.glimpseTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.78,
      scale: 1,
      duration: 900,
      ease: 'Sine.Out',
      onComplete: () => {
        this.face.setText('•ᴗ•');
        this.marker.setLabel('HIDDEN');
      },
    });
  }

  playScarePulse(success: boolean): void {
    this.scene.tweens.add({
      targets: this.glow,
      alpha: success ? 0.45 : 0.3,
      scale: success ? 1.3 : 1.12,
      yoyo: true,
      duration: 220,
      ease: 'Sine.Out',
    });
  }

  /** Drops the marker below the ghost when the top of the view would clip it. */
  private placeMarker(): void {
    const camera = this.scene.cameras.main;
    const clearance = cssToWorldUnits(
      TOP_HUD_CLEARANCE_CSS,
      camera.zoom,
      this.scene.scale.zoom,
    );

    this.marker.setY(
      fitsAboveHead(
        this.y,
        MARKER_ABOVE_Y,
        this.marker.badgeHeight,
        camera.worldView.y,
        clearance,
      )
        ? MARKER_ABOVE_Y
        : MARKER_BELOW_Y,
    );
  }

  private moveWithinFloor(x: number, y: number): void {
    const inside = clampToFloor(x, y);
    this.x = inside.x;
    this.y = inside.y;
  }
}
