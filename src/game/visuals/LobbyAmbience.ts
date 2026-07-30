import Phaser from 'phaser';
import { LOBBY_PROPS as HAUNTABLE_PROPS } from '../content/lobbyProps';
import { floorDistance } from '../world/lobbyGeometry';
import { FLOOR } from '../world/lobbyLayout';
import { fillIsoDiamond } from './isoDraw';
import { LOBBY_PROPS, PALETTE } from './lobbyTheme';

/**
 * Warm interior light pools, a cool moonlight wash, and a fixed pool of dust
 * motes. When the painted lobby art is active, lamp overlays stay subtle so they
 * do not fight the artwork lighting.
 */
export class LobbyAmbience {
  readonly container: Phaser.GameObjects.Container;
  private readonly motes: Phaser.GameObjects.Arc[] = [];
  private readonly moteVelocity: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene, paintedLobby = false) {
    this.container = scene.add.container(0, 0).setDepth(6);
    if (paintedLobby) {
      this.drawPaintedLobbyGlow(scene);
    } else {
      this.drawLightPools(scene);
      this.drawMoonWash(scene);
    }
    this.createMotes(scene);
  }

  update(deltaMs: number): void {
    const seconds = deltaMs / 1000;

    for (let index = 0; index < this.motes.length; index += 1) {
      const mote = this.motes[index];
      const velocity = this.moteVelocity[index];
      const nextX = mote.x + velocity.x * seconds;
      const nextY = mote.y + velocity.y * seconds;

      if (floorDistance(nextX, nextY, 0.8) > 1) {
        velocity.x *= -1;
        velocity.y *= -1;
        continue;
      }

      mote.x = nextX;
      mote.y = nextY;
    }
  }

  private drawPaintedLobbyGlow(scene: Phaser.Scene): void {
    const g = scene.add.graphics();
    // Soft warm accents near hauntable landmarks — shape + motion via motes,
    // not colour-only permanent labels.
    for (const prop of HAUNTABLE_PROPS) {
      const alpha = prop.visualKey === 'fireplace' ? 0.1 : 0.05;
      g.fillStyle(PALETTE.lampWarm, alpha);
      g.fillEllipse(prop.position.x, prop.position.y + 8, 120, 56);
    }
    this.container.add(g);
  }

  private drawLightPools(scene: Phaser.Scene): void {
    const g = scene.add.graphics();

    for (const prop of LOBBY_PROPS) {
      if (prop.kind !== 'lamp') continue;

      fillIsoDiamond(g, { x: prop.x, y: prop.y + 10, width: 300, depth: 140 }, PALETTE.lampWarm, 0.12);
      fillIsoDiamond(g, { x: prop.x, y: prop.y + 10, width: 190, depth: 88 }, PALETTE.lampWarm, 0.1);
    }

    this.container.add(g);

    for (const prop of LOBBY_PROPS) {
      if (prop.kind !== 'lamp') continue;

      const halo = scene.add.circle(prop.x, prop.y - 100, 46, PALETTE.lampWarm, 0.14);
      this.container.add(halo);
      scene.tweens.add({
        targets: halo,
        alpha: { from: 0.12, to: 0.22 },
        duration: 1900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }
  }

  private drawMoonWash(scene: Phaser.Scene): void {
    const g = scene.add.graphics();
    const pool = { x: FLOOR.centerX + 190, y: FLOOR.centerY - 60 };

    fillIsoDiamond(g, { x: pool.x, y: pool.y, width: 360, depth: 168 }, PALETTE.moonlight, 0.06);
    fillIsoDiamond(g, { x: pool.x - 20, y: pool.y + 40, width: 230, depth: 108 }, PALETTE.moonlight, 0.05);

    this.container.add(g);
  }

  private createMotes(scene: Phaser.Scene): void {
    const count = 14;

    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const spread = 0.55;
      const x = FLOOR.centerX + Math.cos(angle) * FLOOR.halfWidth * spread;
      const y = FLOOR.centerY + Math.sin(angle) * FLOOR.halfHeight * spread;

      const mote = scene.add.circle(x, y, Phaser.Math.Between(2, 3), 0xfff4d0, 0.32);
      this.motes.push(mote);
      this.moteVelocity.push({
        x: Phaser.Math.FloatBetween(-14, 14),
        y: Phaser.Math.FloatBetween(-8, 8),
      });
      this.container.add(mote);
    }
  }
}
