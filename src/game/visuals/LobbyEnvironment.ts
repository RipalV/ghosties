import Phaser from 'phaser';
import { floorCorners, floorDistance } from '../world/lobbyGeometry';
import {
  LOBBY_ART_KEY,
  lobbyArtTransform,
} from '../world/lobbyArtLayout';
import { FLOOR, WALL, WORLD } from '../world/lobbyLayout';
import {
  drawContactShadow,
  drawFaceSlots,
  drawIsoBox,
  drawIsoWall,
  fillIsoDiamond,
  pointAlongEdge,
  shadeColor,
  strokeIsoDiamond,
} from './isoDraw';
import {
  EXTERIOR,
  LOBBY_PROPS,
  PALETTE,
  SHADING,
  type LobbyPropDefinition,
} from './lobbyTheme';

interface EdgePoint {
  x: number;
  y: number;
}

/**
 * Static lobby presentation. Prefers the painted Crooked Moon lobby art so
 * furniture and hauntable landmarks match the design reference. Falls back to
 * the procedural isometric set if the texture is unavailable.
 */
export class LobbyEnvironment {
  readonly container: Phaser.GameObjects.Container;

  private readonly left: EdgePoint;
  private readonly back: EdgePoint;
  private readonly right: EdgePoint;
  private readonly front: EdgePoint;
  readonly usingPaintedLobby: boolean;

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(0);

    const [left, back, right, front] = floorCorners();
    this.left = left;
    this.back = back;
    this.right = right;
    this.front = front;

