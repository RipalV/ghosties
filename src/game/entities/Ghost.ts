import Phaser from 'phaser';

export class Ghost extends Phaser.GameObjects.Container {
  private readonly bodyShape: Phaser.GameObjects.Arc;
  private readonly face: Phaser.GameObjects.Text;
  private target = new Phaser.Math.Vector2();
  private readonly speed = 220;
  private keyboardDirection = new Phaser.Math.Vector2();
  private glimpseTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.bodyShape = scene.add.circle(0, 0, 28, 0xb8f2ff, 0.38);
    this.bodyShape.setStrokeStyle(3, 0xe9fcff, 0.75);
    this.face = scene.add.text(0, -2, '•ᴗ•', {
      fontFamily: 'Trebuchet MS',
      fontSize: '21px',
      color: '#203050',
    }).setOrigin(0.5);

    const tail = scene.add.triangle(0, 33, -25, -6, 0, 17, 25, -6, 0xb8f2ff, 0.38);
    tail.setStrokeStyle(3, 0xe9fcff, 0.75);

    this.add([tail, this.bodyShape, this.face]);
    this.setDepth(50);
    this.setAlpha(0.55);
    this.target.set(x, y);
    scene.add.existing(this);
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

    if (keyboard.lengthSq() > 0) {
      keyboard.normalize().scale(this.speed * seconds);
      this.x = Phaser.Math.Clamp(this.x + keyboard.x, 90, 870);
      this.y = Phaser.Math.Clamp(this.y + keyboard.y, 120, 470);
      this.target.set(this.x, this.y);
      return;
    }

    const direction = this.target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
    const distance = direction.length();
    if (distance < 5) return;

    direction.normalize().scale(Math.min(distance, this.speed * seconds));
    this.x = Phaser.Math.Clamp(this.x + direction.x, 90, 870);
    this.y = Phaser.Math.Clamp(this.y + direction.y, 120, 470);
  }

  showFailedScareGlimpse(): void {
    this.glimpseTween?.stop();
    this.setAlpha(1);
    this.setScale(1.15);
    this.face.setText('⊙﹏⊙');

    this.glimpseTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.55,
      scale: 1,
      duration: 900,
      ease: 'Sine.Out',
      onComplete: () => this.face.setText('•ᴗ•'),
    });
  }
}
