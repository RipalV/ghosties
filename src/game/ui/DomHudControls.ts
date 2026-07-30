import type { ScareAbility } from '../abilities/ScareAbility';
import type { ClueCategory } from '../observation/types';

/**
 * Corner and bottom-left HUD controls as HTML overlays inside #app.
 *
 * Phaser canvas hit-testing is unreliable for edge controls under the
 * device-pixel zoom scale. Interactive HUD and the clue review panel use
 * normal CSS layout while chips and toasts stay in Phaser.
 */

export interface DomHudHandlers {
  readonly onObjective: () => void;
  readonly onToggleClues: () => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
  readonly onObserve: () => void;
}

export interface DomCluePanelEntry {
  readonly id: string;
  readonly category: ClueCategory;
  readonly text: string;
  readonly discovered: boolean;
}

interface ActionButtonElements {
  readonly button: HTMLButtonElement;
  readonly lock: HTMLElement;
  readonly progressLabel: HTMLElement;
  readonly progressRing: HTMLElement;
}

const CATEGORY_GLYPH: Record<ClueCategory, string> = {
  dialogue: '💬',
  body_language: '👀',
  nearby_object: '🪑',
  environmental_reaction: '🌬️',
};

export class DomHudControls {
  private readonly root: HTMLElement;
  readonly topLeftCluster: HTMLElement;
  private readonly objectiveButton: HTMLButtonElement;
  private readonly cluesButton: HTMLButtonElement;
  private readonly zoomInButton: HTMLButtonElement;
  private readonly zoomOutButton: HTMLButtonElement;
  private readonly objectiveBadge: HTMLElement;
  private readonly cluesBadge: HTMLElement;
  private readonly cluePanel: HTMLElement;
  private readonly clueScrollWrap: HTMLElement;
  private readonly clueList: HTMLElement;
  private readonly clueMoreCue: HTMLElement;
  private readonly observeButton: HTMLButtonElement;
  private readonly observeRangeMark: HTMLElement;
  private readonly observeProgressLabel: HTMLElement;
  private readonly observeProgressRing: HTMLElement;
  private readonly actionButtons: ActionButtonElements[] = [];
  private cluePanelOpen = false;

