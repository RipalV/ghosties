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

    // Crooked portrait on the left wall — readable frame, canvas, and a tiny face.
    // Slightly skewed t-span so it reads as hung askew (hauntable Whisper prop).
    const outer = this.drawWallPanel(g, this.left, this.back, 0.44, 168, 92, 52, PALETTE.wood);
    this.drawWallPanel(g, this.left, this.back, 0.445, 152, 78, 60, shadeColor(PALETTE.wood, 0.72));
    const canvas = this.drawWallPanel(g, this.left, this.back, 0.45, 128, 64, 68, 0x2c2148);
    // Soft moonlight wash + a simple painted figure so it is clearly a portrait.
    this.drawWallPanel(g, this.left, this.back, 0.43, 50, 28, 92, PALETTE.moonlight, 0.22);
    const midX = (canvas.start.x + canvas.end.x) / 2;
    const midY = (canvas.start.y + canvas.end.y) / 2 - 68;
    g.fillStyle(PALETTE.noraSkin, 0.95);
    g.fillCircle(midX + 6, midY - 10, 11);
    g.fillStyle(shadeColor(PALETTE.sofa, 0.9), 0.95);
    g.fillEllipse(midX + 6, midY + 14, 28, 22);
    g.fillStyle(PALETTE.woodLight, 0.55);
    g.fillCircle(midX - 18, midY + 6, 5);
    g.lineStyle(3, PALETTE.brass, 0.85);
    g.strokeLineShape(
      new Phaser.Geom.Line(outer.start.x, outer.start.y - 52, outer.end.x + 8, outer.end.y - 48),
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

  /**
   * Storybook grand piano: wing case, open lid, readable keyboard, legs, bench.
   * Drawn with custom polygons so it never reads as a purple packing crate.
   */
  private drawGrandPiano(g: Phaser.GameObjects.Graphics, x: number, y: number): void {
    const ebony = PALETTE.piano;
    const rim = PALETTE.pianoHighlight;
    const bodyH = 44;

    drawContactShadow(g, { x: x - 10, y: y + 8, width: 240, depth: 130 });

    // Three tapered legs with brass cups — landmark of a grand, not a box.
    const legs: readonly { lx: number; ly: number }[] = [
      { lx: x - 70, ly: y - 10 },
      { lx: x + 55, ly: y - 28 },
      { lx: x + 70, ly: y + 42 },
    ];
    for (const { lx, ly } of legs) {
      g.fillStyle(shadeColor(ebony, 0.85), 1);
      g.fillTriangle(lx - 5, ly, lx + 5, ly, lx, ly - bodyH - 4);
      g.fillStyle(PALETTE.brass, 0.95);
      g.fillEllipse(lx, ly + 2, 14, 7);
    }

    // Wing footprint (top of case): wide at the keyboard, tapering to the tail.
    const wingTop = [
      [x - 110, y - 8 - bodyH],
      [x - 40, y - 58 - bodyH],
      [x + 30, y - 62 - bodyH],
      [x + 95, y - 20 - bodyH],
      [x + 100, y + 28 - bodyH],
      [x + 40, y + 52 - bodyH],
      [x - 50, y + 40 - bodyH],
    ] as const;
    const wingBase = wingTop.map(([wx, wy]) => [wx, wy + bodyH] as const);

    // Side skirts of the wing.
    g.fillStyle(shadeColor(ebony, SHADING.left), 1);
    g.beginPath();
    g.moveTo(wingBase[0][0], wingBase[0][1]);
    g.lineTo(wingTop[0][0], wingTop[0][1]);
    g.lineTo(wingTop[1][0], wingTop[1][1]);
    g.lineTo(wingTop[2][0], wingTop[2][1]);
    g.lineTo(wingBase[2][0], wingBase[2][1]);
    g.lineTo(wingBase[1][0], wingBase[1][1]);
    g.closePath();
    g.fillPath();

    g.fillStyle(shadeColor(ebony, SHADING.right), 1);
    g.beginPath();
    g.moveTo(wingBase[2][0], wingBase[2][1]);
    g.lineTo(wingTop[2][0], wingTop[2][1]);
    g.lineTo(wingTop[3][0], wingTop[3][1]);
    g.lineTo(wingTop[4][0], wingTop[4][1]);
    g.lineTo(wingBase[4][0], wingBase[4][1]);
    g.lineTo(wingBase[3][0], wingBase[3][1]);
    g.closePath();
    g.fillPath();

    g.fillStyle(shadeColor(ebony, 0.78), 1);
    g.beginPath();
    g.moveTo(wingBase[4][0], wingBase[4][1]);
    g.lineTo(wingTop[4][0], wingTop[4][1]);
    g.lineTo(wingTop[5][0], wingTop[5][1]);
    g.lineTo(wingTop[6][0], wingTop[6][1]);
    g.lineTo(wingBase[6][0], wingBase[6][1]);
    g.lineTo(wingBase[5][0], wingBase[5][1]);
    g.closePath();
    g.fillPath();

    // Polished top face of the case.
    g.fillStyle(shadeColor(ebony, SHADING.top), 1);
    g.beginPath();
    g.moveTo(wingTop[0][0], wingTop[0][1]);
    for (let i = 1; i < wingTop.length; i += 1) {
      g.lineTo(wingTop[i][0], wingTop[i][1]);
    }
    g.closePath();
    g.fillPath();

    // Thin brass rim around the lid edge.
    g.lineStyle(2, PALETTE.brass, 0.55);
    g.beginPath();
    g.moveTo(wingTop[0][0], wingTop[0][1]);
    for (let i = 1; i < wingTop.length; i += 1) {
      g.lineTo(wingTop[i][0], wingTop[i][1]);
    }
    g.closePath();
    g.strokePath();

    // Prop stick + open lid (tilted diamond reading as a raised wing).
    g.lineStyle(3, shadeColor(rim, 1.1), 0.95);
    g.strokeLineShape(
      new Phaser.Geom.Line(x - 10, y - bodyH - 4, x - 35, y - bodyH - 78),
    );
    g.fillStyle(shadeColor(ebony, 1.35), 1);
    g.beginPath();
    g.moveTo(x - 95, y - bodyH - 12);
    g.lineTo(x - 45, y - bodyH - 88);
    g.lineTo(x + 55, y - bodyH - 72);
    g.lineTo(x + 85, y - bodyH - 8);
    g.closePath();
    g.fillPath();
    // Soft inner lid wash (not strings — keeps the family-friendly storybook look).
    g.fillStyle(PALETTE.moonlight, 0.12);
    g.beginPath();
    g.moveTo(x - 80, y - bodyH - 18);
    g.lineTo(x - 40, y - bodyH - 78);
    g.lineTo(x + 45, y - bodyH - 64);
    g.lineTo(x + 70, y - bodyH - 14);
    g.closePath();
    g.fillPath();

    // Fallboard / keyboard shelf.
    const keyX = x + 42;
    const keyY = y + 36;
    drawIsoBox(g, {
      x: keyX,
      y: keyY,
      width: 118,
      depth: 52,
      height: 14,
      color: shadeColor(ebony, 0.9),
    });

    // Cream keybed as individual isometric key strips.
    const keyCount = 11;
    for (let i = 0; i < keyCount; i += 1) {
      const t = (i - (keyCount - 1) / 2) / keyCount;
      const kx = keyX + t * 96;
      const ky = keyY - 4 - t * 22;
      drawIsoBox(g, {
        x: kx,
        y: ky,
        width: 12,
        depth: 34,
        height: 5,
        color: PALETTE.pianoKeys,
        topColor: shadeColor(PALETTE.pianoKeys, i % 2 === 0 ? 1.05 : 0.96),
      });
    }
    // Black keys sit on the cream bed in the usual 2+3 pattern.
    const blackPattern = [-4, -3, -1, 0, 1, 3, 4];
    for (const slot of blackPattern) {
      const t = slot / keyCount;
      const kx = keyX + t * 96 + 4;
      const ky = keyY - 14 - t * 22;
      drawIsoBox(g, {
        x: kx,
        y: ky,
        width: 8,
        depth: 20,
        height: 7,
        color: PALETTE.pianoBlackKeys,
        topColor: shadeColor(PALETTE.pianoBlackKeys, 1.25),
      });
    }

    // Music desk + sheet.
    drawIsoBox(g, {
      x: keyX - 18,
      y: keyY - 28,
      width: 48,
      depth: 12,
      height: 26,
      color: rim,
    });
    g.fillStyle(PALETTE.pianoKeys, 0.95);
    g.beginPath();
    g.moveTo(keyX - 30, keyY - 48);
    g.lineTo(keyX - 8, keyY - 40);
    g.lineTo(keyX - 4, keyY - 62);
    g.lineTo(keyX - 26, keyY - 70);
    g.closePath();
    g.fillPath();
    g.lineStyle(1, shadeColor(PALETTE.wood, 0.5), 0.7);
    g.strokeLineShape(new Phaser.Geom.Line(keyX - 26, keyY - 58, keyX - 10, keyY - 50));
    g.strokeLineShape(new Phaser.Geom.Line(keyX - 24, keyY - 52, keyX - 8, keyY - 44));

    // Piano bench with four stubby legs (not a crate).
    const bx = x + 28;
    const by = y + 88;
    for (const [ox, oy] of [
      [-22, -8],
      [18, -14],
      [-16, 10],
      [22, 6],
    ] as const) {
      drawIsoBox(g, {
        x: bx + ox,
        y: by + oy,
        width: 8,
        depth: 8,
        height: 18,
        color: shadeColor(PALETTE.wood, 0.85),
      });
    }
    drawIsoBox(g, {
      x: bx,
      y: by - 16,
      width: 78,
      depth: 38,
      height: 10,
      color: PALETTE.wood,
    });
    fillIsoDiamond(
      g,
      { x: bx, y: by - 16, width: 70, depth: 32 },
      shadeColor(PALETTE.sofa, 0.75),
      0.9,
      12,
    );
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
        // Key pigeonhole rack behind the desk — tall landmark for the front desk.
        const rack = { x: x - 16, y: y - 78, width: 150, depth: 32, height: 82, color: PALETTE.wood };
        drawContactShadow(g, rack);
        drawIsoBox(g, rack);
        drawFaceSlots(g, rack, 6, 3, shadeColor(PALETTE.wood, 0.42));
        // Tiny brass key tags hanging in a few slots.
        for (let tag = 0; tag < 4; tag += 1) {
          const tx = rack.x - 48 + tag * 28;
          const ty = rack.y - 18 + (tag % 2) * 12;
          g.fillStyle(PALETTE.brass, 0.95);
          g.fillCircle(tx, ty, 3);
          g.fillRect(tx - 1, ty, 2, 10);
        }

        drawContactShadow(g, { x, y, width: 210, depth: 100 });
        // Desk body with a front panel stripe so it reads as hotel reception.
        drawIsoBox(g, { x, y, width: 196, depth: 94, height: 54, color: PALETTE.reception });
        drawIsoBox(g, {
          x,
          y: y + 6,
          width: 170,
          depth: 18,
          height: 28,
          color: shadeColor(PALETTE.reception, 0.78),
        });
        // Overhanging counter top.
        drawIsoBox(g, { x, y: y - 54, width: 214, depth: 104, height: 10, color: PALETTE.woodLight });

        // Guest service bell (hauntable Object Nudge prop).
        const bellX = x + 54;
        const bellY = y - 64;
        drawIsoBox(g, { x: bellX, y: bellY, width: 28, depth: 18, height: 6, color: shadeColor(PALETTE.brass, 0.75) });
        g.fillStyle(PALETTE.brass, 1);
        g.fillEllipse(bellX, bellY - 18, 22, 16);
        g.fillStyle(shadeColor(PALETTE.brass, 1.2), 1);
        g.fillCircle(bellX, bellY - 26, 4);
        g.lineStyle(2, shadeColor(PALETTE.brass, 0.55), 0.9);
        g.strokeCircle(bellX, bellY - 18, 9);

        // Open guest ledger with a pen.
        drawIsoBox(g, { x: x - 52, y: y - 64, width: 52, depth: 34, height: 5, color: PALETTE.pianoKeys });
        g.lineStyle(1, shadeColor(PALETTE.wood, 0.55), 0.7);
        g.strokeLineShape(new Phaser.Geom.Line(x - 64, y - 72, x - 40, y - 60));
        g.strokeLineShape(new Phaser.Geom.Line(x - 64, y - 66, x - 40, y - 54));
        g.lineStyle(2, PALETTE.brass, 0.9);
        g.strokeLineShape(new Phaser.Geom.Line(x - 28, y - 70, x - 18, y - 58));
        break;
      }

      case 'sofa': {
        drawContactShadow(g, { x, y, width: 196, depth: 100 });
        // Seat base + short skirt.
        drawIsoBox(g, { x, y, width: 186, depth: 90, height: 26, color: PALETTE.sofa });
        drawIsoBox(g, {
          x,
          y: y + 4,
          width: 176,
          depth: 78,
          height: 10,
          color: shadeColor(PALETTE.sofa, 0.78),
        });
        // Tall backrest with a wood trim rail along the top.
        drawIsoBox(g, {
          x: x - 10,
          y: y - 34,
          width: 160,
          depth: 42,
          height: 58,
          color: shadeColor(PALETTE.sofa, 0.88),
        });
        drawIsoBox(g, {
          x: x - 10,
          y: y - 88,
          width: 168,
          depth: 18,
          height: 8,
          color: PALETTE.woodLight,
        });
        // Rolled arms.
        drawIsoBox(g, { x: x - 78, y: y + 2, width: 42, depth: 36, height: 40, color: PALETTE.sofa });
        drawIsoBox(g, { x: x + 78, y: y + 2, width: 42, depth: 36, height: 40, color: PALETTE.sofa });
        // Seat cushions (two pillows) so it is clearly a sofa, not a crate.
        fillIsoDiamond(
          g,
          { x: x - 34, y: y - 2, width: 72, depth: 34 },
          shadeColor(PALETTE.sofa, 1.28),
          0.95,
          28,
        );
        fillIsoDiamond(
          g,
          { x: x + 34, y: y + 6, width: 72, depth: 34 },
          shadeColor(PALETTE.sofa, 1.22),
          0.95,
          28,
        );
        // Throw pillow accent.
        fillIsoDiamond(
          g,
          { x: x + 8, y: y - 18, width: 36, depth: 20 },
          shadeColor(PALETTE.rugTrim, 0.92),
          0.9,
          44,
        );
        break;
      }

      case 'armchair':
        drawContactShadow(g, { x, y, width: 104, depth: 62 });
        drawIsoBox(g, { x, y, width: 104, depth: 62, height: 30, color: PALETTE.chair });
        drawIsoBox(g, { x: x - 4, y: y - 18, width: 84, depth: 40, height: 44, color: shadeColor(PALETTE.chair, 0.9) });
        break;

      case 'fireplace': {
        drawContactShadow(g, { x, y, width: 150, depth: 78 });
        // Stone surround + mantel.
        drawIsoBox(g, { x, y, width: 140, depth: 70, height: 70, color: shadeColor(PALETTE.wood, 0.7) });
        drawIsoBox(g, {
          x,
          y: y - 70,
          width: 158,
          depth: 78,
          height: 12,
          color: PALETTE.woodLight,
        });
        // Dark hearth opening with a soft moonlit ember wash (never a real fire threat).
        drawIsoBox(g, {
          x,
          y: y + 4,
          width: 78,
          depth: 36,
          height: 42,
          color: shadeColor(PALETTE.nightSky, 1.1),
        });
        g.fillStyle(PALETTE.lampWarm, 0.28);
        g.fillEllipse(x, y - 8, 54, 28);
        g.fillStyle(PALETTE.moonlight, 0.18);
        g.fillEllipse(x + 4, y - 18, 40, 22);
        // Brass andirons / grate hint.
        g.lineStyle(3, PALETTE.brass, 0.8);
        g.strokeLineShape(new Phaser.Geom.Line(x - 18, y + 10, x - 18, y - 22));
        g.strokeLineShape(new Phaser.Geom.Line(x + 18, y + 10, x + 18, y - 22));
        // Mantel clock ornament.
        drawIsoBox(g, { x: x + 4, y: y - 86, width: 28, depth: 16, height: 18, color: PALETTE.brass });
        break;
      }

      case 'piano':
        this.drawGrandPiano(g, x, y);
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
