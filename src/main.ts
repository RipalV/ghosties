import Phaser from 'phaser';
import { GameScene } from './game/scenes/GameScene';
import './styles/main.css';

// Only block when the viewport is taller than it is wide (true portrait).
// Do not use a large min-width — many phones in landscape are under 700 CSS px.
const MIN_PLAYABLE_WIDTH = 480;

/**
 * Render at the device pixel ratio, capped so ordinary phones keep a
 * comfortable fill-rate. Game units are therefore device pixels; the scene
 * scales HUD metrics by the same factor.
 */
const RENDER_SCALE = Math.min(window.devicePixelRatio || 1, 2);

const parent = document.getElementById('app');
if (!parent) throw new Error('Missing #app game container.');

function cssViewportSize(): { width: number; height: number } {
  return {
    width: Math.max(parent!.clientWidth, 1),
    height: Math.max(parent!.clientHeight, 1),
  };
}

const initialSize = cssViewportSize();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#141130',
  // The prototype has no sound, so skip the audio context Chrome warns about.
  audio: { noAudio: true },
  scale: {
    // NONE with an inverse zoom keeps the drawing buffer at device resolution
    // while the canvas still displays at the viewport's CSS size, so vector art
    // and small HUD text stay crisp. Sizes are managed by resizeGame below.
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.NO_CENTER,
    width: initialSize.width * RENDER_SCALE,
    height: initialSize.height * RENDER_SCALE,
    zoom: 1 / RENDER_SCALE,
    fullscreenTarget: 'app',
  },
  scene: [GameScene],
};

const game = new Phaser.Game(config);

function resizeGame(): void {
  if (!game.isBooted) return;
  const { width, height } = cssViewportSize();
  game.scale.resize(width * RENDER_SCALE, height * RENDER_SCALE);
}

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

function refreshViewport(): void {
  resizeGame();
  updateOrientationPrompt();
}

new ResizeObserver(refreshViewport).observe(parent);
window.addEventListener('resize', refreshViewport);
// Some mobile browsers report stale sizes during orientationchange; re-check soon after.
window.addEventListener('orientationchange', () => {
  refreshViewport();
  window.setTimeout(refreshViewport, 250);
});
game.events.once('ready', refreshViewport);
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
      window.setTimeout(refreshViewport, 120);
    });
    document.addEventListener('fullscreenchange', () => {
      syncFullscreenButton();
      refreshViewport();
      requestAnimationFrame(() => {
        refreshViewport();
      });
    });
    document.addEventListener('webkitfullscreenchange', () => {
      syncFullscreenButton();
      refreshViewport();
      requestAnimationFrame(() => {
        refreshViewport();
      });
    });
  }
}
