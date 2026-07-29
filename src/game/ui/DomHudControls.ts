/**
 * Corner HUD controls as HTML overlays inside #app.
 *
 * Phaser canvas hit-testing is unreliable for top-edge controls under the
 * device-pixel zoom scale. These buttons use normal CSS hit targets (same
 * approach as the fullscreen control) while the rest of the HUD stays in Phaser.
 */

export interface DomHudHandlers {
  readonly onObjective: () => void;
  readonly onToggleClues: () => void;
  readonly onZoomIn: () => void;
  readonly onZoomOut: () => void;
}

export class DomHudControls {
  private readonly root: HTMLElement;
  private readonly objectiveButton: HTMLButtonElement;
  private readonly cluesButton: HTMLButtonElement;
  private readonly zoomInButton: HTMLButtonElement;
  private readonly zoomOutButton: HTMLButtonElement;
  private readonly objectiveBadge: HTMLElement;
  private readonly cluesBadge: HTMLElement;

  constructor(parent: HTMLElement, handlers: DomHudHandlers) {
    this.root = document.createElement('div');
    this.root.id = 'dom-hud';
    this.root.setAttribute('aria-label', 'Game controls');

    const topLeft = document.createElement('div');
    topLeft.className = 'dom-hud-top-left';

    this.objectiveButton = makeHudButton('📋', 'Show objective');
    this.objectiveBadge = makeBadge();
    this.objectiveButton.append(this.objectiveBadge);

    this.cluesButton = makeHudButton('🧩', 'Review clues');
    this.cluesBadge = makeBadge();
    this.cluesButton.append(this.cluesBadge);

    topLeft.append(this.objectiveButton, this.cluesButton);

    const zoom = document.createElement('div');
    zoom.className = 'dom-hud-zoom';
    this.zoomInButton = makeHudButton('＋', 'Zoom in');
    this.zoomOutButton = makeHudButton('－', 'Zoom out');
    zoom.append(this.zoomInButton, this.zoomOutButton);

    this.root.append(topLeft, zoom);
    parent.append(this.root);

    this.objectiveButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.setObjectiveNotification(false);
      handlers.onObjective();
    });
    this.cluesButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      handlers.onToggleClues();
    });
    this.zoomInButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      handlers.onZoomIn();
    });
    this.zoomOutButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      handlers.onZoomOut();
    });

    // Stop the event here so the Phaser canvas under the overlay never sees it.
    // preventDefault avoids touch scrolling / synthetic quirks near screen edges.
    for (const button of [this.objectiveButton, this.cluesButton, this.zoomInButton, this.zoomOutButton]) {
      button.addEventListener(
        'pointerdown',
        (event) => {
          event.preventDefault();
          event.stopPropagation();
        },
        { capture: true },
      );
    }

    this.setObjectiveNotification(true);
    this.setCluesNotification(false);
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

  destroy(): void {
    this.root.remove();
  }
}

function makeHudButton(glyph: string, label: string): HTMLButtonElement {
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

function makeBadge(): HTMLElement {
  const badge = document.createElement('span');
  badge.className = 'dom-hud-badge';
  badge.textContent = '!';
  badge.setAttribute('aria-hidden', 'true');
  badge.hidden = true;
  return badge;
}
