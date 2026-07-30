import Phaser from 'phaser';
import { LOBBY_PROPS, type LobbyPropDefinition } from '../content/lobbyProps';
import { isWithinRadius } from '../props/propDistance';
import { isPropAwarded, type PropVisitState } from '../props';
import { PALETTE } from './lobbyTheme';

type PropVisualPhase = 'idle' | 'proximity' | 'casting' | 'resolve';

interface PropVisual {
  readonly prop: LobbyPropDefinition;
  readonly container: Phaser.GameObjects.Container;
  readonly ring: Phaser.GameObjects.Graphics;
  readonly glow: Phaser.GameObjects.Arc;
  readonly icon: Phaser.GameObjects.Text;
}

/**
 * Gameplay overlays for hauntable lobby props.
 * Furniture silhouettes stay in LobbyEnvironment — this only shows proximity /
 * cast / resolve cues so props are never double-drawn as crude boxes.
 */
export class HauntablePropPresentation {
  readonly container: Phaser.GameObjects.Container;

  private readonly visuals: PropVisual[];
  private readonly resolveBursts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.container = scene.add.container(0, 0).setDepth(12);
    this.visuals = LOBBY_PROPS.map((prop) => this.createPropVisual(scene, prop));
    this.container.add(this.visuals.map((entry) => entry.container));
  }

  update(
    ghost: { x: number; y: number },
    propState: PropVisitState,
    visitorTargetable: boolean,
  ): void {
    for (const visual of this.visuals) {
      const phase = this.resolvePhase(visual.prop, ghost, propState, visitorTargetable);
      this.applyPhase(visual, phase);
    }
  }

  setLinkedProp(propId: string | null): void {
    for (const visual of this.visuals) {
      visual.container.setData('casting', propId !== null && visual.prop.id === propId);
    }
  }

  playResolveReaction(prop: LobbyPropDefinition, reactionCopy: string): void {
    const visual = this.visuals.find((entry) => entry.prop.id === prop.id);
    if (!visual) return;

    visual.container.setData('resolveUntil', this.container.scene.time.now + 900);

    const burst = this.container.scene.add
      .text(visual.prop.position.x, visual.prop.position.y - 72, reactionCopy, {
        fontFamily: 'Trebuchet MS',
        fontSize: '15px',
        color: '#fff7cf',
        backgroundColor: '#241836cc',
        padding: { x: 8, y: 4 },
        align: 'center',
        wordWrap: { width: 180 },
      })
      .setOrigin(0.5)
      .setDepth(80)
      .setAlpha(0);

    this.container.add(burst);
    this.resolveBursts.push(burst);

    this.container.scene.tweens.add({
      targets: burst,
      alpha: { from: 0, to: 1 },
      y: burst.y - 18,
      duration: 220,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.container.scene.tweens.add({
          targets: burst,
          alpha: 0,
          duration: 520,
          delay: 700,
          onComplete: () => {
            burst.destroy();
            const index = this.resolveBursts.indexOf(burst);
            if (index >= 0) this.resolveBursts.splice(index, 1);
          },
        });
      },
    });
  }

  clearCasting(): void {
    this.setLinkedProp(null);
  }

  destroy(): void {
    for (const burst of this.resolveBursts) {
      burst.destroy();
    }
    this.resolveBursts.length = 0;
    this.container.destroy(true);
  }

  private resolvePhase(
    prop: LobbyPropDefinition,
    ghost: { x: number; y: number },
    propState: PropVisitState,
    visitorTargetable: boolean,
  ): PropVisualPhase {
    const visual = this.visuals.find((entry) => entry.prop.id === prop.id);
    const resolveUntil = visual?.container.getData('resolveUntil') as number | undefined;
    if (resolveUntil && this.container.scene.time.now < resolveUntil) {
      return 'resolve';
    }

    if (propState.linkedPropId === prop.id) {
      return 'casting';
    }

    if (
      visitorTargetable &&
      !isPropAwarded(propState, prop.id) &&
      isWithinRadius(ghost, prop.position, prop.ghostActivationRadius)
    ) {
      return 'proximity';
    }

    return 'idle';
  }

  private applyPhase(visual: PropVisual, phase: PropVisualPhase): void {
    visual.ring.clear();

    if (phase === 'idle') {
      visual.glow.setAlpha(0);
      visual.glow.setScale(0.8);
      visual.icon.setText('');
      visual.icon.setAlpha(0);
      return;
    }

    const ringColor =
      phase === 'casting'
        ? PALETTE.ghostGlow
        : phase === 'resolve'
          ? PALETTE.lampWarm
          : PALETTE.brass;

    // Diamond ring + icon (shape + motion), never colour alone.
    visual.ring.lineStyle(3, ringColor, phase === 'proximity' ? 0.75 : 0.95);
    visual.ring.strokeTriangle(0, -28, -22, 10, 22, 10);
    visual.ring.lineStyle(2, ringColor, 0.45);
    visual.ring.strokeCircle(0, -4, 34);

    visual.glow.setFillStyle(ringColor, phase === 'casting' ? 0.32 : 0.22);
    visual.glow.setScale(phase === 'resolve' ? 1.2 : phase === 'casting' ? 1.12 : 1);
    visual.glow.setAlpha(phase === 'casting' ? 0.45 : 0.32);

    const icon =
      phase === 'casting' ? '👻' : phase === 'resolve' ? '✨' : this.idleCueIcon(visual.prop.visualKey);
    visual.icon.setText(icon);
    visual.icon.setAlpha(1);
  }

  private idleCueIcon(visualKey: string): string {
    if (visualKey === 'bell') return '🛎';
    if (visualKey === 'portrait') return '🖼';
    if (visualKey === 'fireplace') return '❄';
    return '◇';
  }

  private createPropVisual(scene: Phaser.Scene, prop: LobbyPropDefinition): PropVisual {
    const container = scene.add.container(prop.position.x, prop.position.y);
    const glow = scene.add.circle(0, -4, 32, PALETTE.hudStroke, 0).setAlpha(0);
    const ring = scene.add.graphics();
    const icon = scene.add
      .text(0, -52, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '22px',
        color: '#fff7cf',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    container.add([glow, ring, icon]);

    scene.tweens.add({
      targets: glow,
      scale: { from: 0.95, to: 1.08 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });

    return { prop, container, ring, glow, icon };
  }
}
