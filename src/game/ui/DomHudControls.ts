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
  readonly onNextVisit?: () => void;
  readonly onSkipTutorial?: () => void;
}

export type DomTutorialHighlight = 'observe' | 'clues' | 'scareGrid' | 'results' | 'nextVisit' | null;

export interface DomTutorialPresentation {
  readonly instruction: string | null;
  readonly icon: string | null;
  readonly highlight: DomTutorialHighlight;
  readonly showSkip: boolean;
  readonly coachingHint: string | null;
  readonly coachingIcon: string | null;
}

export interface DomVisitResultsView {
  readonly headline: string;
  readonly outcomeGlyph: string;
  readonly outcomeLabel: string;
  readonly stageLine: string;
  readonly scoreLine: string;
  readonly bonusLine: string | null;
  readonly notes: readonly string[];
  readonly cluesTitle: string;
  readonly clueLines: readonly string[];
  readonly tip: string;
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
  private readonly visitCue: HTMLElement;
  private readonly visitCueGlyph: HTMLElement;
  private readonly visitCueText: HTMLElement;
  private readonly resultsOverlay: HTMLElement;
  private readonly resultsBody: HTMLElement;
  private readonly nextVisitButton: HTMLButtonElement;
  private readonly tutorialBanner: HTMLElement;
  private readonly tutorialIcon: HTMLElement;
  private readonly tutorialText: HTMLElement;
  private readonly tutorialSkipButton: HTMLButtonElement;
  private readonly actionGrid: HTMLElement;
  private cluePanelOpen = false;
  private gameplayLocked = false;
  private visitCueHideTimer = 0;

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
    this.cluesButton.dataset.tutorialTarget = 'clues';
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
    this.observeButton = makeActionButton('👁', 'Observe visitor');
    this.observeButton.classList.add('dom-hud-observe-button');
    this.observeButton.dataset.tutorialTarget = 'observe';
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
    actionGrid.dataset.tutorialTarget = 'scareGrid';
    this.actionGrid = actionGrid;

    bottomLeft.append(ghostCard, observeWrap, actionGrid);

    const zoom = document.createElement('div');
    zoom.className = 'dom-hud-zoom';
    this.zoomInButton = makeCornerButton('＋', 'Zoom in');
    this.zoomOutButton = makeCornerButton('－', 'Zoom out');
    zoom.append(this.zoomInButton, this.zoomOutButton);

    this.visitCue = document.createElement('div');
    this.visitCue.className = 'dom-visit-cue';
    this.visitCue.hidden = true;
    this.visitCue.setAttribute('role', 'status');
    this.visitCueGlyph = document.createElement('span');
    this.visitCueGlyph.className = 'dom-visit-cue-glyph';
    this.visitCueGlyph.setAttribute('aria-hidden', 'true');
    const visitCueCopy = document.createElement('div');
    visitCueCopy.className = 'dom-visit-cue-copy';
    this.visitCueText = document.createElement('p');
    this.visitCueText.className = 'dom-visit-cue-text';
    visitCueCopy.append(this.visitCueText);
    this.visitCue.append(this.visitCueGlyph, visitCueCopy);

    this.resultsOverlay = document.createElement('div');
    this.resultsOverlay.className = 'dom-results-overlay';
    this.resultsOverlay.hidden = true;
    this.resultsOverlay.setAttribute('role', 'dialog');
    this.resultsOverlay.setAttribute('aria-modal', 'true');
    this.resultsOverlay.setAttribute('aria-label', 'Visit results');

    const resultsPanel = document.createElement('div');
    resultsPanel.className = 'dom-results-panel';
    this.resultsBody = document.createElement('div');
    this.resultsBody.className = 'dom-results-body';
    this.nextVisitButton = document.createElement('button');
    this.nextVisitButton.type = 'button';
    this.nextVisitButton.className = 'dom-results-next-button';
    this.nextVisitButton.textContent = 'Next visit';
    this.nextVisitButton.setAttribute('aria-label', 'Start the next visit');
    this.nextVisitButton.dataset.tutorialTarget = 'nextVisit';
    resultsPanel.append(this.resultsBody, this.nextVisitButton);
    this.resultsOverlay.append(resultsPanel);
    this.resultsOverlay.dataset.tutorialTarget = 'results';

    this.tutorialBanner = document.createElement('div');
    this.tutorialBanner.className = 'dom-tutorial-banner';
    this.tutorialBanner.hidden = true;
    this.tutorialBanner.setAttribute('role', 'status');
    this.tutorialBanner.setAttribute('aria-live', 'polite');
    this.tutorialIcon = document.createElement('span');
    this.tutorialIcon.className = 'dom-tutorial-icon';
    this.tutorialIcon.setAttribute('aria-hidden', 'true');
    this.tutorialText = document.createElement('p');
    this.tutorialText.className = 'dom-tutorial-text';
    this.tutorialSkipButton = document.createElement('button');
    this.tutorialSkipButton.type = 'button';
    this.tutorialSkipButton.className = 'dom-tutorial-skip';
    this.tutorialSkipButton.textContent = 'Skip help';
    this.tutorialSkipButton.setAttribute('aria-label', 'Skip tutorial help');
    this.tutorialBanner.append(this.tutorialIcon, this.tutorialText, this.tutorialSkipButton);

    this.root.append(
      this.topLeftCluster,
      bottomLeft,
      zoom,
      this.visitCue,
      this.tutorialBanner,
      this.resultsOverlay,
    );
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
    bindPress(this.nextVisitButton, () => {
      handlers.onNextVisit?.();
    });
    bindPress(this.tutorialSkipButton, () => {
      handlers.onSkipTutorial?.();
    });

