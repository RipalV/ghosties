import Phaser from 'phaser';
import type { ScareAbility } from '../abilities/ScareAbility';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';
import { AbilityButton } from './AbilityButton';

export interface HudSnapshot {
  score: number;
  energy: number;
  fear: number;
  stage: string;
}

/**
 * Screen-space HUD: score/objective top-left, fear/energy top-right, scare
 * controls along the bottom. Every element is repositioned from the live
 * viewport size so the layout works on landscape phones and desktop alike.
 */
export class GameHud {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly objectiveText: Phaser.GameObjects.Text;
  private readonly fearText: Phaser.GameObjects.Text;
  private readonly energyText: Phaser.GameObjects.Text;
  private readonly statusText: Phaser.GameObjects.Text;
  private readonly leftPanel: Phaser.GameObjects.Rectangle;
  private readonly rightPanel: Phaser.GameObjects.Rectangle;
  private readonly abilityButtons: AbilityButton[] = [];

  /** Top edge of the bottom control band, in screen pixels. */
  private abilityBandTop = 0;

  constructor(private readonly scene: Phaser.Scene) {
    const depth = 100;

    this.leftPanel = scene.add.rectangle(0, 0, 300, HUD_LAYOUT.panelHeight, PALETTE.hudPanel, 0.86)
      .setStrokeStyle(2, PALETTE.hudStroke, 0.85)
      .setOrigin(0, 0)
      .setDepth(depth)
      .setScrollFactor(0);

    this.rightPanel = scene.add.rectangle(0, 0, 280, HUD_LAYOUT.panelHeight, PALETTE.hudPanel, 0.86)
      .setStrokeStyle(2, PALETTE.hudStroke, 0.85)
      .setOrigin(1, 0)
      .setDepth(depth)
      .setScrollFactor(0);

    this.scoreText = scene.add.text(0, 0, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#fff7cf',
      fontStyle: 'bold',
    }).setDepth(depth + 1).setScrollFactor(0);

    this.objectiveText = scene.add.text(0, 0, 'Haunt Nora (gently!)', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#d8cef7',
    }).setDepth(depth + 1).setScrollFactor(0);

    this.fearText = scene.add.text(0, 0, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#fff7cf',
      align: 'right',
    }).setOrigin(1, 0).setDepth(depth + 1).setScrollFactor(0);

    this.energyText = scene.add.text(0, 0, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#d8cef7',
      align: 'right',
    }).setOrigin(1, 0).setDepth(depth + 1).setScrollFactor(0);

    this.statusText = scene.add.text(0, 0, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#fff7cf',
      align: 'center',
      backgroundColor: '#241836cc',
      padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(depth + 1).setScrollFactor(0);
  }

  createAbilityControls(abilities: readonly ScareAbility[], onActivate: (ability: ScareAbility) => void): void {
    abilities.forEach((ability, index) => {
      this.abilityButtons.push(
        new AbilityButton(this.scene, ability, String(index + 1), () => onActivate(ability)),
      );
    });
  }

  /** Screen-space top of the control band; taps below it belong to the HUD. */
  get controlBandTop(): number {
    return this.abilityBandTop;
  }

  layout(width: number, height: number): void {
    const pad = HUD_LAYOUT.padding;

    const panelWidth = Math.min(300, Math.max(190, width * 0.4));
    this.leftPanel.setPosition(pad, pad).setSize(panelWidth, HUD_LAYOUT.panelHeight);
    this.scoreText.setPosition(pad + 14, pad + 8);
    this.objectiveText.setPosition(pad + 14, pad + 34);

    const rightWidth = Math.min(280, Math.max(180, width * 0.38));
    this.rightPanel.setPosition(width - pad, pad).setSize(rightWidth, HUD_LAYOUT.panelHeight);
    this.fearText.setPosition(width - pad - 14, pad + 8);
    this.energyText.setPosition(width - pad - 14, pad + 34);

    const count = Math.max(this.abilityButtons.length, 1);
    const totalWidth = count * HUD_LAYOUT.abilityWidth + (count - 1) * HUD_LAYOUT.abilityGap;
    const availableWidth = width - pad * 2;
    const minScale = HUD_LAYOUT.minTouchPx / HUD_LAYOUT.abilityHeight;
    const buttonScale = Phaser.Math.Clamp(availableWidth / totalWidth, minScale, 1);

    const scaledWidth = HUD_LAYOUT.abilityWidth * buttonScale;
    const scaledGap = HUD_LAYOUT.abilityGap * buttonScale;
    const scaledHeight = HUD_LAYOUT.abilityHeight * buttonScale;
    const rowWidth = count * scaledWidth + (count - 1) * scaledGap;
    const rowY = height - pad - scaledHeight / 2;
    let cursorX = (width - rowWidth) / 2 + scaledWidth / 2;

    this.abilityButtons.forEach((button) => {
      button.setScale(buttonScale).setPosition(cursorX, rowY);
      cursorX += scaledWidth + scaledGap;
    });

    this.abilityBandTop = rowY - scaledHeight / 2 - 8;
    this.statusText
      .setPosition(width / 2, this.abilityBandTop - 22)
      .setWordWrapWidth(Math.max(240, width - pad * 4));
  }

  setStatus(message: string): void {
    this.statusText.setText(message);
  }

  update(snapshot: HudSnapshot): void {
    this.scoreText.setText(`Score ${snapshot.score}`);
    this.fearText.setText(`Nora · ${snapshot.stage.toUpperCase()}`);
    this.energyText.setText(`Fear ${snapshot.fear}/100 · Energy ${snapshot.energy}`);
  }
}
