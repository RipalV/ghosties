import Phaser from 'phaser';
import { floorCorners, floorDistance } from '../world/lobbyGeometry';
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
 * Draws the static lobby: night-time exterior, isometric floor, the two far
 * cutaway walls, and volumetric furniture. Nothing here carries a text label —
 * props are recognised by silhouette.
 */
export class LobbyEnvironment {
  readonly container: Phaser.GameObjects.Container;

  private readonly left: EdgePoint;
  private readonly back: EdgePoint;
  private readonly right: EdgePoint;
  private readonly front: EdgePoint;

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(0);

    const [left, back, right, front] = floorCorners();
    this.left = left;
    this.back = back;
    this.right = right;
    this.front = front;

    this.drawExterior(scene);
    this.drawFloor(scene);
    this.drawWalls(scene);
    this.drawWallDecor(scene);
    this.drawProps(scene);
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

    // Garden path leading to the lobby entrance at the front corner.
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

    this.drawFencePosts(g, lot);
    EXTERIOR.trees.forEach((tree) => this.drawTree(g, tree.x, tree.y, tree.scale));
  }

  private drawFencePosts(
    g: Phaser.GameObjects.Graphics,
    lot: { x: number; y: number; width: number; depth: number },
  ): void {
    const corners: EdgePoint[] = [
      { x: lot.x - lot.width / 2, y: lot.y },
      { x: lot.x, y: lot.y - lot.depth / 2 },
      { x: lot.x + lot.width / 2, y: lot.y },
      { x: lot.x, y: lot.y + lot.depth / 2 },
    ];

    for (let index = 0; index < corners.length; index += 1) {
      const from = corners[index];
      const to = corners[(index + 1) % corners.length];

      for (let t = 0.06; t < 0.99; t += 0.12) {
        const point = pointAlongEdge(from, to, t);
        drawIsoBox(g, {
          x: point.x,
          y: point.y,
          width: 12,
          depth: 8,
          height: 26,
          color: PALETTE.fence,
        });
      }
    }
  }

  private drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number): void {
    drawContactShadow(g, { x, y, width: 74 * scale, depth: 30 * scale }, 1);

    drawIsoBox(g, {
      x,
      y,
      width: 16 * scale,
      depth: 10 * scale,
      height: 34 * scale,
      color: PALETTE.treeTrunk,
    });

    for (let tier = 0; tier < 3; tier += 1) {
      const lift = 34 * scale + tier * 30 * scale;
      const width = (86 - tier * 22) * scale;
      fillIsoDiamond(
        g,
        { x, y, width, depth: width * 0.45 },
        tier % 2 === 0 ? PALETTE.treeDark : PALETTE.treeLight,
        1,
        lift,
      );
    }
  }

  private drawFloor(scene: Phaser.Scene): void {
    const g = this.addGraphics(scene);
    const floor = {
      x: FLOOR.centerX,
      y: FLOOR.centerY,
      width: FLOOR.halfWidth * 2,
      depth: FLOOR.halfHeight * 2,
    };

    fillIsoDiamond(g, floor, PALETTE.floorDark, 1);

    const halfTileWidth = FLOOR.tileWidth / 2;
    const halfTileHeight = FLOOR.tileHeight / 2;
    const span = Math.ceil(FLOOR.halfWidth / halfTileWidth) + 2;

    for (let row = -span; row <= span; row += 1) {
      for (let column = -span; column <= span; column += 1) {
        const x = FLOOR.centerX + (column - row) * halfTileWidth;
        const y = FLOOR.centerY + (column + row) * halfTileHeight;
        if (floorDistance(x, y) > 0.97) continue;

        fillIsoDiamond(
          g,
          { x, y, width: FLOOR.tileWidth - 3, depth: FLOOR.tileHeight - 2 },
          (row + column) % 2 === 0 ? PALETTE.floorLight : PALETTE.floorDark,
          1,
        );
      }
    }

    strokeIsoDiamond(g, floor, PALETTE.floorLine, 3, 0.8);
  }

  private drawWalls(scene: Phaser.Scene): void {
    const g = this.addGraphics(scene);

    // Only the two far walls are drawn, so nothing hides behind a near wall.
    drawIsoWall(g, this.left, this.back, WALL.height, PALETTE.wallLeft);
    drawIsoWall(g, this.back, this.right, WALL.height, PALETTE.wallRight);

    this.drawWallpaper(g, this.left, this.back, PALETTE.wallLeft);
    this.drawWallpaper(g, this.back, this.right, PALETTE.wallRight);

    // Top trim and baseboards give each wall a readable thickness.
    g.lineStyle(4, PALETTE.wallTrim, 0.95);
    g.beginPath();
    g.moveTo(this.left.x, this.left.y - WALL.height);
    g.lineTo(this.back.x, this.back.y - WALL.height);
    g.lineTo(this.right.x, this.right.y - WALL.height);
    g.strokePath();

    this.drawWallBand(g, this.left, this.back, 0, WALL.baseboardHeight, PALETTE.baseboard);
    this.drawWallBand(g, this.back, this.right, 0, WALL.baseboardHeight, shadeColor(PALETTE.baseboard, SHADING.right));
  }

  private drawWallpaper(
    g: Phaser.GameObjects.Graphics,
    from: EdgePoint,
    to: EdgePoint,
    base: number,
  ): void {
    g.fillStyle(shadeColor(base, 1.35), 0.3);
    for (let t = 0.05; t < 0.98; t += 0.055) {
      const point = pointAlongEdge(from, to, t);
      for (let level = 0; level < 3; level += 1) {
        const lift = 34 + level * 38;
        g.fillCircle(point.x, point.y - lift, 5);
      }
    }
  }

  /** Fills a horizontal band across a wall, following the wall's isometric skew. */
  private drawWallBand(
    g: Phaser.GameObjects.Graphics,
    from: EdgePoint,
    to: EdgePoint,
    lift: number,
    thickness: number,
    color: number,
  ): void {
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(from.x, from.y - lift);
    g.lineTo(to.x, to.y - lift);
    g.lineTo(to.x, to.y - lift - thickness);
    g.lineTo(from.x, from.y - lift - thickness);
    g.closePath();
    g.fillPath();
  }

  /** Draws a rectangle that sits flat on a wall, skewed to match it. */
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

    // Framed painting on the left wall.
    const frame = this.drawWallPanel(g, this.left, this.back, 0.45, 150, 84, 46, PALETTE.wood);
    this.drawWallPanel(g, this.left, this.back, 0.45, 132, 68, 54, 0x2a1f40);
    this.drawWallPanel(g, this.left, this.back, 0.42, 60, 34, 70, PALETTE.moonlight, 0.3);
    g.lineStyle(2, PALETTE.woodLight, 0.8);
    g.strokeLineShape(
      new Phaser.Geom.Line(frame.start.x, frame.start.y - 46, frame.end.x, frame.end.y - 46),
    );

    // Moonlit window on the right wall.
    this.drawWallPanel(g, this.back, this.right, 0.5, 190, 100, 44, PALETTE.wood);
    const pane = this.drawWallPanel(g, this.back, this.right, 0.5, 172, 84, 52, PALETTE.moonlight, 0.28);
    g.fillStyle(PALETTE.moon, 0.85);
    g.fillCircle((pane.start.x + pane.end.x) / 2 + 34, (pane.start.y + pane.end.y) / 2 - 104, 13);
    g.fillStyle(PALETTE.moonlight, 0.5);
    g.lineStyle(3, PALETTE.wallTrim, 0.9);
    g.strokeLineShape(
      new Phaser.Geom.Line(
        (pane.start.x + pane.end.x) / 2,
        (pane.start.y + pane.end.y) / 2 - 52,
        (pane.start.x + pane.end.x) / 2,
        (pane.start.y + pane.end.y) / 2 - 136,
      ),
    );

    // Wall sconces, one per wall.
    this.drawSconce(g, pointAlongEdge(this.left, this.back, 0.16), 96);
    this.drawSconce(g, pointAlongEdge(this.back, this.right, 0.84), 96);
  }

  private drawSconce(g: Phaser.GameObjects.Graphics, at: EdgePoint, lift: number): void {
    g.fillStyle(PALETTE.brass, 1);
    g.fillRect(at.x - 3, at.y - lift, 6, 16);

    // A shade that widens downward, so it reads as a wall light.
    g.fillStyle(PALETTE.lampWarm, 0.95);
    g.beginPath();
    g.moveTo(at.x - 9, at.y - lift - 18);
    g.lineTo(at.x + 9, at.y - lift - 18);
    g.lineTo(at.x + 17, at.y - lift + 2);
    g.lineTo(at.x - 17, at.y - lift + 2);
    g.closePath();
    g.fillPath();

    g.fillStyle(PALETTE.lampWarm, 0.16);
    g.fillEllipse(at.x, at.y - lift + 24, 60, 44);
  }

  private drawProps(scene: Phaser.Scene): void {
    const ordered = [...LOBBY_PROPS].sort((a, b) => a.y - b.y);
    for (const prop of ordered) {
      this.drawProp(this.addGraphics(scene), prop);
    }
  }

  private drawProp(g: Phaser.GameObjects.Graphics, prop: LobbyPropDefinition): void {
    const { x, y } = prop;

    switch (prop.kind) {
      case 'rug':
        fillIsoDiamond(g, { x, y, width: 300, depth: 140 }, PALETTE.rug, 0.9);
        strokeIsoDiamond(g, { x, y, width: 300, depth: 140 }, PALETTE.rugTrim, 4, 0.8);
        strokeIsoDiamond(g, { x, y, width: 230, depth: 106 }, PALETTE.rugTrim, 2, 0.5);
        break;

      case 'reception': {
        // A key rack behind the counter is what separates a reception desk from
        // any other block of furniture, so it is drawn first and stands tallest.
        const rack = { x: x - 12, y: y - 74, width: 138, depth: 28, height: 76, color: PALETTE.wood };
        drawContactShadow(g, rack);
        drawIsoBox(g, rack);
        // Many small pigeonholes, so the rack does not read as a windowed facade.
        drawFaceSlots(g, rack, 6, 3, shadeColor(PALETTE.wood, 0.42));

        drawContactShadow(g, { x, y, width: 200, depth: 96 });
        drawIsoBox(g, { x, y, width: 186, depth: 90, height: 58, color: PALETTE.reception });
        // Overhanging counter top, then the guest bell and an open ledger on it.
        drawIsoBox(g, { x, y: y - 58, width: 206, depth: 100, height: 9, color: PALETTE.woodLight });
        drawIsoBox(g, { x: x + 54, y: y - 67, width: 24, depth: 16, height: 7, color: PALETTE.brass });
        g.fillStyle(PALETTE.brass, 1);
        g.fillCircle(x + 54, y - 81, 8);
        drawIsoBox(g, { x: x - 46, y: y - 67, width: 46, depth: 28, height: 5, color: PALETTE.pianoKeys });
        break;
      }

      case 'sofa':
        drawContactShadow(g, { x, y, width: 186, depth: 92 });
        drawIsoBox(g, { x, y, width: 176, depth: 84, height: 22, color: PALETTE.sofa });
        // Backrest sits behind the seat so the silhouette reads as a couch.
        drawIsoBox(g, { x: x - 12, y: y - 30, width: 150, depth: 46, height: 52, color: shadeColor(PALETTE.sofa, 0.86) });
        drawIsoBox(g, { x: x - 68, y: y + 4, width: 38, depth: 30, height: 36, color: PALETTE.sofa });
        drawIsoBox(g, { x: x + 68, y: y + 4, width: 38, depth: 30, height: 36, color: PALETTE.sofa });
        fillIsoDiamond(g, { x: x - 30, y: y - 6, width: 62, depth: 30 }, shadeColor(PALETTE.sofa, 1.25), 0.9, 22);
        fillIsoDiamond(g, { x: x + 26, y: y + 6, width: 62, depth: 30 }, shadeColor(PALETTE.sofa, 1.25), 0.9, 22);
        break;

      case 'armchair':
        drawContactShadow(g, { x, y, width: 104, depth: 62 });
        drawIsoBox(g, { x, y, width: 104, depth: 62, height: 30, color: PALETTE.chair });
        drawIsoBox(g, { x: x - 4, y: y - 18, width: 84, depth: 40, height: 44, color: shadeColor(PALETTE.chair, 0.9) });
        break;

      case 'piano':
        drawContactShadow(g, { x, y, width: 210, depth: 110 });
        drawIsoBox(g, { x, y, width: 196, depth: 100, height: 72, color: PALETTE.piano });
        // Raised lid, then the keyboard along the near-right edge.
        fillIsoDiamond(g, { x: x - 10, y: y - 16, width: 176, depth: 88 }, shadeColor(PALETTE.piano, 1.35), 1, 84);
        drawIsoBox(g, {
          x: x + 38,
          y: y + 26,
          width: 96,
          depth: 44,
          height: 10,
          color: PALETTE.pianoKeys,
          topColor: PALETTE.pianoKeys,
        });
        g.lineStyle(2, shadeColor(PALETTE.piano, 0.7), 0.9);
        for (let key = -3; key <= 3; key += 1) {
          g.strokeLineShape(
            new Phaser.Geom.Line(x + 38 + key * 11, y + 16 - key * 5, x + 38 + key * 11 + 20, y + 26 - key * 5),
          );
        }
        drawIsoBox(g, { x: x + 22, y: y + 74, width: 66, depth: 32, height: 26, color: PALETTE.wood });
        break;

      case 'table':
        drawContactShadow(g, { x, y, width: 118, depth: 62 });
        drawIsoBox(g, { x, y, width: 40, depth: 24, height: 34, color: PALETTE.wood });
        drawIsoBox(g, { x, y: y - 34, width: 118, depth: 62, height: 10, color: PALETTE.woodLight });
        break;

      case 'clock':
        drawContactShadow(g, { x, y, width: 60, depth: 34 });
        drawIsoBox(g, { x, y, width: 56, depth: 32, height: 128, color: PALETTE.clock });
        g.fillStyle(PALETTE.pianoKeys, 0.92);
        g.fillCircle(x, y - 118, 17);
        g.lineStyle(3, PALETTE.clock, 1);
        g.strokeLineShape(new Phaser.Geom.Line(x, y - 118, x, y - 128));
        g.strokeLineShape(new Phaser.Geom.Line(x, y - 118, x + 9, y - 116));
        break;

      case 'trolley': {
        drawContactShadow(g, { x, y, width: 104, depth: 60 });
        // Wheels rest on the floor and the deck rides above them, then an
        // inverted-U frame gives the cart its bell-hop silhouette.
        g.fillStyle(shadeColor(PALETTE.trolley, 0.45), 1);
        g.fillEllipse(x - 26, y + 8, 24, 14);
        g.fillEllipse(x + 26, y + 8, 24, 14);
        drawIsoBox(g, { x, y: y - 18, width: 96, depth: 56, height: 12, color: PALETTE.trolley });

        // The frame stays just above the luggage so the cart does not read as an
        // empty rack, and its uprights are dimmed so brass never dominates.
        const deckTop = y - 30;
        const frame = shadeColor(PALETTE.brass, 0.82);
        drawIsoBox(g, { x: x - 30, y: deckTop - 4, width: 8, depth: 8, height: 74, color: frame });
        drawIsoBox(g, { x: x + 30, y: deckTop - 4, width: 8, depth: 8, height: 74, color: frame });
        drawIsoBox(g, { x, y: deckTop - 78, width: 70, depth: 10, height: 7, color: frame });

        drawIsoBox(g, { x: x - 4, y: deckTop + 10, width: 86, depth: 50, height: 36, color: PALETTE.wood });
        g.lineStyle(3, shadeColor(PALETTE.wood, 0.5), 0.9);
        g.strokeLineShape(new Phaser.Geom.Line(x - 25, deckTop + 26, x - 25, deckTop + 2));
        drawIsoBox(g, {
          x: x + 2,
          y: deckTop - 14,
          width: 62,
          depth: 36,
          height: 26,
          color: shadeColor(PALETTE.wood, 1.14),
        });
        break;
      }

      case 'plant':
        drawContactShadow(g, { x, y, width: 64, depth: 34 });
        drawIsoBox(g, { x, y, width: 56, depth: 32, height: 36, color: PALETTE.plantPot });
        for (let tier = 0; tier < 3; tier += 1) {
          fillIsoDiamond(
            g,
            { x, y, width: 92 - tier * 20, depth: (92 - tier * 20) * 0.45 },
            tier % 2 === 0 ? PALETTE.plantLeaf : shadeColor(PALETTE.plantLeaf, 0.82),
            1,
            40 + tier * 24,
          );
        }
        break;

      case 'lamp': {
        drawContactShadow(g, { x, y, width: 52, depth: 28 });
        drawIsoBox(g, { x, y, width: 40, depth: 24, height: 8, color: PALETTE.brass });
        drawIsoBox(g, { x, y: y - 8, width: 7, depth: 7, height: 74, color: PALETTE.brass });

        // A tapered shade, wider at the bottom, so the lamp is not a spike.
        const shadeBottom = y - 82;
        const shadeTop = shadeBottom - 34;
        g.fillStyle(PALETTE.lampWarm, 0.95);
        g.beginPath();
        g.moveTo(x - 30, shadeBottom);
        g.lineTo(x + 30, shadeBottom);
        g.lineTo(x + 19, shadeTop);
        g.lineTo(x - 19, shadeTop);
        g.closePath();
        g.fillPath();
        fillIsoDiamond(g, { x, y: shadeTop, width: 38, depth: 17 }, shadeColor(PALETTE.lampWarm, 1.12), 1);
        fillIsoDiamond(g, { x, y: shadeBottom, width: 60, depth: 27 }, shadeColor(PALETTE.lampWarm, 0.78), 1);
        break;
      }

      default:
        break;
    }
  }
}
