import Phaser from 'phaser';
import type { ClueCategory } from '../observation/types';
import { drawRoundedPanel, hudFont } from './hudDraw';

const CATEGORY_GLYPH: Record<ClueCategory, string> = {
  dialogue: '💬',
  body_language: '👀',
  nearby_object: '🪑',
  environmental_reaction: '🌬️',
};

export interface CluePanelEntry {
  readonly id: string;
  readonly category: ClueCategory;
  readonly text: string;
  readonly discovered: boolean;
}

/**
 * Compact clue review panel: discovered clues show text plus a category glyph;
 * undiscovered slots stay locked without naming the hidden fear.
 */
export class CluePanel extends Phaser.GameObjects.Container {
  private readonly plate: Phaser.GameObjects.Graphics;
  private readonly title: Phaser.GameObjects.Text;
  private readonly rows: Phaser.GameObjects.Container[] = [];
  private readonly uiScale: number;
  private panelWidthValue = 0;
  private panelHeightValue = 0;
  private visiblePanel = false;

  constructor(scene: Phaser.Scene, uiScale: number) {
    super(scene, 0, 0);
    this.uiScale = uiScale;

    this.plate = scene.add.graphics();
    this.title = scene.add.text(0, 0, 'Clues', hudFont(16 * uiScale, '#fff7cf', true)).setOrigin(0, 0);
    this.add([this.plate, this.title]);
    this.setVisible(false);
    scene.add.existing(this);
  }

  setOpen(open: boolean): void {
    this.visiblePanel = open;
    this.setVisible(open);
  }

  isOpen(): boolean {
    return this.visiblePanel;
  }

  setEntries(entries: readonly CluePanelEntry[]): void {
    this.rows.forEach((row) => row.destroy());
    this.rows.length = 0;

    const s = this.uiScale;
    const pad = 12 * s;
    const rowGap = 8 * s;
    const rowHeight = 34 * s;
    const width = Math.max(220 * s, 280 * s);

    // Local Y inside this panel (origin = top-left of the plate), not screen space.
    let localY = pad + 22 * s;

    entries.forEach((entry) => {
      // Build off the display list so coords stay panel-local from the start.
      // (scene.add.container(x,y) would briefly place the row in world space.)
      const row = this.scene.make.container({ x: pad, y: localY, add: false });
      const glyph = makePanelText(this.scene, CATEGORY_GLYPH[entry.category], 18 * s);
      const lock = makePanelText(this.scene, '🔒', 16 * s);
      const body = makePanelText(
        this.scene,
        entry.discovered ? entry.text : '???',
        13 * s,
        entry.discovered ? '#fff7cf' : '#b8aac8',
      );
      body.setWordWrapWidth(width - pad * 2 - 28 * s);

      glyph.setPosition(0, rowHeight / 2 - glyph.height / 2);
      if (entry.discovered) {
        body.setPosition(24 * s, 0);
        row.add([glyph, body]);
      } else {
        lock.setPosition(0, rowHeight / 2 - lock.height / 2);
        body.setPosition(24 * s, 0);
        row.add([lock, body]);
      }

      this.add(row);
      this.rows.push(row);
      localY += rowHeight + rowGap;
    });

    this.panelWidthValue = width + pad * 2;
    this.panelHeightValue = localY + pad;
    this.title.setPosition(pad, pad);
    this.redraw();
  }

  layout(x: number, y: number): void {
    this.setPosition(x, y);
  }

  get panelWidth(): number {
    return this.panelWidthValue;
  }

  get panelHeight(): number {
    return this.panelHeightValue;
  }

  private redraw(): void {
    this.plate.clear();
    drawRoundedPanel(this.plate, 0, 0, this.panelWidthValue, this.panelHeightValue, 14 * this.uiScale, {
      fillAlpha: 0.94,
    });
  }
}

function makePanelText(
  scene: Phaser.Scene,
  value: string,
  size: number,
  color = '#fff7cf',
): Phaser.GameObjects.Text {
  return scene.make.text({ x: 0, y: 0, text: value, style: hudFont(size, color), add: false });
}
