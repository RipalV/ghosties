import Phaser from 'phaser';
import type { ScareAbility } from '../abilities/ScareAbility';
import { HUD_LAYOUT } from '../visuals/lobbyTheme';
import { ActionButton } from './ActionButton';
import { CharacterCard } from './CharacterCard';
import { HudChip } from './HudChip';
import { IconButton } from './IconButton';
import { OffscreenIndicator } from './OffscreenIndicator';
import { StatusToast } from './StatusToast';

export interface HudSnapshot {
  score: number;
  energy: number;
  fear: number;
  stage: string;
}

export interface GameHudOptions {
  readonly objective: string;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
}

/**
 * Floating HUD drawn by a dedicated UI camera: pill chips along the top edge, an
 * objective button in the top corner, and a ghost card with a square scare
 * action grid in the bottom corner. Nothing here reserves space from the play
 * area, and every element is repositioned from the live viewport size.
 */
export class GameHud {
  /** Everything the UI camera draws; the world camera ignores this container. */
  readonly root: Phaser.GameObjects.Container;

  private readonly scoreChip: HudChip;
  private readonly energyChip: HudChip;
  private readonly fearChip: HudChip;
  private readonly objectiveButton: IconButton;
  private readonly zoomInButton: IconButton;
  private readonly zoomOutButton: IconButton;
  private readonly card: CharacterCard;
  private readonly toast: StatusToast;
  private readonly npcIndicator: OffscreenIndicator;
  private readonly actionButtons: ActionButton[] = [];
  private readonly blockedRegions: Phaser.Geom.Rectangle[] = [];