    this.setObjectiveNotification(true);
    this.setCluesNotification(false);
  }

  createActionControls(
    abilities: readonly ScareAbility[],
    onActivate: (ability: ScareAbility) => void,
  ): void {
    this.actionGrid.replaceChildren();
    this.actionButtons.length = 0;

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

      this.actionGrid.append(button);
      this.actionButtons.push({ button, lock, progressLabel, progressRing });
    });
  }

  setTutorialPresentation(presentation: DomTutorialPresentation): void {
    const message =
      presentation.instruction ??
      presentation.coachingHint;
    const icon = presentation.instruction
      ? presentation.icon
      : presentation.coachingIcon;

    if (!message) {
      this.tutorialBanner.hidden = true;
      this.clearTutorialHighlights();
      return;
    }

    this.tutorialIcon.textContent = icon ?? '💡';
    this.tutorialText.textContent = message;
    this.tutorialSkipButton.hidden = !presentation.showSkip;
    this.tutorialBanner.hidden = false;
    this.applyTutorialHighlight(presentation.highlight);
  }

  hideTutorialPresentation(): void {
    this.tutorialBanner.hidden = true;
    this.clearTutorialHighlights();
  }

  private applyTutorialHighlight(target: DomTutorialHighlight): void {
    this.clearTutorialHighlights();
    if (!target) return;

    const selector = `[data-tutorial-target="${target}"]`;
    const element = this.root.querySelector(selector);
    if (element instanceof HTMLElement) {
      element.classList.add('dom-tutorial-highlight');
    }
  }

  private clearTutorialHighlights(): void {
    this.root.querySelectorAll('.dom-tutorial-highlight').forEach((node) => {
      node.classList.remove('dom-tutorial-highlight');
    });
  }

  getTutorialBannerElement(): HTMLElement {
    return this.tutorialBanner;
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

  setObserveLabel(visitorName: string): void {
    this.observeButton.title = `Observe ${visitorName}`;
    this.observeButton.setAttribute('aria-label', `Observe ${visitorName}`);
  }

  setObjectiveText(text: string): void {
    this.objectiveButton.title = text;
    this.objectiveButton.setAttribute('aria-label', text);
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

  setVisitCue(glyph: string, message: string): void {
    this.visitCueGlyph.textContent = glyph;
    this.visitCueText.textContent = message;
    this.visitCue.hidden = false;
    window.clearTimeout(this.visitCueHideTimer);
    this.visitCueHideTimer = window.setTimeout(() => {
      this.visitCue.hidden = true;
    }, 2800);
  }

  hideVisitCue(): void {
    window.clearTimeout(this.visitCueHideTimer);
    this.visitCue.hidden = true;
  }

  showVisitResults(summary: DomVisitResultsView): void {
    this.resultsBody.replaceChildren();

    const headline = document.createElement('h2');
    headline.className = 'dom-results-headline';
    headline.textContent = summary.headline;

    const outcomeRow = document.createElement('p');
    outcomeRow.className = 'dom-results-outcome';
    const outcomeGlyph = document.createElement('span');
    outcomeGlyph.className = 'dom-results-outcome-glyph';
    outcomeGlyph.textContent = summary.outcomeGlyph;
    outcomeGlyph.setAttribute('aria-hidden', 'true');
    const outcomeLabel = document.createElement('span');
    outcomeLabel.className = 'dom-results-outcome-label';
    outcomeLabel.textContent = summary.outcomeLabel;
    outcomeRow.append(outcomeGlyph, outcomeLabel);

    const stage = document.createElement('p');
    stage.className = 'dom-results-line';
    stage.textContent = summary.stageLine;

    const score = document.createElement('p');
    score.className = 'dom-results-line dom-results-score';
    score.textContent = summary.scoreLine;

    this.resultsBody.append(headline, outcomeRow, stage, score);

    if (summary.bonusLine) {
      const bonus = document.createElement('p');
      bonus.className = 'dom-results-line';
      bonus.textContent = summary.bonusLine;
      this.resultsBody.append(bonus);
    }

    summary.notes.forEach((note) => {
      const line = document.createElement('p');
      line.className = 'dom-results-note';
      line.textContent = note;
      this.resultsBody.append(line);
    });

    const cluesTitle = document.createElement('h3');
    cluesTitle.className = 'dom-results-subtitle';
    cluesTitle.textContent = summary.cluesTitle;
    this.resultsBody.append(cluesTitle);

    const clueList = document.createElement('ul');
    clueList.className = 'dom-results-clue-list';
    summary.clueLines.forEach((text) => {
      const item = document.createElement('li');
      item.textContent = text;
      clueList.append(item);
    });
    this.resultsBody.append(clueList);

    const tip = document.createElement('p');
    tip.className = 'dom-results-tip';
    tip.textContent = `Tip: ${summary.tip}`;
    this.resultsBody.append(tip);

    this.resultsOverlay.hidden = false;
    this.gameplayLocked = true;
    this.applyGameplayLock();
  }

  hideVisitResults(): void {
    this.resultsOverlay.hidden = true;
    this.applyGameplayLock();
  }

  setGameplayLocked(locked: boolean): void {
    this.gameplayLocked = locked;
    this.applyGameplayLock();
  }

  getResultsOverlayElement(): HTMLElement {
    return this.resultsOverlay;
  }

  private applyGameplayLock(): void {
    const locked = this.gameplayLocked || !this.resultsOverlay.hidden;
    this.observeButton.disabled = locked;
    this.actionButtons.forEach(({ button }) => {
      button.disabled = locked;
    });
  }

  destroy(): void {
    window.clearTimeout(this.visitCueHideTimer);
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
