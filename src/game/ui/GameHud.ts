import Phaser from 'phaser';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';

export interface HudSnapshot {
  score: number;
  energy: number;
  fear: number;
  stage: string;
}

/** Landscape-friendly HUD: score/objective left, fear/energy right, status mid-bottom. */
export class GameHud {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly fearText: Phaser.GameObjects.Text;
  private readonly energyText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly leftPanel: Phaser.GameObjects.Rectangle;
  private readonly rightPanel: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    const depth = 100;
    const { leftX, rightX, topY, statusY } = HUD_LAYOUT;

    this.leftPanel = scene.add.rectangle(leftX + 150, topY + 36, 300, 72, PALETTE.hudPanel, 0.82)
      .setStrokeStyle(2, PALETTE.hudStroke, 0.85)
      .setOrigin(0.5)
      .setDepth(depth)
      .setScrollFactor(0);

    this.rightPanel = scene.add.rectangle(rightX - 140, topY + 36, 280, 72, PALETTE.hudPanel, 0.82)
      .setStrokeStyle(2, PALETTE.hudStroke, 0.85)
      .setOrigin(0.5)
      .setDepth(depth)
      .setScrollFactor(0);

    this.scoreText = scene.add.text(leftX + 16, topY + 10, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#fff7cf',
      fontStyle: 'bold',
    }).setDepth(depth + 1).setScrollFactor(0);

    scene.add.text(leftX + 16, topY + 38, 'Haunt Nora (gently!)', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#d8cef7',
    }).setDepth(depth + 1).setScrollFactor(0);

    this.fearText = scene.add.text(rightX - 16, topY + 10, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#fff7cf',
      align: 'right',
    }).setOrigin(1, 0).setDepth(depth + 1).setScrollFactor(0);

    this.energyText = scene.add.text(rightX - 16, topY + 38, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#d8cef7',
      align: 'right',
    }).setOrigin(1, 0).setDepth(depth + 1).setScrollFactor(0);

    this.statusText = scene.add.text(480, statusY, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#fff7cf',
      align: 'center',
      wordWrap: { width: 820 },
      backgroundColor: '#241836cc',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(depth + 1).setScrollFactor(0);
  }

  setStatus(message: string): void {
    this.statusText.setText(message);
  }

  update(snapshot: HudSnapshot): void {
    this.scoreText.setText(`Score ${snapshot.score}`);
    this.fearText.setText(`Nora · ${snapshot.stage.toUpperCase()}`);
    this.energyText.setText(`Fear ${snapshot.fear}/100 · Energy ${snapshot.energy}`);
  }

  onResize(): void {
    this.leftPanel.setVisible(true);
    this.rightPanel.setVisible(true);
  }
}
