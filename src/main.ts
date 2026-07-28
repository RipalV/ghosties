import Phaser from 'phaser';
import { GameScene } from './game/scenes/GameScene';
import './styles/main.css';

const MIN_LANDSCAPE_WIDTH = 700;

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

function updateOrientationPrompt(): void {
  const prompt = document.getElementById('rotate-prompt');
  if (!prompt) return;

  const tooNarrow = window.innerWidth < MIN_LANDSCAPE_WIDTH;
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  const shouldBlock = isPortrait || tooNarrow;

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
window.addEventListener('orientationchange', updateOrientationPrompt);
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
