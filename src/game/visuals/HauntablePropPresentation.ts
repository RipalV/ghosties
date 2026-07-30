import Phaser from 'phaser';
import { LOBBY_PROPS, type LobbyPropDefinition } from '../content/lobbyProps';
import { isWithinRadius } from '../props/propDistance';
import { isPropAwarded, type PropVisitState } from '../props';
import { drawIsoBox, shadeColor } from './isoDraw';
import { PALETTE } from './lobbyTheme';

type PropVisualPhase = 'idle' | 'proximity' | 'casting' | 'resolve';

interface PropVisual {
  readonly prop: LobbyPropDefinition;
  readonly container: Phaser.GameObjects.Container;
  readonly glow: Phaser.GameObjects.Arc;
  readonly icon: Phaser.GameObjects.Text;
  readonly silhouette: Phaser.GameObjects.Graphics;
}

/**
 * Gameplay overlays for hauntable lobby props: proximity cue, cast pulse, resolve burst.
 * Static furniture silhouettes remain in LobbyEnvironment.
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
      const casting = propId !== null && visual.prop.id === propId;
      visual.container.setData('casting', casting);
    }
  }

  playResolveReaction(prop: LobbyPropDefinition, reactionCopy: string): void {
    const visual = this.visuals.find((entry) => entry.prop.id === prop.id);
    if (!visual) return;

    visual.container.setData('resolveUntil', this.container.scene.time.now + 900);
    visual.icon.setText('✨');
    visual.glow.setAlpha(0.55);

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
    switch (phase) {
      case 'casting':
        visual.glow.setFillStyle(PALETTE.ghostGlow, 0.42);
        visual.glow.setScale(1.15);
        visual.glow.setAlpha(0.5);
        visual.icon.setText('👻');
        visual.icon.setAlpha(1);
        break;
      case 'proximity':
        visual.glow.setFillStyle(PALETTE.brass, 0.35);
        visual.glow.setScale(1.05);
        visual.glow.setAlpha(0.38);
        visual.icon.setText('◇');
        visual.icon.setAlpha(0.95);
        break;
      case 'resolve':
        visual.glow.setFillStyle(PALETTE.lampWarm, 0.45);
        visual.glow.setScale(1.2);
        visual.glow.setAlpha(0.55);
        visual.icon.setText('✨');
        visual.icon.setAlpha(1);
        break;
      default:
        visual.glow.setFillStyle(PALETTE.hudStroke, 0.12);
        visual.glow.setScale(0.85);
        visual.glow.setAlpha(0.15);
        visual.icon.setText('');
        visual.icon.setAlpha(0);
        break;
    }
  }

  private createPropVisual(scene: Phaser.Scene, prop: LobbyPropDefinition): PropVisual {
    const container = scene.add.container(prop.position.x, prop.position.y);
    const glow = scene.add.circle(0, -8, 36, PALETTE.hudStroke, 0.12);
    const silhouette = scene.add.graphics();
    this.drawSilhouette(silhouette, prop.visualKey);
    const icon = scene.add.text(0, -46, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '22px',
      color: '#fff7cf',
    }).setOrigin(0.5);

    container.add([glow, silhouette, icon]);

    scene.tweens.add({
      targets: glow,
      scale: { from: 0.82, to: 0.92 },
      alpha: { from: 0.1, to: 0.22 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
    });

    return { prop, container, glow, icon, silhouette };
  }

  private drawSilhouette(g: Phaser.GameObjects.Graphics, visualKey: string): void {
    switch (visualKey) {
      case 'bell':
        drawIsoBox(g, { x: 0, y: 8, width: 28, depth: 18, height: 10, color: PALETTE.brass });
        g.fillStyle(PALETTE.brass, 1);
        g.fillCircle(0, -10, 10);
        break;
      case 'portrait':
        drawIsoBox(g, { x: 0, y: 6, width: 52, depth: 12, height: 38, color: PALETTE.wood });
        g.fillStyle(0x2a1f40, 1);
        g.fillRect(-18, -28, 36, 28);
        g.lineStyle(2, PALETTE.woodLight, 0.85);
        g.strokeRect(-18, -28, 36, 28);
        break;
      case 'fireplace':
        drawIsoBox(g, { x: 0, y: 10, width: 70, depth: 34, height: 42, color: shadeColor(PALETTE.wood, 0.82) });
        g.fillStyle(PALETTE.moonlight, 0.35);
        g.fillRect(-16, -18, 32, 22);
        g.lineStyle(2, PALETTE.brass, 0.7);
        g.strokeRect(-16, -18, 32, 22);
        break;
      default:
        break;
    }
  }
}
