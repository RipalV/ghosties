import Phaser from 'phaser';
import { GameScene } from './game/scenes/GameScene';
import './styles/main.css';

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

// On touch devices, request browser fullscreen after the first tap when supported.
// iOS Safari often ignores this; CSS already fills the visual viewport.
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