  constructor(parent: HTMLElement, handlers: DomHudHandlers) {
    this.root = document.createElement('div');
    this.root.id = 'dom-hud';
    this.root.setAttribute('aria-label', 'Game controls');

    this.topLeftCluster = document.createElement('div');
    this.topLeftCluster.className = 'dom-hud-top-left';

    const topButtons = document.createElement('div');
    topButtons.className = 'dom-hud-top-buttons';

    this.objectiveButton = makeCornerButton('📋', 'Show objective');
    this.objectiveBadge = makeBadge();
    this.objectiveButton.append(this.objectiveBadge);

    this.cluesButton = makeCornerButton('🧩', 'Review clues');
    this.cluesBadge = makeBadge();
    this.cluesButton.append(this.cluesBadge);

    topButtons.append(this.objectiveButton, this.cluesButton);

    this.cluePanel = document.createElement('div');
    this.cluePanel.className = 'dom-clue-panel';
    this.cluePanel.hidden = true;
    this.cluePanel.setAttribute('role', 'region');
    this.cluePanel.setAttribute('aria-label', 'Discovered clues');

    const clueTitle = document.createElement('h2');
    clueTitle.className = 'dom-clue-panel-title';
    clueTitle.textContent = 'Clues';
    this.clueScrollWrap = document.createElement('div');
    this.clueScrollWrap.className = 'dom-clue-panel-scroll';
    this.clueList = document.createElement('ul');
    this.clueList.className = 'dom-clue-panel-list';
    this.clueMoreCue = document.createElement('div');
    this.clueMoreCue.className = 'dom-clue-panel-more-cue';
    this.clueMoreCue.textContent = '▼ More below';
    this.clueScrollWrap.append(this.clueList, this.clueMoreCue);
    this.cluePanel.append(clueTitle, this.clueScrollWrap);
    this.clueList.addEventListener('scroll', () => this.syncCluePanelScroll());
    window.addEventListener('resize', this.handleResize);

    this.topLeftCluster.append(topButtons, this.cluePanel);

    const bottomLeft = document.createElement('div');
    bottomLeft.className = 'dom-hud-bottom-left';

    const ghostCard = document.createElement('div');
    ghostCard.className = 'dom-hud-ghost-card';
    ghostCard.setAttribute('aria-hidden', 'true');
    const ghostLabel = document.createElement('span');
    ghostLabel.className = 'dom-hud-ghost-label';
    ghostLabel.textContent = 'Ghost';
    const ghostPortrait = document.createElement('div');
    ghostPortrait.className = 'dom-hud-ghost-portrait';
    ghostPortrait.textContent = '👻';
    ghostCard.append(ghostLabel, ghostPortrait);

    const observeWrap = document.createElement('div');
    observeWrap.className = 'dom-hud-observe-wrap';
    this.observeButton = makeActionButton('👁', 'Observe Nora');
    this.observeButton.classList.add('dom-hud-observe-button');
    this.observeRangeMark = document.createElement('span');
    this.observeRangeMark.className = 'dom-hud-observe-range';
    this.observeRangeMark.textContent = '↔';
    this.observeRangeMark.hidden = true;
    this.observeProgressLabel = document.createElement('span');
    this.observeProgressLabel.className = 'dom-hud-observe-progress';
    this.observeProgressLabel.hidden = true;
    this.observeProgressRing = document.createElement('span');
    this.observeProgressRing.className = 'dom-hud-observe-ring';
    this.observeProgressRing.setAttribute('aria-hidden', 'true');
    const observeShortcut = document.createElement('span');
    observeShortcut.className = 'dom-hud-action-shortcut';
    observeShortcut.textContent = 'O';
    this.observeButton.prepend(observeShortcut);
    this.observeButton.append(this.observeRangeMark, this.observeProgressLabel, this.observeProgressRing);
    observeWrap.append(this.observeButton);

    const actionGrid = document.createElement('div');
    actionGrid.className = 'dom-hud-action-grid';
    actionGrid.setAttribute('role', 'group');
    actionGrid.setAttribute('aria-label', 'Scare abilities');

    bottomLeft.append(ghostCard, observeWrap, actionGrid);

    const zoom = document.createElement('div');
    zoom.className = 'dom-hud-zoom';
    this.zoomInButton = makeCornerButton('＋', 'Zoom in');
    this.zoomOutButton = makeCornerButton('－', 'Zoom out');
    zoom.append(this.zoomInButton, this.zoomOutButton);

    this.root.append(this.topLeftCluster, bottomLeft, zoom);
    parent.append(this.root);

    bindPress(this.objectiveButton, () => {
      this.setObjectiveNotification(false);
      handlers.onObjective();
    });
    bindPress(this.cluesButton, () => {
      handlers.onToggleClues();
    });
    bindPress(this.zoomInButton, () => {
      handlers.onZoomIn();
    });
    bindPress(this.zoomOutButton, () => {
      handlers.onZoomOut();
    });
    bindPress(this.observeButton, () => {
      this.flashButton(this.observeButton);
      handlers.onObserve();
    });

    this.setObjectiveNotification(true);
    this.setCluesNotification(false);
  }

  createActionControls(
    abilities: readonly ScareAbility[],
    onActivate: (ability: ScareAbility) => void,
  ): void {
    const grid = this.root.querySelector('.dom-hud-action-grid');
    if (!grid) throw new Error('Missing action grid for DOM HUD controls.');

    abilities.forEach((ability, index) => {
      const button = makeActionButton(ability.emoji, ability.name);
      button.setAttribute('aria-keyshortcuts', String(index + 1));

      const shortcut = document.createElement('span');
      shortcut.className = 'dom-hud-action-shortcut';
      shortcut.textContent = String(index + 1);
      button.prepend(shortcut);

      const cost = document.createElement('span');
      cost.className = 'dom-hud-action-cost';
      cost.textContent = String(ability.energyCost);
      button.append(cost);

      const lock = document.createElement('span');
      lock.className = 'dom-hud-action-lock';
      lock.textContent = '🚫';
      lock.hidden = true;

      const progressLabel = document.createElement('span');
      progressLabel.className = 'dom-hud-action-progress';
      progressLabel.hidden = true;

      const progressRing = document.createElement('span');
      progressRing.className = 'dom-hud-action-ring';
      progressRing.setAttribute('aria-hidden', 'true');

      button.append(lock, progressLabel, progressRing);

      bindPress(button, () => {
        this.flashButton(button);
        onActivate(ability);
      });

      grid.append(button);
      this.actionButtons.push({ button, lock, progressLabel, progressRing });
    });
  }

