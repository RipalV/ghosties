import Phaser from 'phaser';
import type { ScareAbility } from '../abilities/ScareAbility';
import type { ClueDefinition } from '../observation/types';
import { HUD_LAYOUT } from '../visuals/lobbyTheme';
import { ActionButton } from './ActionButton';
import { CharacterCard } from './CharacterCard';
import { CluePanel, type CluePanelEntry } from './CluePanel';
import { DomHudControls } from './DomHudControls';
import { HudChip } from './HudChip';
import { ObserveButton } from './ObserveButton';
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
  readonly onObserve: () => void;
  readonly onToggleClues: () => void;
}

interface ControlHit {
  readonly rect: Phaser.Geom.Rectangle;
  readonly activate: () => void;
}

/**
 * Floating HUD: value chips + bottom action cluster in Phaser; objective, clues,
 * and zoom as HTML overlays so corner hit targets match what players see
 * (Phaser's device-pixel canvas scale makes top-edge hits unreliable).
 */
export class GameHud {
  /** Everything the UI camera draws; the world camera ignores this container. */
  readonly root: Phaser.GameObjects.Container;

  private readonly scoreChip: HudChip;
  private readonly energyChip: HudChip;
  private readonly fearChip: HudChip;
  private readonly observeButton: ObserveButton;
  private readonly cluePanel: CluePanel;
  private readonly card: CharacterCard;
  private readonly toast: StatusToast;
  private readonly npcIndicator: OffscreenIndicator;
  private readonly domHud: DomHudControls;
  private readonly actionButtons: ActionButton[] = [];
  private readonly blockedRegions: Phaser.Geom.Rectangle[] = [];
  /** Phaser-owned hits (Observe + scare grid). Corner controls are HTML. */
  private readonly controlHits: ControlHit[] = [];

