import Phaser from 'phaser';
import type { ScareAbility } from '../abilities/ScareAbility';
import type { ClueDefinition } from '../observation/types';
import { HUD_LAYOUT } from '../visuals/lobbyTheme';
import { DomHudControls, type DomTutorialPresentation, type DomVisitResultsView } from './DomHudControls';
import { HudChip } from './HudChip';
import { OffscreenIndicator } from './OffscreenIndicator';
import { StatusToast } from './StatusToast';

export interface HudSnapshot {
  score: number;
  energy: number;
  fear: number;
  stage: string;
}

export interface GameHudOptions {
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onObserve: () => void;
  readonly onToggleClues: () => void;
  readonly onNextVisit: () => void;
  readonly onSkipTutorial?: () => void;
}

/**
 * Floating HUD: value chips and toasts in Phaser; corner controls, clue
 * review, and the action cluster as HTML overlays so layout stays aligned in
 * fullscreen and under device-pixel canvas scaling.
 */
export class GameHud {
  /** Everything the UI camera draws; the world camera ignores this container. */
  readonly root: Phaser.GameObjects.Container;

  private readonly scoreChip: HudChip;
  private readonly energyChip: HudChip;
  private readonly fearChip: HudChip;
  private readonly toast: StatusToast;
  private readonly npcIndicator: OffscreenIndicator;
  private readonly domHud: DomHudControls;
  private readonly blockedRegions: Phaser.Geom.Rectangle[] = [];
  private readonly hudParent: HTMLElement;

  private viewWidth = 0;
  private viewHeight = 0;
  private hasDiscoveredClues = false;
  private actionCount = 0;
  private actionEnergyCosts: number[] = [];
  private visitorName = '';
  private objectiveText = '';

