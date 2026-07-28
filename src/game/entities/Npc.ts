import Phaser from 'phaser';
import type { FearProfile, FearStage, ScareHistory } from '../fear/FearEngine';

export class Npc extends Phaser.GameObjects.Container {
  readonly fearProfile: FearProfile = {
    highFears: ['whisper'],
    mediumFears: ['cold'],
    ineffectiveFears: ['object'],
  };

  readonly scareHistory: ScareHistory = { usesByCategory: {} };
  fear = 0;
  stage: FearStage = 'calm';

  private readonly bodyShape: Phaser.GameObjects.Arc;
  private readonly face: Phaser.GameObjects.Text;
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly reactionBubble: Phaser.GameObjects.Text;
  private readonly waypoints: Phaser.Math.Vector2[];
  private waypointIndex = 0;
  private moveSpeed = 65;
  private pausedUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const shadow = scene.add.ellipse(0, 30, 42, 14, 0x000000, 0.2);
    this.bodyShape = scene.add.circle(0, 0, 25, 0xf6c57b, 1);
    this.bodyShape.setStrokeStyle(3, 0x5b315e, 1);
    this.face = scene.add.text(0, -1, '•‿•', {
      fontFamily: 'Trebuchet MS',
      fontSize: '19px',
      color: '#4a2846',
    }).setOrigin(0.5);
    this.nameLabel = scene.add.text(0, 42, 'Nora', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#fff7cf',
      backgroundColor: '#392753',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5);
    this.reactionBubble = scene.add.text(0, -54, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#241632',
      backgroundColor: '#fffdf0',
      padding: { x: 9, y: 6 },
      align: 'center',
      wordWrap: { width: 180 },
    }).setOrigin(0.5).setVisible(false);

    this.add([shadow, this.bodyShape, this.face, this.nameLabel, this.reactionBubble]);
    this.setDepth(40);
    scene.add.existing(this);

    this.waypoints = [
      new Phaser.Math.Vector2(x, y),
      new Phaser.Math.Vector2(690, 260),
      new Phaser.Math.Vector2(620, 400),
      new Phaser.Math.Vector2(360, 390),
      new Phaser.Math.Vector2(270, 245),
    ];
  }

  update(time: number, deltaMs: number): void {
    if (this.stage === 'possessed' || time < this.pausedUntil) return;

    const target = this.waypoints[this.waypointIndex];
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
    const distance = direction.length();

    if (distance < 8) {
      this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
      return;
    }

    direction.normalize().scale(this.moveSpeed * (deltaMs / 1000));
    this.x += direction.x;
    this.y += direction.y;
  }

  react(message: string, stage: FearStage, failed: boolean): void {
    this.stage = stage;
    this.reactionBubble.setText(message).setVisible(true);
    this.pausedUntil = this.scene.time.now + 1500;

    const faceByStage: Record<FearStage, string> = {
      calm: '•‿•',
      curious: '•o•',
      uneasy: '•﹏•',
      frightened: '⊙﹏⊙',
      runaway: 'ᗒ﹏ᗕ',
      swoon: '×﹏×',
      possessed: '◉ᴗ◉',
    };
    this.face.setText(failed ? '≧▽≦' : faceByStage[stage]);
    this.bodyShape.setFillStyle(failed ? 0xffd68b : 0xf6c57b);

    this.scene.tweens.add({
      targets: this,
      scaleX: failed ? 1.12 : 1.08,
      scaleY: failed ? 0.9 : 1.08,
      yoyo: true,
      repeat: failed ? 1 : 0,
      duration: 150,
    });

    this.scene.time.delayedCall(1450, () => {
      this.reactionBubble.setVisible(false);
      if (this.stage !== 'possessed') this.face.setText(faceByStage[this.stage]);
      this.bodyShape.setFillStyle(0xf6c57b);
    });
  }
}