  private viewWidth = 0;
  private viewHeight = 0;
  private hasDiscoveredClues = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly uiScale: number,
    private readonly options: GameHudOptions,
  ) {
    this.root = scene.add.container(0, 0).setDepth(1000);

    this.scoreChip = new HudChip(scene, '⭐', '0', uiScale);
    this.energyChip = new HudChip(scene, '✨', '100', uiScale);
    this.fearChip = new HudChip(scene, '😮', 'CALM 0', uiScale);

    this.observeButton = new ObserveButton(scene, uiScale, options.onObserve);
    this.cluePanel = new CluePanel(scene, uiScale);
    this.card = new CharacterCard(scene, '👻', 'Ghost', uiScale);
    this.toast = new StatusToast(scene, uiScale);
    this.npcIndicator = new OffscreenIndicator(scene, 'Nora', uiScale);

    const parent = scene.game.canvas.parentElement;
    if (!parent) throw new Error('Missing game parent for DOM HUD controls.');

    this.domHud = new DomHudControls(parent, {
      onObjective: () => {
        this.domHud.setObjectiveNotification(false);
        this.setStatus(this.options.objective);
      },
      onToggleClues: options.onToggleClues,
      onZoomIn: options.onZoomIn,
      onZoomOut: options.onZoomOut,
    });

    this.root.add([
      this.scoreChip,
      this.energyChip,
      this.fearChip,
      this.observeButton,
      this.cluePanel,
      this.card,
      this.toast,
      this.npcIndicator,
    ]);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.domHud.destroy());
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
    const topRowHeight = Math.max(HUD_LAYOUT.chipHeight * s, objectiveSize);

    // Leave top-left CSS space for the HTML objective/clues buttons; chips follow.
    this.layoutChips();

    const cardRadius = this.card.radius;
    const cardCenterY = height - pad - Math.max(cardRadius, actionSize / 2);
    this.card.setPosition(pad + cardRadius, cardCenterY);

    const observeX = pad + cardRadius * 2 + 14 * s + actionSize / 2;
    this.observeButton.setPosition(observeX, cardCenterY);

    const gridStartX = observeX + actionSize + HUD_LAYOUT.observeActionGap * s;
    this.actionButtons.forEach((button, index) => {
      button.setPosition(gridStartX + index * (actionSize + HUD_LAYOUT.actionGap * s), cardCenterY);
    });

    const panelTop = pad + topRowHeight + 10 * s;
    this.cluePanel.layout(pad, panelTop);

    this.toast.setWrapWidth(Math.max(200 * s, width * HUD_LAYOUT.toastMaxWidthFraction));
    this.toast.setPosition(width / 2, cardCenterY - actionSize / 2 - 26 * s);

    this.rebuildControlHits({
      observeX,
      cardCenterY,
      actionSize,
      gridStartX,
    });
    this.refreshBlockedRegions();
  }

  /**
   * Screen-space hit test for Phaser HUD controls (Observe + scare grid).
   * Objective, clues, and zoom are HTML and never reach this path.
   */
  handlePointerDown(x: number, y: number): boolean {
    for (const hit of this.controlHits) {
      if (hit.rect.contains(x, y)) {
        hit.activate();
        return true;
      }
    }

    return this.blocksPointer(x, y);
  }

  /** Screen regions owned by the HUD, so world taps never fight a control. */
  blocksPointer(x: number, y: number): boolean {
    return this.blockedRegions.some((region) => region.contains(x, y));
  }

  setStatus(message: string): void {
    this.toast.show(message);
  }

  setClueStatus(message: string): void {
    this.toast.showClue(message);
  }

  setObjective(needsAttention: boolean): void {
    this.domHud.setObjectiveNotification(needsAttention);
  }

  setZoomAvailability(canZoomIn: boolean, canZoomOut: boolean): void {
    this.domHud.setZoomAvailability(canZoomIn, canZoomOut);
  }

  setObserveState(inRange: boolean, observing: boolean, progress: number): void {
    this.observeButton.setObserveState(inRange, observing, progress);
  }

  setClueEntries(clues: readonly ClueDefinition[], discoveredIds: readonly string[]): void {
    const entries: CluePanelEntry[] = clues.map((clue) => ({
      id: clue.id,
      category: clue.category,
      text: clue.text,
      discovered: discoveredIds.includes(clue.id),
    }));
    this.cluePanel.setEntries(entries);
    this.hasDiscoveredClues = discoveredIds.length > 0;
    this.domHud.setCluesNotification(this.hasDiscoveredClues && !this.cluePanel.isOpen());
  }

  toggleCluePanel(): boolean {
    const next = !this.cluePanel.isOpen();
    this.cluePanel.setOpen(next);
    this.domHud.setCluesNotification(this.hasDiscoveredClues && !next);
    this.refreshBlockedRegions();
    return next;
  }

  setCluePanelOpen(open: boolean): void {
    this.cluePanel.setOpen(open);
    this.domHud.setCluesNotification(this.hasDiscoveredClues && !open);
    this.refreshBlockedRegions();
  }

  showNpcIndicator(target: { x: number; y: number }, worldDistance: number): void {
    const inset = HUD_LAYOUT.padding * this.uiScale + 20 * this.uiScale;
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
    const objectiveSize = HUD_LAYOUT.objectiveSize * s;
    // Match the HTML objective + clues cluster on the top-left.
    const startX = pad + objectiveSize * 2 + gap * 2;
    const centerY = pad + (HUD_LAYOUT.chipHeight * s) / 2;

    let cursorX = startX;
    for (const chip of [this.scoreChip, this.energyChip, this.fearChip]) {
      chip.setPosition(cursorX, centerY);
      cursorX += chip.chipWidth + gap;
    }
  }

  private rebuildControlHits(layout: {
    observeX: number;
    cardCenterY: number;
    actionSize: number;
    gridStartX: number;
  }): void {
    const s = this.uiScale;
    const touchPad = 4 * s;

    this.controlHits.length = 0;

    this.controlHits.push({
      rect: squareHit(layout.observeX, layout.cardCenterY, layout.actionSize, touchPad),
      activate: () => {
        this.observeButton.press();
      },
    });

    this.actionButtons.forEach((button, index) => {
      const x = layout.gridStartX + index * (layout.actionSize + HUD_LAYOUT.actionGap * s);
      this.controlHits.push({
        rect: squareHit(x, layout.cardCenterY, layout.actionSize, touchPad),
        activate: () => {
          button.press();
        },
      });
    });
  }

  private refreshBlockedRegions(): void {
    const s = this.uiScale;
    const pad = HUD_LAYOUT.padding * s;
    const touchPad = 6 * s;
    const objectiveSize = HUD_LAYOUT.objectiveSize * s;

    this.blockedRegions.length = 0;

    const chipsWidth =
      this.scoreChip.chipWidth +
      this.energyChip.chipWidth +
      this.fearChip.chipWidth +
      HUD_LAYOUT.chipGap * s * 3;
    this.blockedRegions.push(
      new Phaser.Geom.Rectangle(
        0,
        0,
        pad + objectiveSize * 2 + HUD_LAYOUT.chipGap * s + chipsWidth + touchPad,
        pad + Math.max(objectiveSize, HUD_LAYOUT.chipHeight * s) + touchPad,
      ),
    );

    const bottomHeight = Math.max(HUD_LAYOUT.actionSize, HUD_LAYOUT.cardRadius * 2) * s + pad + touchPad;
    const bottomWidth =
      pad +
      this.card.radius * 2 +
      14 * s +
      HUD_LAYOUT.actionSize * s +
      HUD_LAYOUT.observeActionGap * s +
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

    if (this.cluePanel.isOpen()) {
      this.blockedRegions.push(
        new Phaser.Geom.Rectangle(
          this.cluePanel.x,
          this.cluePanel.y,
          this.cluePanel.panelWidth,
          this.cluePanel.panelHeight,
        ),
      );
    }
  }
}

function squareHit(centerX: number, centerY: number, size: number, pad: number): Phaser.Geom.Rectangle {
  const half = size / 2 + pad;
  return new Phaser.Geom.Rectangle(centerX - half, centerY - half, half * 2, half * 2);
}
