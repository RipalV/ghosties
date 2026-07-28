import Phaser from 'phaser';
import { PALETTE } from './lobbyTheme';

/**
 * Full-viewport night backdrop drawn behind the lobby so the game reads as
 * edge-to-edge on any screen ratio instead of showing letterbox bars.
 */
export class SceneBackdrop {
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics().setDepth(-10).setScrollFactor(0);
  }

  resize(width: number, height: number): void {
    const g = this.graphics;
    g.clear();

    g.fillStyle(PALETTE.nightSky, 1);
    g.fillRect(0, 0, width, height);

    g.fillStyle(0x2b2154, 0.55);
    g.fillEllipse(width / 2, height * 0.34, width * 1.25, height * 0.95);

    g.fillStyle(0x120d22, 0.4);
    g.fillRect(0, height * 0.82, width, height * 0.18);
  }
}
