import Phaser from 'phaser';
import { PALETTE, ROOM } from '../visuals/lobbyTheme';

export class Ghost extends Phaser.GameObjects.Container {
  private readonly bodyShape: Phaser.GameObjects.Arc;
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly face: Phaser.GameObjects.Text;
  private target = new Phaser.Math.Vector2();
  private readonly speed = 220;
  private keyboardDirection = new Phaser.Math.Vector2();
  private glimpseTween?: Phaser.Tweens.Tween;
  private wasMoving = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.glow = scene.add.circle(0, 4, 40, PALETTE.ghostGlow, 0.18);
    this.bodyShape = scene.add.circle(0, 0, 28, PALETTE.ghostBody, 0.45);
    this.bodyShape.setStrokeStyle(3, PALETTE.ghostStroke, 0.8);
    const tail = scene.add.triangle(0, 34, -24, -6, 0, 18, 24, -6, PALETTE.ghostBody, 0.42);
    tail.setStrokeStyle(3, PALETTE.ghostStroke, 0.75);
    this.face = scene.add.text(0, -2, '•ᴗ•', {
      fontFamily: 'Trebuchet MS',
      fontSize: '21px',
      color: '#203050',
    }).setOrigin(0.5);

    this.add([this.glow, tail, this.bodyShape, this.face]);
    this.setDepth(50);
    this.setAlpha(0.62);
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
  }

  setTarget(x: number, y: number): void {
    this.target.set(x, y);
  }

  setKeyboardDirection(x: number, y: number): void {
    this.keyboardDirection.set(x, y);
  }

  update(deltaMs: number): void {
    const seconds = deltaMs / 1000;
    const keyboard = this.keyboardDirection.clone();
    let moving = false;

    if (keyboard.lengthSq() > 0) {
      keyboard.normalize().scale(this.speed * seconds);
      this.x = Phaser.Math.Clamp(this.x + keyboard.x, ROOM.playMinX, ROOM.playMaxX);
      this.y = Phaser.Math.Clamp(this.y + keyboard.y, ROOM.playMinY, ROOM.playMaxY);
      this.target.set(this.x, this.y);
      moving = true;
    } else {
      const direction = this.target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
      const distance = direction.length();
      if (distance >= 5) {
        direction.normalize().scale(Math.min(distance, this.speed * seconds));
        this.x = Phaser.Math.Clamp(this.x + direction.x, ROOM.playMinX, ROOM.playMaxX);
        this.y = Phaser.Math.Clamp(this.y + direction.y, ROOM.playMinY, ROOM.playMaxY);
        moving = true;
      }
    }

    if (moving && !this.wasMoving) {
      this.setScale(1.04);
    } else if (!moving && this.wasMoving) {
      this.setScale(1);
    }
    this.wasMoving = moving;
  }

  showFailedScareGlimpse(): void {
    this.glimpseTween?.stop();
    this.setAlpha(1);
    this.setScale(1.15);
    this.face.setText('⊙﹏⊙');

    this.glimpseTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.62,
      scale: 1,
      duration: 900,
      ease: 'Sine.Out',
      onComplete: () => this.face.setText('•ᴗ•'),
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
}
