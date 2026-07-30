import Phaser from 'phaser';
import { NORA_CONTENT } from '../content/nora';
import type { FearProfile, FearStage, ScareHistory } from '../fear/FearEngine';
import { CharacterMarker } from '../visuals/CharacterMarker';
import { HUD_LAYOUT, PALETTE } from '../visuals/lobbyTheme';
import { cssToWorldUnits, fitsAboveHead } from '../visuals/overheadPlacement';
import { clampToFloor } from '../world/lobbyGeometry';
import { MOVEMENT, NORA_ROUTE } from '../world/lobbyLayout';

const STAGE_WORDS: Record<FearStage, string> = {
  calm: 'CALM',
  curious: 'CURIOUS',
  uneasy: 'UNEASY',
  frightened: 'SCARED',
  runaway: 'FLEEING',
  swoon: 'SWOON',
  possessed: 'HAUNTED',
};

const FACE_BY_STAGE: Record<FearStage, string> = {
  calm: '•‿•',
  curious: '•o•',
  uneasy: '•﹏•',
  frightened: '⊙﹏⊙',
  runaway: 'ᗒ﹏ᗕ',
  swoon: '×﹏×',
  possessed: '◉ᴗ◉',
};

export const NPC_MAX_FEAR = 100;

const BUBBLE_ABOVE_Y = -96;
const BUBBLE_BELOW_Y = 74;
const MARKER_ABOVE_Y = -56;
const MARKER_BELOW_Y = 58;
/** Screen space the top chips and objective button occupy, in CSS pixels. */
const TOP_HUD_CLEARANCE_CSS =
  HUD_LAYOUT.padding + Math.max(HUD_LAYOUT.chipHeight, HUD_LAYOUT.objectiveSize) + 8;

export class Npc extends Phaser.GameObjects.Container {
  readonly fearProfile: FearProfile = NORA_CONTENT.fearProfile;

  readonly scareHistory: ScareHistory = { usesByCategory: {} };
  fear = 0;
  stage: FearStage = 'calm';

  private readonly bodyShape: Phaser.GameObjects.Arc;
  private readonly face: Phaser.GameObjects.Text;
  private readonly marker: CharacterMarker;
  private readonly reactionBubble: Phaser.GameObjects.Text;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly waypoints: Phaser.Math.Vector2[];
  private waypointIndex = 0;
  private moveSpeed = MOVEMENT.npcSpeed;
  private pausedUntil = 0;
  private wasMoving = false;
  private scareCastReactionActive = false;
  private scareCastTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.shadow = scene.add.ellipse(0, 34, 48, 18, 0x000000, 0.24);

    const body = scene.add.graphics();
    body.fillStyle(PALETTE.noraDress, 1);
    body.lineStyle(2, PALETTE.noraTrim, 0.9);
    body.beginPath();
    body.moveTo(-13, -2);
    body.lineTo(13, -2);
    body.lineTo(20, 30);
    body.lineTo(-20, 30);
    body.closePath();
    body.fillPath();
    body.strokePath();
    body.fillStyle(PALETTE.noraSkin, 1);
    body.fillCircle(-15, 8, 5);
    body.fillCircle(15, 8, 5);
    body.fillStyle(PALETTE.noraTrim, 1);
    body.fillCircle(0, -12, 24);

