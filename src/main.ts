import Phaser from 'phaser';
import { GameScene } from './game/scenes/GameScene';
import './styles/main.css';

// Only block when the viewport is taller than it is wide (true portrait).
// Do not use a large min-width — many phones in landscape are under 700 CSS px.
const MIN_PLAYABLE_WIDTH = 480;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#17142b',
  scale: {
    // RESIZE keeps the canvas exactly the size of the viewport, so no letterbox
    // bars appear on wide phone screens. GameScene lays itself out on resize.
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: '100%',
    height: '100%',
    fullscreenTarget: 'app',
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);

function isPortraitViewport(): boolean {
  const width = window.innerWidth;
  const height = window.innerHeight;
  // Prefer geometry over matchMedia — browser chrome and mobile Safari can
  // disagree with (orientation: portrait) after rotation.
  return height > width || width < MIN_PLAYABLE_WIDTH;
}

function updateOrientationPrompt(): void {
  const prompt = document.getElementById('rotate-prompt');
  if (!prompt) return;

  const shouldBlock = isPortraitViewport();

  prompt.dataset.visible = shouldBlock ? 'true' : 'false';
  prompt.hidden = !shouldBlock;
  prompt.setAttribute('aria-hidden', shouldBlock ? 'false' : 'true');

  const canvas = game.canvas;
  if (canvas) {
    canvas.style.visibility = shouldBlock ? 'hidden' : 'visible';
    canvas.setAttribute('aria-hidden', shouldBlock ? 'true' : 'false');
  }
}

window.addEventListener('resize', updateOrientationPrompt);
// Some mobile browsers report stale sizes during orientationchange; re-check soon after.
window.addEventListener('orientationchange', () => {
  updateOrientationPrompt();
  window.setTimeout(updateOrientationPrompt, 250);
});
game.events.once('ready', updateOrientationPrompt);
updateOrientationPrompt();

const fullscreenButton = document.getElementById('fullscreen-toggle');
const fullscreenSupported = game.scale.fullscreen.available;

function syncFullscreenButton(): void {
  if (!fullscreenButton) return;
  const active = game.scale.isFullscreen;
  fullscreenButton.textContent = active ? '✕' : '⛶';
  fullscreenButton.setAttribute(
    'aria-label',
    active ? 'Leave full screen' : 'Play in full screen',
  );
}

if (fullscreenButton) {
  if (!fullscreenSupported) {
    fullscreenButton.hidden = true;
  } else {
    syncFullscreenButton();
    // Fullscreen must be requested from a user gesture, so it stays a button.
    fullscreenButton.addEventListener('click', () => {
      game.scale.toggleFullscreen();
      syncFullscreenButton();
    });
    document.addEventListener('fullscreenchange', syncFullscreenButton);
    document.addEventListener('webkitfullscreenchange', syncFullscreenButton);
  }
}
