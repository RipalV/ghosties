import Phaser from 'phaser';
import { LOBBY_PROPS, PALETTE, ROOM, type LobbyPropDefinition } from './lobbyTheme';

/** Draws the static haunted-hotel lobby: walls, floor, furniture, and props. */
export class LobbyEnvironment {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(0);
    this.drawBackdrop(scene);
    this.drawWalls(scene);
    this.drawFloor(scene);
    this.drawWindow(scene);
    for (const prop of LOBBY_PROPS) {
      this.drawProp(scene, prop);
    }
  }

  private drawBackdrop(scene: Phaser.Scene): void {
    const g = scene.add.graphics();
    g.fillStyle(PALETTE.nightSky, 1);
    g.fillRect(0, 0, ROOM.width, ROOM.artHeight);
    this.container.add(g);
  }

  private drawWalls(scene: Phaser.Scene): void {
    const g = scene.add.graphics();

    // Back wall panel
    g.fillStyle(PALETTE.wall, 1);
    g.fillRoundedRect(40, 48, 880, 90, 12);
    g.lineStyle(3, PALETTE.wallTrim, 0.9);
    g.strokeRoundedRect(40, 48, 880, 90, 12);

    // Soft wallpaper diamonds
    g.lineStyle(1, PALETTE.wallpaperAccent, 0.35);
    for (let x = 70; x < 900; x += 48) {
      for (let y = 62; y < 120; y += 28) {
        g.strokeCircle(x + ((y / 28) % 2) * 12, y, 6);
      }
    }

    // Side walls
    g.fillStyle(PALETTE.wall, 1);
    g.fillRoundedRect(28, 130, 48, 340, 10);
    g.fillRoundedRect(884, 130, 48, 340, 10);
    g.lineStyle(3, PALETTE.wallTrim, 0.85);
    g.strokeRoundedRect(28, 130, 48, 340, 10);
    g.strokeRoundedRect(884, 130, 48, 340, 10);

    // Baseboards
    g.fillStyle(PALETTE.wood, 1);
    g.fillRect(76, 455, 808, 14);
    g.lineStyle(2, PALETTE.woodLight, 0.7);
    g.strokeRect(76, 455, 808, 14);

    this.container.add(g);
  }

  private drawFloor(scene: Phaser.Scene): void {
    const g = scene.add.graphics();
    const tileWidth = 78;
    const tileHeight = 38;

    for (let row = -1; row < 11; row += 1) {
      for (let column = -2; column < 14; column += 1) {
        const x = 480 + (column - row) * (tileWidth / 2);
        const y = 118 + (column + row) * (tileHeight / 2);
        if (y < 112 || y > 460 || x < 70 || x > 890) continue;

        const light = (row + column) % 2 === 0;
        g.fillStyle(light ? PALETTE.floorLight : PALETTE.floorDark, 1);
        g.lineStyle(1, PALETTE.floorLine, 0.55);
        g.beginPath();
        g.moveTo(x, y - tileHeight / 2);
        g.lineTo(x + tileWidth / 2, y);
        g.lineTo(x, y + tileHeight / 2);
        g.lineTo(x - tileWidth / 2, y);
        g.closePath();
        g.fillPath();
        g.strokePath();
      }
    }

    this.container.add(g);
  }

  private drawWindow(scene: Phaser.Scene): void {
    const g = scene.add.graphics();
    const wx = 470;
    const wy = 78;

    g.fillStyle(PALETTE.moonlight, 0.22);
    g.fillRoundedRect(wx - 70, wy - 28, 140, 52, 8);
    g.lineStyle(3, PALETTE.wallTrim, 0.95);
    g.strokeRoundedRect(wx - 70, wy - 28, 140, 52, 8);
    g.lineStyle(2, PALETTE.moonlight, 0.5);
    g.lineBetween(wx, wy - 28, wx, wy + 24);
    g.lineBetween(wx - 70, wy, wx + 70, wy);

    // Moon disc
    g.fillStyle(0xf0f4ff, 0.85);
    g.fillCircle(wx + 28, wy - 6, 10);
    g.fillStyle(PALETTE.nightSky, 0.35);
    g.fillCircle(wx + 32, wy - 8, 7);

    this.container.add(g);
  }

  private drawProp(scene: Phaser.Scene, prop: LobbyPropDefinition): void {
    const g = scene.add.graphics();
    const { x, y } = prop;

    switch (prop.kind) {
      case 'sofa':
        g.fillStyle(PALETTE.sofa, 1);
        g.fillRoundedRect(x - 58, y - 22, 116, 44, 12);
        g.fillRoundedRect(x - 58, y - 34, 28, 24, 8);
        g.fillRoundedRect(x + 30, y - 34, 28, 24, 8);
        g.lineStyle(3, PALETTE.sofaTrim, 0.95);
        g.strokeRoundedRect(x - 58, y - 22, 116, 44, 12);
        break;
      case 'piano':
        g.fillStyle(PALETTE.piano, 1);
        g.fillRoundedRect(x - 68, y - 26, 136, 52, 8);
        g.fillStyle(PALETTE.pianoKeys, 1);
        g.fillRoundedRect(x - 52, y - 4, 104, 18, 4);
        g.lineStyle(2, PALETTE.wallTrim, 0.9);
        g.strokeRoundedRect(x - 68, y - 26, 136, 52, 8);
        break;
      case 'chair':
        g.fillStyle(PALETTE.chair, 1);
        g.fillRoundedRect(x - 34, y - 18, 68, 40, 8);
        g.fillRoundedRect(x - 34, y - 36, 68, 18, 6);
        g.lineStyle(2, 0xa98e91, 0.9);
        g.strokeRoundedRect(x - 34, y - 18, 68, 40, 8);
        break;
      case 'reception':
        g.fillStyle(PALETTE.reception, 1);
        g.fillRoundedRect(x - 62, y - 22, 124, 48, 8);
        g.fillStyle(PALETTE.woodLight, 1);
        g.fillRect(x - 50, y - 8, 100, 8);
        g.lineStyle(3, PALETTE.receptionTrim, 0.95);
        g.strokeRoundedRect(x - 62, y - 22, 124, 48, 8);
        break;
      case 'lamp':
        g.fillStyle(PALETTE.wood, 1);
        g.fillRect(x - 4, y - 8, 8, 36);
        g.fillStyle(PALETTE.lampWarm, 0.95);
        g.fillTriangle(x - 18, y - 8, x + 18, y - 8, x, y - 36);
        g.lineStyle(2, 0xffe0a0, 0.7);
        g.strokeTriangle(x - 18, y - 8, x + 18, y - 8, x, y - 36);
        break;
      case 'plant':
        g.fillStyle(PALETTE.wood, 1);
        g.fillRoundedRect(x - 14, y + 8, 28, 18, 4);
        g.fillStyle(0x4e8a5a, 1);
        g.fillCircle(x, y - 6, 16);
        g.fillCircle(x - 12, y + 2, 10);
        g.fillCircle(x + 12, y + 2, 10);
        break;
      case 'painting':
        g.fillStyle(0x2a1f40, 1);
        g.fillRoundedRect(x - 36, y - 22, 72, 40, 4);
        g.lineStyle(3, PALETTE.woodLight, 0.9);
        g.strokeRoundedRect(x - 36, y - 22, 72, 40, 4);
        g.fillStyle(PALETTE.moonlight, 0.35);
        g.fillCircle(x + 8, y - 6, 8);
        g.fillStyle(0x6a8a5a, 0.5);
        g.fillTriangle(x - 20, y + 10, x - 4, y - 8, x + 12, y + 10);
        break;
      default:
        break;
    }

    this.container.add(g);

    if (prop.label) {
      const label = scene.add.text(x, y + 28, prop.label, {
        fontFamily: 'Trebuchet MS',
        fontSize: '13px',
        color: '#f6d6ab',
        backgroundColor: '#2a1a38aa',
        padding: { x: 6, y: 2 },
      }).setOrigin(0.5);
      this.container.add(label);
    }
  }
}
