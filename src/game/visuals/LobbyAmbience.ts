import Phaser from 'phaser';
import { LOBBY_PROPS, PALETTE, ROOM } from './lobbyTheme';

/** Warm lamps, moonlight wash, soft shadows, and a fixed dust-particle pool. */
export class LobbyAmbience {
  readonly container: Phaser.GameObjects.Container;
  private readonly motes: Phaser.GameObjects.Arc[] = [];
  private readonly moteVel: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(5);
    this.drawMoonWash(scene);
    this.drawLampGlows(scene);
    this.createMotes(scene);
  }

  update(deltaMs: number): void {
    const seconds = deltaMs / 1000;
    for (let i = 0; i < this.motes.length; i += 1) {
      const mote = this.motes[i];
      const vel = this.moteVel[i];
      mote.x += vel.x * seconds;
      mote.y += vel.y * seconds;
      if (mote.x < 80 || mote.x > ROOM.width - 80) vel.x *= -1;
      if (mote.y < 100 || mote.y > 450) vel.y *= -1;
    }
  }

  private drawMoonWash(scene: Phaser.Scene): void {
    const g = scene.add.graphics();
    g.fillStyle(PALETTE.moonlight, 0.08);
    g.fillTriangle(400, 50, 560, 50, 620, 280);
    g.fillStyle(PALETTE.moonlight, 0.05);
    g.fillEllipse(520, 220, 220, 120);
    this.container.add(g);
  }

  private drawLampGlows(scene: Phaser.Scene): void {
    for (const prop of LOBBY_PROPS) {
      if (prop.kind !== 'lamp') continue;
      const glow = scene.add.circle(prop.x, prop.y - 10, 48, PALETTE.lampWarm, 0.14);
      this.container.add(glow);
      scene.tweens.add({
        targets: glow,
        alpha: { from: 0.1, to: 0.2 },
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }
  }

  private createMotes(scene: Phaser.Scene): void {
    const count = 10;
    for (let i = 0; i < count; i += 1) {
      const x = Phaser.Math.Between(100, 860);
      const y = Phaser.Math.Between(120, 420);
      const mote = scene.add.circle(x, y, Phaser.Math.Between(1, 2), 0xfff4d0, 0.35);
      this.motes.push(mote);
      this.moteVel.push({
        x: Phaser.Math.FloatBetween(-12, 12),
        y: Phaser.Math.FloatBetween(-8, 8),
      });
      this.container.add(mote);
    }
  }
}
