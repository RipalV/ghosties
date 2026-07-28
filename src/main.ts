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
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 600,
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

// On touch devices, request browser fullscreen after the first tap when supported.
const preferTouchFullscreen = window.matchMedia('(pointer: coarse)').matches;

if (preferTouchFullscreen) {
  const tryEnterFullscreen = (): void => {
    if (game.scale.isFullscreen) return;
    try {
      game.scale.startFullscreen();
    } catch {
      // Unsupported platforms fail silently; layout still fills the viewport.
    }
  };

  game.events.once('ready', () => {
    game.canvas?.addEventListener('pointerdown', tryEnterFullscreen, { once: true });
  });
}