  setClueEntries(entries: readonly DomCluePanelEntry[]): void {
    this.clueList.replaceChildren();

    entries.forEach((entry) => {
      const row = document.createElement('li');
      row.className = 'dom-clue-panel-row';

      const glyph = document.createElement('span');
      glyph.className = 'dom-clue-panel-glyph';
      glyph.textContent = entry.discovered ? CATEGORY_GLYPH[entry.category] : '🔒';
      glyph.setAttribute('aria-hidden', 'true');

      const text = document.createElement('span');
      text.className = 'dom-clue-panel-text';
      text.textContent = entry.discovered ? entry.text : '???';
      if (!entry.discovered) {
        text.dataset.locked = 'true';
      }

      row.append(glyph, text);
      this.clueList.append(row);
    });
    this.syncCluePanelScroll();
  }

  setCluePanelOpen(open: boolean): void {
    this.cluePanelOpen = open;
    this.cluePanel.hidden = !open;
    if (open) {
      requestAnimationFrame(() => this.syncCluePanelScroll());
    }
  }

  isCluePanelOpen(): boolean {
    return this.cluePanelOpen;
  }

  setObjectiveNotification(show: boolean): void {
    this.objectiveBadge.hidden = !show;
  }

  setCluesNotification(show: boolean): void {
    this.cluesBadge.hidden = !show;
  }

  setZoomAvailability(canZoomIn: boolean, canZoomOut: boolean): void {
    this.zoomInButton.disabled = !canZoomIn;
    this.zoomOutButton.disabled = !canZoomOut;
  }

  setObserveState(inRange: boolean, observing: boolean, progress: number): void {
    const visible = inRange || observing;
    this.observeButton.style.opacity = visible ? '1' : '0.65';
    this.observeRangeMark.hidden = inRange || observing;
    this.observeProgressLabel.hidden = !observing;
    this.observeButton.dataset.observing = observing ? 'true' : 'false';

    if (observing) {
      const pct = Math.round(progress * 100);
      this.observeProgressLabel.textContent = `${pct}%`;
      this.observeProgressRing.style.setProperty('--progress', String(progress));
    } else {
      this.observeProgressRing.style.removeProperty('--progress');
    }
  }

  setActionAffordable(index: number, affordable: boolean): void {
    const entry = this.actionButtons[index];
    if (!entry) return;
    if (entry.button.dataset.casting === 'true') return;
    entry.lock.hidden = affordable;
    entry.button.style.opacity = affordable ? '1' : '0.55';
  }

  setActionCastState(castingIndex: number | null, progress: number): void {
    this.actionButtons.forEach((entry, index) => {
      const casting = castingIndex === index;
      entry.button.dataset.casting = casting ? 'true' : 'false';
      entry.progressLabel.hidden = !casting;

      if (casting) {
        entry.progressLabel.textContent = `${Math.round(progress * 100)}%`;
        entry.progressRing.style.setProperty('--progress', String(progress));
        entry.button.style.opacity = '1';
        entry.lock.hidden = true;
      } else {
        entry.progressRing.style.removeProperty('--progress');
      }
    });
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.root.remove();
  }

  private readonly handleResize = (): void => {
    if (this.cluePanelOpen) {
      this.syncCluePanelScroll();
    }
  };

  private syncCluePanelScroll(): void {
    const list = this.clueList;
    const overflow = list.scrollHeight > list.clientHeight + 1;
    this.clueScrollWrap.dataset.overflow = overflow ? 'true' : 'false';
    const atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
    this.clueScrollWrap.dataset.scrolledEnd = atEnd ? 'true' : 'false';
  }

  private flashButton(button: HTMLButtonElement): void {
    button.classList.add('dom-hud-button-flash');
    window.setTimeout(() => button.classList.remove('dom-hud-button-flash'), 160);
  }
}

function bindPress(button: HTMLButtonElement, onPress: () => void): void {
  button.addEventListener(
    'pointerdown',
    (event) => {
      if (button.disabled) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.stopPropagation();
      onPress();
    },
    { capture: true },
  );
}

function makeCornerButton(glyph: string, label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dom-hud-button';
  button.setAttribute('aria-label', label);

  const icon = document.createElement('span');
  icon.className = 'dom-hud-glyph';
  icon.textContent = glyph;
  icon.setAttribute('aria-hidden', 'true');
  button.append(icon);

  return button;
}

function makeActionButton(glyph: string, label: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'dom-hud-action-button';
  button.setAttribute('aria-label', label);

  const icon = document.createElement('span');
  icon.className = 'dom-hud-glyph';
  icon.textContent = glyph;
  icon.setAttribute('aria-hidden', 'true');
  button.append(icon);

  return button;
}

function makeBadge(): HTMLElement {
  const badge = document.createElement('span');
  badge.className = 'dom-hud-badge';
  badge.textContent = '!';
  badge.setAttribute('aria-hidden', 'true');
  badge.hidden = true;
  return badge;
}