  constructor(
    scene: Phaser.Scene,
    private readonly uiScale: number,
    options: GameHudOptions,
  ) {
    this.root = scene.add.container(0, 0).setDepth(1000);

    this.scoreChip = new HudChip(scene, '⭐', '0', uiScale);
    this.energyChip = new HudChip(scene, '✨', '100', uiScale);
    this.fearChip = new HudChip(scene, '😮', 'CALM 0', uiScale);

    this.toast = new StatusToast(scene, uiScale);
    this.npcIndicator = new OffscreenIndicator(scene, '', uiScale);

    const parent = scene.game.canvas.parentElement;
    if (!parent) throw new Error('Missing game parent for DOM HUD controls.');
    this.hudParent = parent;

    this.domHud = new DomHudControls(parent, {
      onObjective: () => {
        this.domHud.setObjectiveNotification(false);
        this.setStatus(this.objectiveText);
      },
      onToggleClues: options.onToggleClues,
      onZoomIn: options.onZoomIn,
      onZoomOut: options.onZoomOut,
      onObserve: options.onObserve,
      onNextVisit: options.onNextVisit,
      onSkipTutorial: options.onSkipTutorial,
    });

    this.root.add([this.scoreChip, this.energyChip, this.fearChip, this.toast, this.npcIndicator]);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.domHud.destroy());
  }

  createAbilityControls(
    abilities: readonly ScareAbility[],
    onActivate: (ability: ScareAbility) => void,
  ): void {
    this.actionCount = abilities.length;
    this.actionEnergyCosts = abilities.map((ability) => ability.energyCost);
    this.domHud.createActionControls(abilities, onActivate);
    if (this.viewWidth > 0) this.layout(this.viewWidth, this.viewHeight);
  }

  layout(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;

    const s = this.uiScale;
    const edgeInsetBottom = this.readEdgeInsetBottom();
    const actionSize = HUD_LAYOUT.actionSize * s;

    this.layoutChips();

    const cardRadius = HUD_LAYOUT.cardRadius * s;
    const cardCenterY = this.viewHeight - edgeInsetBottom - Math.max(cardRadius, actionSize / 2);

    this.toast.setWrapWidth(Math.max(200 * s, width * HUD_LAYOUT.toastMaxWidthFraction));
    this.toast.setPosition(width / 2, cardCenterY - actionSize / 2 - 26 * s);

    this.refreshBlockedRegions();
  }

  handlePointerDown(x: number, y: number): boolean {
    return this.blocksPointer(x, y);
  }

  blocksPointer(x: number, y: number): boolean {
    return this.blockedRegions.some((region) => region.contains(x, y));
  }

  setVisitorPresentation(visitorName: string, objective: string): void {
    this.visitorName = visitorName;
    this.objectiveText = objective;
    this.domHud.setObserveLabel(visitorName);
    this.domHud.setObjectiveText(objective);
  }

  setTutorialPresentation(presentation: DomTutorialPresentation): void {
    this.domHud.setTutorialPresentation(presentation);
    this.scheduleBlockedRegionRefresh();
  }

  hideTutorialPresentation(): void {
    this.domHud.hideTutorialPresentation();
    this.scheduleBlockedRegionRefresh();
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
    this.domHud.setObserveState(inRange, observing, progress);
  }

  setClueEntries(clues: readonly ClueDefinition[], discoveredIds: readonly string[]): void {
    this.domHud.setClueEntries(
      clues.map((clue) => ({
        id: clue.id,
        category: clue.category,
        text: clue.text,
        discovered: discoveredIds.includes(clue.id),
      })),
    );
    this.hasDiscoveredClues = discoveredIds.length > 0;
    this.domHud.setCluesNotification(this.hasDiscoveredClues && !this.domHud.isCluePanelOpen());
  }

  toggleCluePanel(): boolean {
    const next = !this.domHud.isCluePanelOpen();
    this.domHud.setCluePanelOpen(next);
    this.domHud.setCluesNotification(this.hasDiscoveredClues && !next);
    this.scheduleBlockedRegionRefresh();
    return next;
  }

  setCluePanelOpen(open: boolean): void {
    this.domHud.setCluePanelOpen(open);
    this.domHud.setCluesNotification(this.hasDiscoveredClues && !open);
    this.scheduleBlockedRegionRefresh();
  }

  setScareCastState(castingIndex: number | null, progress: number): void {
    this.domHud.setActionCastState(castingIndex, progress);
  }

  setVisitCue(glyph: string, message: string): void {
    this.domHud.setVisitCue(glyph, message);
  }

  hideVisitCue(): void {
    this.domHud.hideVisitCue();
  }

  showVisitResults(summary: DomVisitResultsView): void {
    this.domHud.showVisitResults(summary);
    this.scheduleBlockedRegionRefresh();
  }

  hideVisitResults(): void {
    this.domHud.hideVisitResults();
    this.scheduleBlockedRegionRefresh();
  }

  setGameplayLocked(locked: boolean): void {
    this.domHud.setGameplayLocked(locked);
  }

  showNpcIndicator(target: { x: number; y: number }, worldDistance: number): void {
    const inset = this.readEdgeInsetX() + 20 * this.uiScale;
    const zoomColumn = (HUD_LAYOUT.zoomButtonSize + HUD_LAYOUT.padding) * this.uiScale;
    this.npcIndicator.pointAt(
      { x: this.viewWidth / 2, y: this.viewHeight / 2 },
      target,
      ` ${this.visitorName} · ${Math.round(worldDistance / 10)}m`,
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
    this.fearChip.setValue(`${this.visitorName}: ${snapshot.stage.toUpperCase()} ${snapshot.fear}`);

    this.actionEnergyCosts.forEach((cost, index) => {
      this.domHud.setActionAffordable(index, snapshot.energy >= cost);
    });

    this.layoutChips();
    this.refreshBlockedRegions();
  }

  private layoutChips(): void {
    if (this.viewWidth === 0) return;

    const s = this.uiScale;
    const edgeInsetTop = this.readEdgeInsetTop();
    const edgeInsetX = this.readEdgeInsetX();
    const gap = HUD_LAYOUT.chipGap * s;
    const objectiveSize = HUD_LAYOUT.objectiveSize * s;
    const centerY = edgeInsetTop + objectiveSize / 2;

    const chips = [this.scoreChip, this.energyChip, this.fearChip];
    const totalWidth =
      chips.reduce((sum, chip) => sum + chip.chipWidth, 0) + gap * Math.max(0, chips.length - 1);

    const leftClear = edgeInsetX + objectiveSize * 2 + gap * 2;
    const rightClear = edgeInsetX + HUD_LAYOUT.zoomButtonSize * s + gap;
    let startX = (this.viewWidth - totalWidth) / 2;
    if (startX < leftClear) startX = leftClear;
    if (startX + totalWidth > this.viewWidth - rightClear) {
      startX = Math.max(leftClear, this.viewWidth - rightClear - totalWidth);
    }

    let cursorX = startX;
    for (const chip of chips) {
      chip.setPosition(cursorX, centerY);
      cursorX += chip.chipWidth + gap;
    }
  }

  private refreshBlockedRegions(): void {
    const s = this.uiScale;
    const edgeInsetX = this.readEdgeInsetX();
    const edgeInsetBottom = this.readEdgeInsetBottom();
    const touchPad = 6 * s;

    this.blockedRegions.length = 0;

    this.blockedRegions.push(this.domRectToGame(this.domHud.topLeftCluster, touchPad));

    if (!this.domHud.getResultsOverlayElement().hidden) {
      this.blockedRegions.push(
        this.domRectToGame(this.domHud.getResultsOverlayElement(), touchPad),
      );
    }

    if (!this.domHud.getTutorialBannerElement().hidden) {
      this.blockedRegions.push(
        this.domRectToGame(this.domHud.getTutorialBannerElement(), touchPad),
      );
    }

    const chipsWidth =
      this.scoreChip.chipWidth +
      this.energyChip.chipWidth +
      this.fearChip.chipWidth +
      HUD_LAYOUT.chipGap * s * Math.max(0, 2);
    const topHeight =
      this.readEdgeInsetTop() + Math.max(HUD_LAYOUT.objectiveSize, HUD_LAYOUT.chipHeight) * s + touchPad;
    this.blockedRegions.push(
      new Phaser.Geom.Rectangle(
        this.scoreChip.x - touchPad,
        0,
        chipsWidth + touchPad * 2,
        topHeight,
      ),
    );

    const cardRadius = HUD_LAYOUT.cardRadius * s;
    const bottomHeight =
      Math.max(HUD_LAYOUT.actionSize, HUD_LAYOUT.cardRadius * 2) * s + edgeInsetBottom + touchPad + 18 * s;
    const bottomWidth =
      edgeInsetX +
      cardRadius * 2 +
      14 * s +
      HUD_LAYOUT.actionSize * s +
      HUD_LAYOUT.observeActionGap * s +
      this.actionCount * HUD_LAYOUT.actionSize * s +
      Math.max(0, this.actionCount - 1) * HUD_LAYOUT.actionGap * s +
      touchPad;
    this.blockedRegions.push(
      new Phaser.Geom.Rectangle(0, this.viewHeight - bottomHeight, bottomWidth, bottomHeight),
    );

    const zoomWidth = HUD_LAYOUT.zoomButtonSize * s + edgeInsetX + touchPad;
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

  /** Re-measure DOM HUD bounds after the clue panel toggles or resizes. */
  private scheduleBlockedRegionRefresh(): void {
    this.refreshBlockedRegions();
    requestAnimationFrame(() => {
      this.refreshBlockedRegions();
    });
  }

  private domRectToGame(element: HTMLElement, pad = 0): Phaser.Geom.Rectangle {
    const canvas = this.hudParent.querySelector('canvas');
    if (!canvas) return new Phaser.Geom.Rectangle(0, 0, 0, 0);

    const elementRect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;

    const x = (elementRect.left - canvasRect.left) * scaleX - pad;
    const y = (elementRect.top - canvasRect.top) * scaleY - pad;
    const width = elementRect.width * scaleX + pad * 2;
    const height = elementRect.height * scaleY + pad * 2;

    return new Phaser.Geom.Rectangle(x, y, width, height);
  }

  private readEdgeInsetTop(): number {
    return this.readCssLength('--hud-edge-inset-top', HUD_LAYOUT.padding);
  }

  private readEdgeInsetX(): number {
    return this.readCssLength('--hud-edge-inset-x', HUD_LAYOUT.padding);
  }

  private readEdgeInsetBottom(): number {
    return this.readCssLength('--hud-edge-inset-bottom', HUD_LAYOUT.padding);
  }

  private readCssLength(varName: string, fallback: number): number {
    const raw = getComputedStyle(this.hudParent).getPropertyValue(varName).trim();
    const cssPx = raw ? Number.parseFloat(raw) : Number.NaN;
    const inset = Number.isFinite(cssPx) ? cssPx : fallback;
    return inset * this.uiScale;
  }
}