    this.usingPaintedLobby = scene.textures.exists(LOBBY_ART_KEY);
    if (this.usingPaintedLobby) {
      this.drawPaintedLobby(scene);
    } else {
      this.drawExterior(scene);
      this.drawFloor(scene);
      this.drawWalls(scene);
      this.drawWallDecor(scene);
      this.drawProps(scene);
    }
  }

  private drawPaintedLobby(scene: Phaser.Scene): void {
    const g = this.addGraphics(scene);
    g.fillStyle(PALETTE.nightSky, 1);
    g.fillRect(0, 0, WORLD.width, WORLD.height);

    const { scale, offsetX, offsetY } = lobbyArtTransform();
    const art = scene.add
      .image(WORLD.width / 2, WORLD.height / 2, LOBBY_ART_KEY)
      .setOrigin(0.5)
      .setScale(scale);
    // Keep the transform explicit for callers inspecting placement.
    art.setPosition(offsetX + art.displayWidth / 2, offsetY + art.displayHeight / 2);
    this.container.add(art);

    // Soft vignette so HUD edges stay readable without covering landmarks.
    const vignette = this.addGraphics(scene);
    vignette.fillStyle(0x0a0614, 0.28);
    vignette.fillRect(0, 0, WORLD.width, 48);
    vignette.fillRect(0, WORLD.height - 40, WORLD.width, 40);
    vignette.fillStyle(0x0a0614, 0.18);
    vignette.fillRect(0, 0, 36, WORLD.height);
    vignette.fillRect(WORLD.width - 36, 0, 36, WORLD.height);
  }

  private addGraphics(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    this.container.add(graphics);
    return graphics;
  }

  private drawExterior(scene: Phaser.Scene): void {
    const g = this.addGraphics(scene);

    g.fillStyle(PALETTE.nightSky, 1);
    g.fillRect(0, 0, WORLD.width, WORLD.height);

    const lot = {
      x: FLOOR.centerX,
      y: FLOOR.centerY,
      width: FLOOR.halfWidth * 2 * EXTERIOR.lotInset,
      depth: FLOOR.halfHeight * 2 * EXTERIOR.lotInset,
    };

    fillIsoDiamond(g, lot, PALETTE.lawn, 1);
    fillIsoDiamond(
      g,
      { x: lot.x, y: lot.y - 40, width: lot.width * 0.7, depth: lot.depth * 0.7 },
      PALETTE.lawnLight,
      0.35,
    );

    for (let step = 0; step < 3; step += 1) {
      fillIsoDiamond(
        g,
        {
          x: this.front.x,
          y: this.front.y + 16 + step * 15,
          width: EXTERIOR.pathWidth - step * 8,
          depth: 26 - step * 4,
        },
        step % 2 === 0 ? PALETTE.path : PALETTE.pathLight,
        1,
      );
    }

    strokeIsoDiamond(g, lot, PALETTE.hedge, EXTERIOR.hedgeThickness, 1);
    strokeIsoDiamond(g, lot, shadeColor(PALETTE.hedge, 1.3), 3, 0.7);

    for (const tree of EXTERIOR.trees) {
      this.drawTree(g, tree.x, tree.y, tree.scale);
    }
  }

  private drawTree(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    scale: number,
  ): void {
    g.fillStyle(PALETTE.treeTrunk, 1);
    g.fillRect(x - 6 * scale, y - 40 * scale, 12 * scale, 44 * scale);
    fillIsoDiamond(
      g,
      { x, y: y - 50 * scale, width: 90 * scale, depth: 40 * scale },
      PALETTE.treeDark,
      1,
    );
    fillIsoDiamond(
      g,
      { x, y: y - 78 * scale, width: 70 * scale, depth: 32 * scale },
      PALETTE.treeLight,
      1,
    );
  }

  private drawFloor(scene: Phaser.Scene): void {
    const g = this.addGraphics(scene);
    fillIsoDiamond(
      g,
      {
        x: FLOOR.centerX,
        y: FLOOR.centerY,
        width: FLOOR.halfWidth * 2,
        depth: FLOOR.halfHeight * 2,
      },
      PALETTE.floorDark,
      1,
    );

    for (let row = -6; row <= 6; row += 1) {
      for (let col = -6; col <= 6; col += 1) {
        const x = FLOOR.centerX + (col - row) * (FLOOR.tileWidth / 2);
        const y = FLOOR.centerY + (col + row) * (FLOOR.tileHeight / 2);
        if (floorDistance(x, y) > 0.97) continue;
        const light = (col + row) % 2 === 0;
        fillIsoDiamond(
          g,
          { x, y, width: FLOOR.tileWidth - 4, depth: FLOOR.tileHeight - 2 },
          light ? PALETTE.floorLight : PALETTE.floorDark,
          0.55,
        );
      }
    }
  }

  private drawWalls(scene: Phaser.Scene): void {
    const g = this.addGraphics(scene);
    drawIsoWall(g, this.left, this.back, WALL.height, PALETTE.wallLeft);
    drawIsoWall(g, this.back, this.right, WALL.height, PALETTE.wallRight);
    this.drawWallBand(g, this.left, this.back, 0, WALL.baseboardHeight, PALETTE.baseboard);
    this.drawWallBand(
      g,
      this.back,
      this.right,
      0,
      WALL.baseboardHeight,
      shadeColor(PALETTE.baseboard, SHADING.right),
    );
  }

  private drawWallBand(
    g: Phaser.GameObjects.Graphics,
    from: EdgePoint,
    to: EdgePoint,
    lift: number,
    height: number,
    color: number,
  ): void {
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(from.x, from.y - lift);
    g.lineTo(to.x, to.y - lift);
    g.lineTo(to.x, to.y - lift - height);
    g.lineTo(from.x, from.y - lift - height);
    g.closePath();
    g.fillPath();
  }

  private drawWallPanel(
    g: Phaser.GameObjects.Graphics,
    from: EdgePoint,
    to: EdgePoint,
    t: number,
    along: number,
    height: number,
    lift: number,
    color: number,
    alpha = 1,
  ): { start: EdgePoint; end: EdgePoint } {
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const halfSpan = along / 2 / length;
    const start = pointAlongEdge(from, to, t - halfSpan);
    const end = pointAlongEdge(from, to, t + halfSpan);

    g.fillStyle(color, alpha);
    g.beginPath();
    g.moveTo(start.x, start.y - lift);
    g.lineTo(end.x, end.y - lift);
    g.lineTo(end.x, end.y - lift - height);
    g.lineTo(start.x, start.y - lift - height);
    g.closePath();
    g.fillPath();

    return { start, end };
  }

  private drawWallDecor(scene: Phaser.Scene): void {
    const g = this.addGraphics(scene);
    const outer = this.drawWallPanel(g, this.left, this.back, 0.44, 168, 92, 52, PALETTE.wood);
    this.drawWallPanel(g, this.left, this.back, 0.445, 152, 78, 60, shadeColor(PALETTE.wood, 0.72));
    const canvas = this.drawWallPanel(g, this.left, this.back, 0.45, 128, 64, 68, 0x2c2148);
    this.drawWallPanel(g, this.left, this.back, 0.43, 50, 28, 92, PALETTE.moonlight, 0.22);
    const midX = (canvas.start.x + canvas.end.x) / 2;
    const midY = (canvas.start.y + canvas.end.y) / 2 - 68;
    g.fillStyle(PALETTE.noraSkin, 0.95);
    g.fillCircle(midX + 6, midY - 10, 11);
    g.fillStyle(shadeColor(PALETTE.sofa, 0.9), 0.95);
    g.fillEllipse(midX + 6, midY + 14, 28, 22);
    g.lineStyle(3, PALETTE.brass, 0.85);
    g.strokeLineShape(
      new Phaser.Geom.Line(outer.start.x, outer.start.y - 52, outer.end.x + 8, outer.end.y - 48),
    );

    this.drawWallPanel(g, this.back, this.right, 0.5, 190, 100, 44, PALETTE.wood);
    const pane = this.drawWallPanel(g, this.back, this.right, 0.5, 172, 84, 52, PALETTE.moonlight, 0.28);
    g.fillStyle(PALETTE.moon, 0.85);
    g.fillCircle((pane.start.x + pane.end.x) / 2 + 34, (pane.start.y + pane.end.y) / 2 - 104, 13);
    this.drawSconce(g, pointAlongEdge(this.left, this.back, 0.16), 96);
    this.drawSconce(g, pointAlongEdge(this.back, this.right, 0.84), 96);
  }

  private drawSconce(g: Phaser.GameObjects.Graphics, at: EdgePoint, lift: number): void {
    g.fillStyle(PALETTE.brass, 1);
    g.fillRect(at.x - 3, at.y - lift, 6, 16);
    g.fillStyle(PALETTE.lampWarm, 0.95);
    g.beginPath();
    g.moveTo(at.x - 9, at.y - lift - 18);
    g.lineTo(at.x + 9, at.y - lift - 18);
    g.lineTo(at.x + 17, at.y - lift + 2);
    g.lineTo(at.x - 17, at.y - lift + 2);
    g.closePath();
    g.fillPath();
  }

  private drawProps(scene: Phaser.Scene): void {
    const ordered = [...LOBBY_PROPS].sort((a, b) => a.y - b.y);
    for (const prop of ordered) {
      this.drawProp(this.addGraphics(scene), prop);
    }
  }

  private drawGrandPiano(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    const ebony = PALETTE.piano;
    drawContactShadow(g, { x: x - 10, y: y + 8, width: 240, depth: 130 });
    drawIsoBox(g, { x, y, width: 200, depth: 108, height: 48, color: ebony });
    drawIsoBox(g, {
      x: x + 48,
      y: y + 30,
      width: 108,
      depth: 48,
      height: 12,
      color: shadeColor(ebony, 0.9),
    });
    drawIsoBox(g, {
      x: x + 48,
      y: y + 24,
      width: 100,
      depth: 40,
      height: 6,
      color: PALETTE.pianoKeys,
      topColor: PALETTE.pianoKeys,
    });
    drawIsoBox(g, { x: x + 30, y: y + 78, width: 70, depth: 34, height: 22, color: PALETTE.wood });
  }

  private drawProp(g: Phaser.GameObjects.Graphics, prop: LobbyPropDefinition): void {
    const { x, y } = prop;

    switch (prop.kind) {
      case 'rug':
        fillIsoDiamond(g, { x, y, width: 300, depth: 140 }, PALETTE.rug, 0.9);
        strokeIsoDiamond(g, { x, y, width: 300, depth: 140 }, PALETTE.rugTrim, 4, 0.8);
        break;
      case 'reception': {
        const rack = { x: x - 16, y: y - 78, width: 150, depth: 32, height: 82, color: PALETTE.wood };
        drawContactShadow(g, rack);
        drawIsoBox(g, rack);
        drawFaceSlots(g, rack, 6, 3, shadeColor(PALETTE.wood, 0.42));
        drawContactShadow(g, { x, y, width: 210, depth: 100 });
        drawIsoBox(g, { x, y, width: 196, depth: 94, height: 54, color: PALETTE.reception });
        drawIsoBox(g, { x, y: y - 54, width: 214, depth: 104, height: 10, color: PALETTE.woodLight });
        g.fillStyle(PALETTE.brass, 1);
        g.fillEllipse(x + 54, y - 82, 22, 16);
        break;
      }
      case 'sofa':
        drawContactShadow(g, { x, y, width: 196, depth: 100 });
        drawIsoBox(g, { x, y, width: 186, depth: 90, height: 26, color: PALETTE.sofa });
        drawIsoBox(g, {
          x: x - 10,
          y: y - 34,
          width: 160,
          depth: 42,
          height: 58,
          color: shadeColor(PALETTE.sofa, 0.88),
        });
        break;
      case 'armchair':
        drawContactShadow(g, { x, y, width: 104, depth: 62 });
        drawIsoBox(g, { x, y, width: 104, depth: 62, height: 30, color: PALETTE.chair });
        break;
      case 'fireplace':
        drawContactShadow(g, { x, y, width: 150, depth: 78 });
        drawIsoBox(g, { x, y, width: 140, depth: 70, height: 70, color: shadeColor(PALETTE.wood, 0.7) });
        drawIsoBox(g, { x, y: y - 70, width: 158, depth: 78, height: 12, color: PALETTE.woodLight });
        break;
      case 'piano':
        this.drawGrandPiano(g, x, y);
        break;
      case 'table':
        drawContactShadow(g, { x, y, width: 118, depth: 62 });
        drawIsoBox(g, { x, y: y - 34, width: 118, depth: 62, height: 10, color: PALETTE.woodLight });
        break;
      case 'clock':
        drawContactShadow(g, { x, y, width: 60, depth: 34 });
        drawIsoBox(g, { x, y, width: 56, depth: 32, height: 128, color: PALETTE.clock });
        g.fillStyle(PALETTE.pianoKeys, 0.92);
        g.fillCircle(x, y - 118, 17);
        break;
      case 'trolley':
        drawContactShadow(g, { x, y, width: 104, depth: 60 });
        drawIsoBox(g, { x, y: y - 18, width: 96, depth: 56, height: 12, color: PALETTE.trolley });
        break;
      case 'plant':
        drawContactShadow(g, { x, y, width: 64, depth: 34 });
        drawIsoBox(g, { x, y, width: 56, depth: 32, height: 36, color: PALETTE.plantPot });
        fillIsoDiamond(g, { x, y, width: 80, depth: 36 }, PALETTE.plantLeaf, 1, 48);
        break;
      case 'lamp':
        drawContactShadow(g, { x, y, width: 52, depth: 28 });
        drawIsoBox(g, { x, y: y - 8, width: 7, depth: 7, height: 74, color: PALETTE.brass });
        break;
      default:
        break;
    }
  }
}