    this.bodyShape = scene.add.circle(0, -6, 22, PALETTE.noraSkin, 1);
    this.bodyShape.setStrokeStyle(3, PALETTE.noraTrim, 1);
    this.face = scene.add.text(0, -7, FACE_BY_STAGE.calm, {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#4a2846',
    }).setOrigin(0.5);
    this.reactionBubble = scene.add.text(0, BUBBLE_ABOVE_Y, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '17px',
      color: '#241632',
      backgroundColor: '#fffdf0',
      padding: { x: 9, y: 6 },
      align: 'center',
      wordWrap: { width: 200 },
    }).setOrigin(0.5).setVisible(false);

    this.add([this.shadow, body, this.bodyShape, this.face, this.reactionBubble]);

    this.marker = new CharacterMarker(scene, MARKER_ABOVE_Y, STAGE_WORDS.calm, true);
    this.add(this.marker);
    this.marker.setBarRatio(0);

    this.setDepth(40);
    scene.add.existing(this);

    scene.tweens.add({
      targets: this.shadow,
      scaleX: { from: 0.95, to: 1.05 },
      alpha: { from: 0.2, to: 0.28 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });

    this.waypoints = NORA_ROUTE.map((point) => {
      const inside = clampToFloor(point.x, point.y);
      return new Phaser.Math.Vector2(inside.x, inside.y);
    });
  }

  update(time: number, deltaMs: number): void {
    this.placeOverheadBadges();

    if (this.stage === 'possessed' || time < this.pausedUntil) {
      this.wasMoving = false;
      return;
    }

    const target = this.waypoints[this.waypointIndex];
    const direction = target.clone().subtract(new Phaser.Math.Vector2(this.x, this.y));
    const distance = direction.length();
    let moving = false;

    if (distance < 8) {
      this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
    } else {
      direction.normalize().scale(this.moveSpeed * (deltaMs / 1000));
      this.x += direction.x;
      this.y += direction.y;
      moving = true;
    }

    if (moving && !this.wasMoving) this.setScale(1.03);
    else if (!moving && this.wasMoving) this.setScale(1);
    this.wasMoving = moving;
  }

  /**
   * Drops the marker and reaction bubble under Nora when she stands high in the
   * view, where they would be clipped or hidden behind the top chips.
   */
  private placeOverheadBadges(): void {
    const camera = this.scene.cameras.main;
    const viewTop = camera.worldView.y;
    const clearance = cssToWorldUnits(
      TOP_HUD_CLEARANCE_CSS,
      camera.zoom,
      this.scene.scale.zoom,
    );

    this.marker.setY(
      fitsAboveHead(this.y, MARKER_ABOVE_Y, this.marker.badgeHeight, viewTop, clearance)
        ? MARKER_ABOVE_Y
        : MARKER_BELOW_Y,
    );

    if (!this.reactionBubble.visible) return;
    this.reactionBubble.setY(
      fitsAboveHead(this.y, BUBBLE_ABOVE_Y, this.reactionBubble.height, viewTop, clearance)
        ? BUBBLE_ABOVE_Y
        : BUBBLE_BELOW_Y,
    );
  }

  /** Keeps the head marker and fear bar in step with the scene's fear total. */
  syncFear(fear: number, stage: FearStage): void {
    this.fear = fear;
    this.stage = stage;
    this.marker.setLabel(STAGE_WORDS[stage]);
    this.marker.setBarRatio(fear / NPC_MAX_FEAR);
  }

  react(message: string, stage: FearStage, failed: boolean): void {
    this.setScareCastReaction(false);
    this.stage = stage;
    this.marker.setLabel(STAGE_WORDS[stage]);
    this.reactionBubble.setText(message).setVisible(true);
    this.pausedUntil = this.scene.time.now + 1500;

    this.face.setText(failed ? '≧▽≦' : FACE_BY_STAGE[stage]);
    this.bodyShape.setFillStyle(failed ? 0xffd68b : PALETTE.noraSkin);

    this.scene.tweens.add({
      targets: this,
      scaleX: failed ? 1.12 : 1.08,
      scaleY: failed ? 0.9 : 1.08,
      yoyo: true,
      repeat: failed ? 1 : 0,
      duration: 150,
    });

    this.scene.time.delayedCall(1450, () => {
      this.reactionBubble.setVisible(false);
      if (this.stage !== 'possessed') this.face.setText(FACE_BY_STAGE[this.stage]);
      this.bodyShape.setFillStyle(PALETTE.noraSkin);
    });
  }

  /** Family-friendly feedback when observation reveals a clue — held long enough to read. */
  showObservationReaction(message: string): void {
    this.reactionBubble.setText(message).setVisible(true);
    this.face.setText('•o•');
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.04,
      scaleY: 1.04,
      yoyo: true,
      duration: 120,
    });

    this.scene.time.delayedCall(4800, () => {
      if (this.stage !== 'possessed') this.face.setText(FACE_BY_STAGE[this.stage]);
      this.reactionBubble.setVisible(false);
    });
  }

  /** Mild mid-cast cue while Nora is still in range of the casting scare. */
  setScareCastReaction(active: boolean): void {
    if (active === this.scareCastReactionActive) return;

    if (active) {
      this.scareCastReactionActive = true;
      this.reactionBubble.setText('Something spooky…').setVisible(true);
      this.face.setText('•~•');
      this.scareCastTween?.stop();
      this.scareCastTween = this.scene.tweens.add({
        targets: this,
        scaleX: 1.03,
        scaleY: 1.03,
        yoyo: true,
        duration: 320,
        repeat: -1,
        ease: 'Sine.InOut',
      });
      return;
    }

    this.scareCastReactionActive = false;
    this.scareCastTween?.stop();
    this.scareCastTween = undefined;
    this.reactionBubble.setVisible(false);
    if (this.stage !== 'possessed') this.face.setText(FACE_BY_STAGE[this.stage]);
    if (!this.wasMoving) {
      this.setScale(1);
    }
  }
}