  private viewWidth = 0;
  private viewHeight = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly uiScale: number,
    private readonly options: GameHudOptions,
  ) {
    this.root = scene.add.container(0, 0).setDepth(1000);

    this.scoreChip = new HudChip(scene, '⭐', '0', uiScale);
    this.energyChip = new HudChip(scene, '✨', '100', uiScale);
    this.fearChip = new HudChip(scene, '😮', 'CALM 0', uiScale);

    const objectiveSize = HUD_LAYOUT.objectiveSize * uiScale;
    this.objectiveButton = new IconButton(scene, '📋', objectiveSize, uiScale, () => {
      this.objectiveButton.setNotification(false);
      this.setStatus(this.options.objective);
    });
    this.objectiveButton.setNotification(true);

    const zoomSize = HUD_LAYOUT.zoomButtonSize * uiScale;
    this.zoomInButton = new IconButton(scene, '＋', zoomSize, uiScale, options.onZoomIn);
    this.zoomOutButton = new IconButton(scene, '－', zoomSize, uiScale, options.onZoomOut);

    this.card = new CharacterCard(scene, '👻', 'Ghost', uiScale);
    this.toast = new StatusToast(scene, uiScale);
    this.npcIndicator = new OffscreenIndicator(scene, 'Nora', uiScale);

    this.root.add([
      this.scoreChip,
      this.energyChip,
      this.fearChip,
      this.objectiveButton,
      this.zoomInButton,
      this.zoomOutButton,
      this.card,
      this.toast,
      this.npcIndicator,
    ]);
  }

  createAbilityControls(
    abilities: readonly ScareAbility[],
    onActivate: (ability: ScareAbility) => void,
  ): void {
    abilities.forEach((ability, index) => {
      const button = new ActionButton(this.scene, ability, String(index + 1), this.uiScale, () =>
        onActivate(ability),
      );
      this.actionButtons.push(button);
      this.root.add(button);
    });

    if (this.viewWidth > 0) this.layout(this.viewWidth, this.viewHeight);
  }

  layout(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;

    const s = this.uiScale;
    const pad = HUD_LAYOUT.padding * s;
    const objectiveSize = HUD_LAYOUT.objectiveSize * s;
    const actionSize = HUD_LAYOUT.actionSize * s;
    const zoomSize = HUD_LAYOUT.zoomButtonSize * s;

    this.objectiveButton.setPosition(pad + objectiveSize / 2, pad + objectiveSize / 2);
    this.layoutChips();

    // Bottom corner: ghost card, then the square scare grid beside it.
    const cardRadius = this.card.radius;
    const cardCenterY = height - pad - Math.max(cardRadius, actionSize / 2);
    this.card.setPosition(pad + cardRadius, cardCenterY);

    const gridStartX = pad + cardRadius * 2 + 14 * s + actionSize / 2;
    this.actionButtons.forEach((button, index) => {
      button.setPosition(gridStartX + index * (actionSize + HUD_LAYOUT.actionGap * s), cardCenterY);
    });

    this.zoomInButton.setPosition(width - pad - zoomSize / 2, height / 2 - zoomSize * 0.6);
    this.zoomOutButton.setPosition(width - pad - zoomSize / 2, height / 2 + zoomSize * 0.6);

    this.toast.setWrapWidth(Math.max(200 * s, width * HUD_LAYOUT.toastMaxWidthFraction));
    this.toast.setPosition(width / 2, cardCenterY - actionSize / 2 - 26 * s);

    this.refreshBlockedRegions();
  }

  /** Screen regions owned by the HUD, so world taps never fight a control. */
  blocksPointer(x: number, y: number): boolean {
    return this.blockedRegions.some((region) => region.contains(x, y));
  }

  setStatus(message: string): void {
    this.toast.show(message);
  }

  setObjective(needsAttention: boolean): void {
    this.objectiveButton.setNotification(needsAttention);
  }

  setZoomAvailability(canZoomIn: boolean, canZoomOut: boolean): void {
    this.zoomInButton.setEnabled(canZoomIn);
    this.zoomOutButton.setEnabled(canZoomOut);
  }

  showNpcIndicator(target: { x: number; y: number }, worldDistance: number): void {
    const inset = HUD_LAYOUT.padding * this.uiScale + 20 * this.uiScale;
    // Nora is usually to one side, so the right edge is where the indicator
    // parks most often — the zoom column is kept clear of it.
    const zoomColumn = (HUD_LAYOUT.zoomButtonSize + HUD_LAYOUT.padding) * this.uiScale;
    this.npcIndicator.pointAt(
      { x: this.viewWidth / 2, y: this.viewHeight / 2 },
      target,
      `Nora · ${Math.round(worldDistance / 10)}m`,
      {
        left: inset + 40 * this.uiScale,
        right: this.viewWidth - inset - 40 * this.uiScale - zoomColumn,
        top: inset + HUD_LAYOUT.chipHeight * this.uiScale,
        bottom: this.viewHeight - inset - HUD_LAYOUT.actionSize * this.uiScale,
      },
    );
  }

  hideNpcIndicator(): void {
    this.npcIndicator.hide();
  }

  update(snapshot: HudSnapshot): void {
    this.scoreChip.setValue(String(snapshot.score));
    this.energyChip.setValue(String(snapshot.energy));
    this.fearChip.setValue(`${snapshot.stage.toUpperCase()} ${snapshot.fear}`);

    this.actionButtons.forEach((button) => {
      button.setAffordable(snapshot.energy >= button.ability.energyCost);
    });

    this.layoutChips();
    this.refreshBlockedRegions();
  }

  private layoutChips(): void {
    if (this.viewWidth === 0) return;

    const s = this.uiScale;
    const pad = HUD_LAYOUT.padding * s;
    const gap = HUD_LAYOUT.chipGap * s;
    const startX = pad + HUD_LAYOUT.objectiveSize * s + gap;
    const centerY = pad + HUD_LAYOUT.chipHeight * s / 2;

    let cursorX = startX;
    for (const chip of [this.scoreChip, this.energyChip, this.fearChip]) {
      chip.setPosition(cursorX, centerY);
      cursorX += chip.width + gap;
    }
  }

  private refreshBlockedRegions(): void {
    const s = this.uiScale;
    const pad = HUD_LAYOUT.padding * s;
    const touchPad = 6 * s;

    this.blockedRegions.length = 0;

    const chipsWidth = this.scoreChip.width + this.energyChip.width + this.fearChip.width + HUD_LAYOUT.chipGap * s * 3;
    this.blockedRegions.push(
      new Phaser.Geom.Rectangle(
        0,
        0,
        pad + HUD_LAYOUT.objectiveSize * s + chipsWidth + touchPad,
        pad + Math.max(HUD_LAYOUT.objectiveSize, HUD_LAYOUT.chipHeight) * s + touchPad,
      ),
    );

    const bottomHeight = Math.max(HUD_LAYOUT.actionSize, HUD_LAYOUT.cardRadius * 2) * s + pad + touchPad;
    const bottomWidth =
      pad +
      this.card.radius * 2 +
      14 * s +
      this.actionButtons.length * HUD_LAYOUT.actionSize * s +
      Math.max(0, this.actionButtons.length - 1) * HUD_LAYOUT.actionGap * s +
      touchPad;
    this.blockedRegions.push(
      new Phaser.Geom.Rectangle(0, this.viewHeight - bottomHeight, bottomWidth, bottomHeight),
    );

    const zoomWidth = HUD_LAYOUT.zoomButtonSize * s + pad + touchPad;
    const zoomHeight = HUD_LAYOUT.zoomButtonSize * s * 2.4;
    this.blockedRegions.push(
      new Phaser.Geom.Rectangle(
        this.viewWidth - zoomWidth,
        this.viewHeight / 2 - zoomHeight / 2,
        zoomWidth,
        zoomHeight,
      ),
    );
  }
}
