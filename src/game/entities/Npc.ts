import Phaser from 'phaser';
import type { FearProfile, FearStage, ScareHistory } from '../fear/FearEngine';
import { PALETTE } from '../visuals/lobbyTheme';

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
  private readonly dress: Phaser.GameObjects.Triangle;
  private readonly face: Phaser.GameObjects.Text;
  private readonly nameLabel: Phaser.GameObjects.Text;
  private readonly reactionBubble: Phaser.GameObjects.Text;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly waypoints: Phaser.Math.Vector2[];
  private waypointIndex = 0;
  private moveSpeed = 65;
  private pausedUntil = 0;
  private wasMoving = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.shadow = scene.add.ellipse(0, 34, 46, 14, 0x000000, 0.22);
    this.dress = scene.add.triangle(0, 18, -22, -8, 0, 28, 22, -8, PALETTE.noraDress, 1);
    this.dress.setStrokeStyle(2, PALETTE.noraTrim, 0.85);
    this.bodyShape = scene.add.circle(0, -6, 22, PALETTE.noraSkin, 1);
    this.bodyShape.setStrokeStyle(3, PALETTE.noraTrim, 1);
    this.face = scene.add.text(0, -7, '•‿•', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#4a2846',
    }).setOrigin(0.5);
    this.nameLabel = scene.add.text(0, 48, 'Nora', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#fff7cf',
      backgroundColor: '#392753',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5);
    this.reactionBubble = scene.add.text(0, -58, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#241632',
      backgroundColor: '#fffdf0',
      padding: { x: 9, y: 6 },
      align: 'center',
      wordWrap: { width: 180 },
    }).setOrigin(0.5).setVisible(false);

    this.add([this.shadow, this.dress, this.bodyShape, this.face, this.nameLabel, this.reactionBubble]);
    this.setDepth(40);
    scene.add.existing(this);

    scene.tweens.add({
      targets: this.shadow,
      scaleX: { from: 0.95, to: 1.05 },
      alpha: { from: 0.18, to: 0.26 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    this.waypoints = [
      new Phaser.Math.Vector2(x, y),
      new Phaser.Math.Vector2(690, 260),
      new Phaser.Math.Vector2(620, 400),
      new Phaser.Math.Vector2(360, 390),
      new Phaser.Math.Vector2(270, 245),
    ];
  }

  update(time: number, deltaMs: number): void {
    if (this.stage === 'possessed' || time < this.pausedUntil) {
      this.wasMoving = false;
      return;
    }

    const target = this.waypoints[this.waypointIndex];
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
    const distance = direction.length();
    let moving = false;

    if (distance < 8) {
      this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
    } else {
      direction.normalize().scale(this.moveSpeed * (deltaMs / 1000));
      this.x += direction.x;
      this.y += direction.y;
      moving = true;
    }

    if (moving && !this.wasMoving) this.setScale(1.03);
    else if (!moving && this.wasMoving) this.setScale(1);
    this.wasMoving = moving;
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
    this.bodyShape.setFillStyle(failed ? 0xffd68b : PALETTE.noraSkin);

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
      this.bodyShape.setFillStyle(PALETTE.noraSkin);
    });
  }
}
