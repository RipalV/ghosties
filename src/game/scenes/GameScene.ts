import Phaser from 'phaser';
import { STARTING_ABILITIES, type ScareAbility } from '../abilities/ScareAbility';
import {
  getVisitorDefinition,
  type VisitorDefinition,
} from '../content/visitorRegistry';
import { Ghost } from '../entities/Ghost';
import { Npc, DEPARTURE_SPEED_MULTIPLIER, NPC_MAX_FEAR } from '../entities/Npc';
import { getFearStage, resolveScare } from '../fear/FearEngine';
import {
  createDiscoveryState,
  discoverClue,
  resetDiscoveryState,
} from '../observation/discoveryStore';
import { applyObservationBonus, isObservationBonusEligible } from '../observation/observationBonus';
import {
  cancelObservation,
  canStartObservation,
  createObservationSession,
  findNextUndiscoveredClue,
  isInObservationRange,
  startObservation,
  tickObservation,
} from '../observation/observationSession';
import type { ClueDefinition, DiscoveryState, ObservationSession } from '../observation/types';
import {
  observationBonusAllowed,
  scaleScareResult,
  shouldApplyScareOutcome,
} from '../scareCast/scareCastExposure';
import {
  SCARE_CAST_DURATION_MS,
  cancelScareCast,
  createScareCastSession,
  isInAbilityRange,
  tickScareCast,
  tryStartScareCast,
  type ScareCastSession,
} from '../scareCast/scareCastSession';
import {
  announceVisitor,
  beginActiveHaunting,
  beginVisitorDeparting,
  createHauntingSession,
  prepareNextVisit,
  shouldAnnounceVisitor,
  showResults,
  tickLocationReady,
  tickVisitorAnnounced,
  type HauntingSession,
} from '../session/hauntingSession';
import { resetSessionForNewVisit } from '../session/sessionReset';
import { isVisitorTargetable, targetableGateStatus } from '../session/targetableGate';
import type { VisitorRouteState } from '../session/visitorRoute';
import {
  createVisitorRouteState,
  resetVisitorRouteState,
  tickVisitorRoute,
} from '../session/visitorRoute';
import { buildVisitResults } from '../session/visitResults';
import {
  shouldDepartOnRouteComplete,
  shouldDepartOnSuccess,
  visitOutcomeForDeparture,
} from '../session/visitSuccess';
import {
  advanceVisitIndex,
  getVisitorIdForVisitIndex,
  initialVisitIndex,
} from '../session/visitorRotation';
import {
  classifyExposureOutcome,
  type ExposureOutcomeKind,
} from '../scareCast/scareCastExposure';
import {
  createCoachingHintSet,
  estimateRouteProgress,
  markCoachingHintShown,
  selectCoachingHint,
} from '../onboarding/contextualCoaching';
import { createOnboardingState, onboardingSessionFinished } from '../onboarding/onboardingSession';
import { reduceOnboarding } from '../onboarding/onboardingReducer';
import { highlightForOnboardingStep } from '../onboarding/onboardingContent';
import type { OnboardingEvent, OnboardingPresentation } from '../onboarding/types';
import { GameHud } from '../ui/GameHud';
import { LobbyAmbience } from '../visuals/LobbyAmbience';
import { LobbyEnvironment } from '../visuals/LobbyEnvironment';
import {
  clampZoomStepIndex,
  nearestZoomStepIndex,
  resolveCameraZoom,
} from '../world/lobbyGeometry';
import { CAMERA, GHOST_START, WORLD } from '../world/lobbyLayout';

/** How far inside the viewport edge (in CSS pixels) the visitor must be to drop the marker. */
const ON_SCREEN_INSET = 24;
const PINCH_THRESHOLD = 0.15;

export class GameScene extends Phaser.Scene {
  private ghost!: Ghost;
  private npc!: Npc;
  private ambience!: LobbyAmbience;
  private hud!: GameHud;
  /** Holds the fixed-coordinate lobby world that the camera frames. */
  private world!: Phaser.GameObjects.Container;
  private uiCamera!: Phaser.Cameras.Scene2D.Camera;
  /** Game units per CSS pixel; game units are device pixels (see main.ts). */
  private uiScale = 1;
  private zoomStepIndex: number = CAMERA.defaultZoomStepIndex;
  private pinchStartDistance = 0;
  private pinchStartStepIndex: number = CAMERA.defaultZoomStepIndex;
  private score = 0;
  private energy = 100;
  private observationBonusTotal = 0;
  private ineffectiveScareCount = 0;
  private repeatedScareCount = 0;
  private hauntingSession: HauntingSession = createHauntingSession();
  private visitorRouteState: VisitorRouteState = createVisitorRouteState();
  private visitIndex = initialVisitIndex();
  private activeVisitor!: VisitorDefinition;
  private departurePending = false;
  private observationSession: ObservationSession = createObservationSession();
  private scareCastSession: ScareCastSession = createScareCastSession();
  /** Last in-range sample while a scare cast is active (for leave-range status). */
  private scareCastWasInRange = false;
  /** Avoids per-frame DOM writes while a scare cast ring is filling. */
  private lastScareCastHudPercent = -1;
  private lastScareCastHudIndex: number | null = null;
  /** Tracks visitor mid-cast reaction so we only update on range transitions. */
  private scareCastVisitorInRange = false;
  private discoveryState: DiscoveryState = createDiscoveryState();
  private onboardingState = createOnboardingState();
  private coachingShownHints = createCoachingHintSet();
  private cluePanelReviewedThisVisit = false;
  private farFromVisitorMs = 0;
  private lastResolvedExposure: ExposureOutcomeKind | null = null;
  private keys!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
  private abilityKeys!: Phaser.Input.Keyboard.Key[];
  private observeKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('game');
  }

  create(): void {
    this.uiScale = 1 / this.scale.zoom;
    this.activeVisitor = this.resolveActiveVisitor();

    this.world = this.add.container(0, 0);
    const environment = new LobbyEnvironment(this);
    this.ambience = new LobbyAmbience(this);
    this.ghost = new Ghost(this, GHOST_START.x, GHOST_START.y);
    this.npc = new Npc(this, this.activeVisitor.visit.spawn.x, this.activeVisitor.visit.spawn.y, this.activeVisitor);
    this.npc.setVisible(false);
    this.world.add([environment.container, this.ambience.container, this.npc, this.ghost]);

    this.discoveryState = resetDiscoveryState();
    this.observationSession = createObservationSession();
    this.scareCastSession = createScareCastSession();

    this.hud = new GameHud(this, this.uiScale, {
      onZoomIn: () => this.setZoomStep(this.zoomStepIndex - 1),
      onZoomOut: () => this.setZoomStep(this.zoomStepIndex + 1),
      onObserve: () => this.tryObserve(),
      onToggleClues: () => this.toggleCluePanel(),
      onNextVisit: () => this.startNextVisit(),
      onSkipTutorial: () => this.skipTutorial(),
      onAcknowledgeTutorial: () => this.acknowledgeTutorial(),
    });
    this.applyVisitorPresentation();

    this.setupCameras();
    this.setupInput();

    this.hud.createAbilityControls(STARTING_ABILITIES, (ability) => this.useAbility(ability));
    this.hud.setClueEntries(this.activeVisitor.content.clues, this.discoveryState.discoveredClueIds);
    this.hud.setStatus('You are home in the Crooked Moon lobby. A visitor may arrive soon…');
    this.updateHud();
    this.refreshObservationHud();

    this.layout();
    this.scale.on('resize', this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off('resize', this.layout, this));

    this.dispatchOnboarding({ type: 'sessionReady' });
  }

  private setupCameras(): void {
    const { width, height } = this.scale.gameSize;
    const main = this.cameras.main;

    main.setBounds(0, 0, WORLD.width, WORLD.height);
    main.startFollow(this.ghost, false, CAMERA.followLerp, CAMERA.followLerp);
    main.ignore(this.hud.root);

    // A second camera keeps the HUD at a constant size whatever the world zoom.
    this.uiCamera = this.cameras.add(0, 0, width, height);
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.ignore(this.world);
  }

  private setupInput(): void {
    // A second pointer lets a pinch snap between zoom steps.
    this.input.addPointer(1);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.input.pointer2?.isDown) return;
      if (this.hud.isTutorialPromptOpen()) return;
      // HUD controls (objective, clues, zoom, Observe, scares) are HTML overlays.
      // Phaser only blocks pointer hits on HUD regions so taps do not move the ghost.
      if (this.hud.handlePointerDown(pointer.x, pointer.y)) return;

      const target = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.ghost.setTarget(target.x, target.y);
    });

    const keyboard = this.input.keyboard;
    if (!keyboard) throw new Error('Keyboard input is unavailable.');
    this.keys = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as typeof this.keys;

    this.abilityKeys = [
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    ];
    this.observeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
  }

  /** Re-frames the camera and re-anchors the HUD whenever the viewport changes. */
  private layout(): void {
    const { width, height } = this.scale.gameSize;

    this.cameras.main.setSize(width, height);
    this.uiCamera.setSize(width, height);
    this.uiCamera.setScroll(0, 0);

    this.applyZoom(width, height);
    this.hud.layout(width, height);
  }

  private applyZoom(width: number, height: number): void {
    const steps = CAMERA.zoomSteps;
    const zoom = resolveCameraZoom(width, height, steps[this.zoomStepIndex]);
    const main = this.cameras.main;

    main.setZoom(zoom);
    // The deadzone is world-space, so derive it from the visible slice.
    main.setDeadzone(
      (width / zoom) * CAMERA.deadzoneWidthFraction,
      (height / zoom) * CAMERA.deadzoneHeightFraction,
    );

    const wider = this.zoomStepIndex + 1 < steps.length
      ? resolveCameraZoom(width, height, steps[this.zoomStepIndex + 1])
      : zoom;
    this.hud.setZoomAvailability(this.zoomStepIndex > 0, wider < zoom - 1e-6);
  }

  private setZoomStep(index: number): void {
    const next = clampZoomStepIndex(index);
    if (next === this.zoomStepIndex) return;

    this.zoomStepIndex = next;
    const { width, height } = this.scale.gameSize;
    this.applyZoom(width, height);
  }

  update(time: number, delta: number): void {
    const tutorialPromptOpen = this.hud.isTutorialPromptOpen();
    this.ghost.setKeyboardDirection(
      tutorialPromptOpen
        ? 0
        : Number(this.keys.right.isDown) - Number(this.keys.left.isDown),
      tutorialPromptOpen
        ? 0
        : Number(this.keys.down.isDown) - Number(this.keys.up.isDown),
    );
    this.ghost.update(delta);
    this.updateHauntingSession(delta);
    this.updateVisitorRoute(time, delta);
    this.ambience.update(delta);
    this.updatePinchZoom();
    this.updateNpcIndicator();
    this.updateObservation(delta);
    this.updateScareCast(delta);
    this.updateTutorialCoaching(delta);

    this.abilityKeys.forEach((key, index) => {
      if (!tutorialPromptOpen && Phaser.Input.Keyboard.JustDown(key)) {
        this.useAbility(STARTING_ABILITIES[index]);
      }
    });

    if (!tutorialPromptOpen && Phaser.Input.Keyboard.JustDown(this.observeKey)) {
      this.tryObserve();
    }
  }

  private resolveActiveVisitor(): VisitorDefinition {
    const id = getVisitorIdForVisitIndex(this.visitIndex);
    const definition = getVisitorDefinition(id);
    if (!definition) {
      throw new Error(`Unknown visitor id: ${id}`);
    }
    return definition;
  }

  private applyVisitorPresentation(): void {
    const { displayName } = this.activeVisitor.content;
    this.hud.setVisitorPresentation(displayName, this.activeVisitor.cues.objective);
  }

  private mapTutorialHighlight(
    target: ReturnType<typeof highlightForOnboardingStep>,
  ): 'observe' | 'clues' | 'scareGrid' | null {
    return target;
  }

  private applyOnboardingHighlightForCurrentStep(): void {
    const step = this.onboardingState.step;
    if (this.onboardingState.mode !== 'guided' || !step) return;
    this.hud.setTutorialHighlight(this.mapTutorialHighlight(highlightForOnboardingStep(step)));
  }

  private applyOnboardingPresentation(presentation: OnboardingPresentation): void {
    if (!presentation.instructionText) {
      return;
    }

    this.hud.setTutorialPresentation({
      instruction: presentation.instructionText,
      icon: presentation.instructionIcon,
      highlight: this.mapTutorialHighlight(presentation.highlight),
      showSkip: presentation.showSkip,
      coachingHint: null,
      coachingIcon: null,
    });
  }

  private dispatchOnboarding(event: OnboardingEvent): void {
    const result = reduceOnboarding(
      this.onboardingState,
      event,
      this.visitorDisplayName(),
    );
    this.onboardingState = result.state;
    if (result.presentation.instructionText) {
      this.applyOnboardingPresentation(result.presentation);
    } else if (!this.onboardingState.presentationVisible) {
      this.hud.hideTutorialPresentation();
      if (event.type === 'promptAcknowledged' && this.onboardingState.mode === 'guided') {
        this.applyOnboardingHighlightForCurrentStep();
      }
    }
  }

  private skipTutorial(): void {
    this.dispatchOnboarding({ type: 'skipHelp' });
    this.hud.hideTutorialPresentation();
  }

  private acknowledgeTutorial(): void {
    this.dispatchOnboarding({ type: 'promptAcknowledged' });
  }

  private updateTutorialCoaching(delta: number): void {
    const inObserveRange = this.inObservationRange();

    if (this.onboardingState.mode === 'guided') {
      if (this.onboardingState.presentationVisible) return;
    }

    if (!onboardingSessionFinished(this.onboardingState)) {
      return;
    }

    if (!this.isTargetable()) {
      this.hud.hideTutorialPresentation();
      return;
    }

    const inAnyScareRange = STARTING_ABILITIES.some((ability) => this.inAbilityRange(ability));

    if (!inObserveRange && !inAnyScareRange) {
      this.farFromVisitorMs += delta;
    } else {
      this.farFromVisitorMs = 0;
    }

    const coaching = selectCoachingHint({
      onboarding: this.onboardingState,
      visitorTargetable: this.isTargetable(),
      visitorName: this.visitorDisplayName(),
      inObserveRange,
      inAnyScareRange,
      observeOutOfRangeAttempt: false,
      discoveredClueCount: this.discoveryState.discoveredClueIds.length,
      cluePanelReviewed: this.cluePanelReviewedThisVisit,
      lastResolvedExposure: this.lastResolvedExposure,
      repeatedIneffectiveCount: this.ineffectiveScareCount,
      routeProgressRatio: estimateRouteProgress(
        this.visitorRouteState.leg,
        this.visitorRouteState.poiIndex,
        this.activeVisitor.visit.pointsOfInterest.length,
        this.visitorRouteState.routeComplete,
      ),
      farFromVisitorMs: this.farFromVisitorMs,
      shownHints: this.coachingShownHints,
    });

    if (coaching.message && coaching.hintId) {
      this.hud.setTutorialPresentation({
        instruction: null,
        icon: null,
        highlight: null,
        showSkip: false,
        coachingHint: coaching.message,
        coachingIcon: coaching.icon,
      });
      this.coachingShownHints = markCoachingHintShown(this.coachingShownHints, coaching.hintId);
    }
  }

  private visitorDisplayName(): string {
    return this.activeVisitor.content.displayName;
  }

  private isTargetable(): boolean {
    return isVisitorTargetable(this.hauntingSession.phase, this.visitorRouteState.presence);
  }

  private updateHauntingSession(delta: number): void {
    if (this.hauntingSession.phase === 'locationReady') {
      this.hauntingSession = tickLocationReady(this.hauntingSession, delta);
      if (shouldAnnounceVisitor(this.hauntingSession, this.activeVisitor.visit.locationReadyAnnounceMs)) {
        this.hauntingSession = announceVisitor(this.hauntingSession);
        this.hud.setVisitCue('🔔', this.activeVisitor.cues.arrivalAnnounce);
        this.hud.setStatus('Ding-dong! Get ready to sneak around…');
        this.dispatchOnboarding({
          type: 'guestArriving',
          visitIndex: this.visitIndex,
          visitorId: getVisitorIdForVisitIndex(this.visitIndex),
        });
      }
      return;
    }

    if (this.hauntingSession.phase === 'visitorAnnounced') {
      this.hauntingSession = tickVisitorAnnounced(
        this.hauntingSession,
        delta,
        this.activeVisitor.visit.announceEnterDelayMs,
      );
      return;
    }

    if (this.hauntingSession.phase === 'results') {
      return;
    }
  }

  private updateVisitorRoute(time: number, delta: number): void {
    const tick = tickVisitorRoute({
      state: this.visitorRouteState,
      config: this.activeVisitor.visit,
      deltaMs: delta,
      npcX: this.npc.x,
      npcY: this.npc.y,
      phase: this.hauntingSession.phase,
    });
    this.visitorRouteState = tick.state;

    this.npc.updateVisitMovement(time, delta, {
      shouldMove: tick.shouldMove,
      targetX: tick.targetX,
      targetY: tick.targetY,
      pauseActive: tick.state.pauseRemainingMs > 0,
      visible: tick.visible,
      arrivalThreshold: this.activeVisitor.visit.entranceArrivalThreshold,
      speedMultiplier:
        this.hauntingSession.phase === 'visitorDeparting' ? DEPARTURE_SPEED_MULTIPLIER : 1,
    });

    if (tick.enteredVisiting && this.hauntingSession.phase === 'visitorEntering') {
      this.hauntingSession = beginActiveHaunting(this.hauntingSession);
      this.hud.setVisitCue('👀', this.activeVisitor.cues.activeHaunting);
      this.hud.setStatus('Time to snoop and scare!');
      this.dispatchOnboarding({
        type: 'visitorTargetable',
        visitIndex: this.visitIndex,
        visitorId: getVisitorIdForVisitIndex(this.visitIndex),
      });
    }

    if (
      shouldDepartOnRouteComplete(tick.state.routeComplete, this.hauntingSession.phase) &&
      !this.departurePending
    ) {
      this.triggerDeparture(false);
    }

    if (tick.reachedExit && this.hauntingSession.phase === 'visitorDeparting') {
      this.hauntingSession = showResults(this.hauntingSession);
      this.presentVisitResults();
    }

    if (this.hauntingSession.phase === 'visitorDeparting') {
      this.hud.hideNpcIndicator();
    }
  }

  private triggerDeparture(success: boolean): void {
    if (this.departurePending || this.hauntingSession.phase !== 'activeHaunting') return;
    this.departurePending = true;
    const outcome = visitOutcomeForDeparture(success);
    this.hauntingSession = beginVisitorDeparting(this.hauntingSession, outcome);
    this.dispatchOnboarding({ type: 'departureStarted' });
    this.cancelActiveHauntActions(
      success
        ? this.activeVisitor.cues.departureSuccessStatus
        : this.activeVisitor.cues.departureFailStatus,
    );
    this.hud.setVisitCue(
      success ? '👻' : '🚪',
      success
        ? this.activeVisitor.cues.departureCueSuccess
        : this.activeVisitor.cues.departureCueFail,
    );
  }

  private cancelActiveHauntActions(statusMessage: string): void {
    if (this.observationSession.status === 'observing') {
      this.observationSession = cancelObservation(this.observationSession);
      this.refreshObservationHud();
    }
    if (this.scareCastSession.status === 'casting') {
      this.scareCastSession = cancelScareCast(this.scareCastSession);
      this.scareCastWasInRange = false;
      this.refreshScareCastHud();
    }
    this.npc.setScareCastReaction(false);
    this.hud.setStatus(statusMessage);
  }

  private presentVisitResults(): void {
    const summary = buildVisitResults({
      visitorName: this.activeVisitor.visit.visitorName,
      outcome: this.hauntingSession.visitOutcome ?? 'unimpressed',
      finalFearStage: this.npc.stage,
      finalFear: this.npc.fear,
      score: this.score,
      observationBonusTotal: this.observationBonusTotal,
      ineffectiveScareCount: this.ineffectiveScareCount,
      repeatedScareCount: this.repeatedScareCount,
      discoveredClueIds: this.discoveryState.discoveredClueIds,
      clues: this.activeVisitor.content.clues,
    });
    this.hud.showVisitResults(summary);
    this.hud.setGameplayLocked(true);
    this.hud.setStatus('Haunt wrapped — tap Next visit for more mischief!');
  }

  private startNextVisit(): void {
    if (this.hauntingSession.phase !== 'results') return;

    this.visitIndex = advanceVisitIndex(this.visitIndex);
    this.activeVisitor = this.resolveActiveVisitor();

    const reset = resetSessionForNewVisit();
    this.score = reset.runtime.score;
    this.energy = reset.runtime.energy;
    this.discoveryState = reset.runtime.discoveryState;
    this.observationSession = reset.runtime.observationSession;
    this.scareCastSession = reset.runtime.scareCastSession;
    this.observationBonusTotal = reset.runtime.observationBonusTotal;
    this.ineffectiveScareCount = reset.runtime.ineffectiveScareCount;
    this.repeatedScareCount = reset.runtime.repeatedScareCount;
    this.scareCastWasInRange = false;
    this.scareCastVisitorInRange = false;
    this.departurePending = false;
    this.resetScareCastHudCache();

    this.npc.applyVisitor(this.activeVisitor);
    this.npc.resetForVisit(this.activeVisitor.visit.spawn.x, this.activeVisitor.visit.spawn.y);
    this.npc.setVisible(false);
    this.visitorRouteState = resetVisitorRouteState();
    this.hauntingSession = prepareNextVisit();

    this.applyVisitorPresentation();
    this.hud.hideVisitResults();
    this.hud.hideVisitCue();
    this.hud.setGameplayLocked(false);
    this.hud.setCluePanelOpen(false);
    this.hud.setClueEntries(this.activeVisitor.content.clues, this.discoveryState.discoveredClueIds);
    this.hud.setObjective(false);
    this.coachingShownHints = createCoachingHintSet();
    this.cluePanelReviewedThisVisit = false;
    this.farFromVisitorMs = 0;
    this.lastResolvedExposure = null;
    this.hud.hideTutorialPresentation();
    this.updateHud();
    this.refreshObservationHud();
    this.refreshScareCastHud();
    this.hud.setStatus('The lobby settles… another visitor may arrive soon.');
  }

  private npcDistance(): number {
    return Phaser.Math.Distance.Between(this.ghost.x, this.ghost.y, this.npc.x, this.npc.y);
  }

  private inObservationRange(): boolean {
    return isInObservationRange(this.npcDistance(), this.activeVisitor.content.observation.range);
  }

  private tryObserve(): void {
    if (!this.isTargetable()) {
      this.hud.setStatus(targetableGateStatus(
        this.hauntingSession.phase,
        this.visitorRouteState.presence,
        this.visitorDisplayName(),
      ));
      return;
    }

    if (this.observationSession.status === 'observing') {
      this.hud.setStatus(`Still observing ${this.visitorDisplayName()}… stay close and watch the eye button.`);
      return;
    }

    const inRange = this.inObservationRange();
    if (!canStartObservation(this.observationSession, inRange)) {
      this.hud.setStatus(`Move closer to ${this.visitorDisplayName()} before observing.`);
      if (onboardingSessionFinished(this.onboardingState)) {
        const coaching = selectCoachingHint({
          onboarding: this.onboardingState,
          visitorTargetable: this.isTargetable(),
          visitorName: this.visitorDisplayName(),
          inObserveRange: false,
          inAnyScareRange: STARTING_ABILITIES.some((ability) => this.inAbilityRange(ability)),
          observeOutOfRangeAttempt: true,
          discoveredClueCount: this.discoveryState.discoveredClueIds.length,
          cluePanelReviewed: this.cluePanelReviewedThisVisit,
          lastResolvedExposure: this.lastResolvedExposure,
          repeatedIneffectiveCount: this.ineffectiveScareCount,
          routeProgressRatio: estimateRouteProgress(
            this.visitorRouteState.leg,
            this.visitorRouteState.poiIndex,
            this.activeVisitor.visit.pointsOfInterest.length,
            this.visitorRouteState.routeComplete,
          ),
          farFromVisitorMs: this.farFromVisitorMs,
          shownHints: this.coachingShownHints,
        });
        if (coaching.message && coaching.hintId) {
          this.hud.setTutorialPresentation({
            instruction: null,
            icon: null,
            highlight: null,
            showSkip: false,
            coachingHint: coaching.message,
            coachingIcon: coaching.icon,
          });
          this.coachingShownHints = markCoachingHintShown(this.coachingShownHints, coaching.hintId);
        }
      }
      return;
    }

    if (!findNextUndiscoveredClue(this.activeVisitor.content.clues, this.discoveryState)) {
      this.hud.setStatus('You already found every clue. Tap 🧩 to review them, then try a scare!');
      return;
    }

    if (this.scareCastSession.status === 'casting') {
      this.scareCastSession = cancelScareCast(this.scareCastSession);
      this.scareCastWasInRange = false;
      this.refreshScareCastHud();
    }

    this.observationSession = startObservation(this.observationSession);
    this.hud.setStatus(
      `Observing ${this.visitorDisplayName()}… stay nearby. One new clue will appear when the eye fills.`,
    );
    this.refreshObservationHud();
  }

  private updateObservation(delta: number): void {
    if (!this.isTargetable() && this.observationSession.status === 'observing') {
      this.observationSession = cancelObservation(this.observationSession);
      this.hud.setStatus(`${this.visitorDisplayName()} is leaving — observation cancelled.`);
      this.refreshObservationHud();
      return;
    }

    const wasObserving = this.observationSession.status === 'observing';

    if (!wasObserving) {
      this.refreshObservationHud();
      return;
    }

    const inRange = this.inObservationRange();
    const tick = tickObservation(
      this.observationSession,
      delta,
      this.activeVisitor.content.observation.durationMs,
      inRange,
      this.activeVisitor.content.clues,
      this.discoveryState,
    );

    this.observationSession = tick.session;

    if (tick.newlyRevealedClueIds.length > 0) {
      for (const clueId of tick.newlyRevealedClueIds) {
        this.discoveryState = discoverClue(this.discoveryState, clueId);
      }
      const latestId = tick.newlyRevealedClueIds[tick.newlyRevealedClueIds.length - 1];
      const clue = this.activeVisitor.content.clues.find((entry) => entry.id === latestId);
      if (clue) {
        this.npc.showObservationReaction(this.clueReaction(clue));
        const moreLeft = findNextUndiscoveredClue(this.activeVisitor.content.clues, this.discoveryState);
        const followUp = moreLeft
          ? ' Observe again for another clue.'
          : ' That was the last clue — try a scare!';
        this.hud.setClueStatus(`New clue: ${clue.text}${followUp}`);
      }
      this.hud.setClueEntries(this.activeVisitor.content.clues, this.discoveryState.discoveredClueIds);
      this.dispatchOnboarding({ type: 'observeCompletedWithClue' });
    } else if (this.observationSession.status === 'idle') {
      if (!inRange) {
        this.hud.setStatus('Observation cancelled — you moved too far. Clues you found are saved.');
      }
    }

    this.refreshObservationHud();
  }

  private clueReaction(clue: ClueDefinition): string {
    switch (clue.category) {
      case 'dialogue':
        return clue.personalityOnly ? 'Hmm… organised!' : 'Did she just say that?';
      case 'body_language':
        return 'She looks nervously around…';
      case 'nearby_object':
        return 'Something nearby catches her eye.';
      case 'environmental_reaction':
        return 'The room makes her jump!';
    }
  }

  private toggleCluePanel(): void {
    const open = this.hud.toggleCluePanel();
    this.hud.setClueEntries(this.activeVisitor.content.clues, this.discoveryState.discoveredClueIds);
    if (open) {
      this.cluePanelReviewedThisVisit = true;
      this.dispatchOnboarding({ type: 'cluePanelOpened' });
    }
    if (open && this.discoveryState.discoveredClueIds.length === 0) {
      this.hud.setStatus(`No clues yet — observe ${this.visitorDisplayName()} while staying close.`);
    }
  }

  private refreshObservationHud(): void {
    this.hud.setObserveState(
      this.inObservationRange(),
      this.observationSession.status === 'observing',
      this.observationSession.progress,
    );
  }

  private abilityIndex(abilityId: string): number {
    return STARTING_ABILITIES.findIndex((entry) => entry.id === abilityId);
  }

  private inAbilityRange(ability: ScareAbility): boolean {
    return isInAbilityRange(this.npcDistance(), ability.range);
  }

  private resetScareCastHudCache(): void {
    this.lastScareCastHudPercent = -1;
    this.lastScareCastHudIndex = null;
  }

  private syncScareCastPresentation(casting: boolean, noraInRange: boolean): void {
    this.ghost.setCastingPresentation(casting);

    if (!casting) {
      if (this.scareCastVisitorInRange) {
        this.npc.setScareCastReaction(false);
        this.scareCastVisitorInRange = false;
      }
      return;
    }

    if (noraInRange !== this.scareCastVisitorInRange) {
      this.npc.setScareCastReaction(noraInRange);
      this.scareCastVisitorInRange = noraInRange;
    }
  }

  private refreshScareCastHud(inRange = false): void {
    if (this.scareCastSession.status !== 'casting' || !this.scareCastSession.abilityId) {
      if (this.lastScareCastHudIndex !== null) {
        this.hud.setScareCastState(null, 0);
        this.resetScareCastHudCache();
      }
      this.syncScareCastPresentation(false, false);
      return;
    }

    const index = this.abilityIndex(this.scareCastSession.abilityId);
    const hudIndex = index >= 0 ? index : null;
    const percent = Math.round(this.scareCastSession.progress * 100);
    if (hudIndex !== this.lastScareCastHudIndex || percent !== this.lastScareCastHudPercent) {
      this.hud.setScareCastState(hudIndex, this.scareCastSession.progress);
      this.lastScareCastHudIndex = hudIndex;
      this.lastScareCastHudPercent = percent;
    }

    this.syncScareCastPresentation(true, inRange);
  }

  private updateScareCast(delta: number): void {
    if (
      !this.isTargetable() &&
      this.scareCastSession.status === 'casting' &&
      this.hauntingSession.phase === 'visitorDeparting'
    ) {
      this.scareCastSession = cancelScareCast(this.scareCastSession);
      this.scareCastWasInRange = false;
      this.refreshScareCastHud();
      return;
    }

    if (this.scareCastSession.status !== 'casting' || !this.scareCastSession.abilityId) {
      this.scareCastWasInRange = false;
      this.refreshScareCastHud();
      return;
    }

    const ability = STARTING_ABILITIES.find((entry) => entry.id === this.scareCastSession.abilityId);
    if (!ability) {
      this.scareCastSession = cancelScareCast(this.scareCastSession);
      this.scareCastWasInRange = false;
      this.refreshScareCastHud();
      return;
    }

    const inRange = this.inAbilityRange(ability);
    if (!this.scareCastWasInRange && inRange) {
      this.hud.setStatus(
        `${ability.name} casting… ${this.visitorDisplayName()} is in the spooky zone!`,
      );
    } else if (this.scareCastWasInRange && !inRange) {
      this.hud.setStatus(
        `${ability.name} casting… ${this.visitorDisplayName()} left the spooky zone — get closer to expose them.`,
      );
    }
    this.scareCastWasInRange = inRange;

    const tick = tickScareCast(
      this.scareCastSession,
      delta,
      SCARE_CAST_DURATION_MS,
      inRange,
    );
    this.scareCastSession = tick.session;

    if (tick.completedAbilityId !== null && tick.exposureRatio !== null) {
      this.scareCastWasInRange = false;
      const exposure = classifyExposureOutcome(tick.exposureRatio);
      this.lastResolvedExposure = exposure;
      this.dispatchOnboarding({ type: 'scareCastResolved', exposure });
      const completed = STARTING_ABILITIES.find((entry) => entry.id === tick.completedAbilityId);
      if (completed) {
        if (shouldApplyScareOutcome(tick.exposureRatio)) {
          this.resolveScare(completed, tick.exposureRatio);
        } else {
          this.hud.setStatus(
            `${ability.name} fizzled — ${this.visitorDisplayName()} was never in range.`,
          );
        }
      }
    }

    const stillCasting =
      this.scareCastSession.status === 'casting' && this.scareCastSession.abilityId !== null;
    this.refreshScareCastHud(stillCasting ? inRange : false);
  }

  private useAbility(ability: ScareAbility): void {
    if (!this.isTargetable()) {
      this.hud.setStatus(targetableGateStatus(
        this.hauntingSession.phase,
        this.visitorRouteState.presence,
        this.visitorDisplayName(),
      ));
      return;
    }

    const affordable = this.energy >= ability.energyCost;
    const inRange = this.inAbilityRange(ability);

    if (!affordable) {
      this.hud.setStatus(`Not enough ghost energy. Give ${this.visitorDisplayName()} a moment to recover.`);
      return;
    }

    const start = tryStartScareCast(this.scareCastSession, ability.id, affordable);
    if (start.sameAbilityBlocked) {
      this.hud.setStatus(`${ability.name} is still casting… wait for the ring to finish.`);
      return;
    }

    if (!start.started) return;

    if (this.observationSession.status === 'observing') {
      this.observationSession = cancelObservation(this.observationSession);
      this.refreshObservationHud();
    }

    this.scareCastSession = start.session;
    this.scareCastWasInRange = inRange;

    if (start.switchedFromAbilityId) {
      const previous = STARTING_ABILITIES.find((entry) => entry.id === start.switchedFromAbilityId);
      const previousName = previous?.name ?? 'that scare';
      this.hud.setStatus(`Switched to ${ability.name} — ${previousName} was cancelled.`);
    } else if (inRange) {
      this.hud.setStatus(`Casting ${ability.name}… stay close until the ring fills.`);
    } else {
      this.hud.setStatus(`Casting ${ability.name}… get closer to affect ${this.visitorDisplayName()}.`);
    }

    this.resetScareCastHudCache();
    this.refreshScareCastHud(inRange);
  }

  private resolveScare(ability: ScareAbility, exposureRatio: number): void {
    this.energy -= ability.energyCost;
    const raw = resolveScare(this.npc.fearProfile, this.npc.scareHistory, ability.category);
    this.npc.scareHistory.usesByCategory[ability.category] =
      (this.npc.scareHistory.usesByCategory[ability.category] ?? 0) + 1;

    const result = scaleScareResult(raw, exposureRatio, this.visitorDisplayName());

    let bonus = { bonus: 0, discovery: this.discoveryState };
    if (
      isObservationBonusEligible(
        ability.category,
        this.activeVisitor.content.primaryFear,
        this.discoveryState,
        this.activeVisitor.content.clues,
      ) &&
      observationBonusAllowed(exposureRatio)
    ) {
      bonus = applyObservationBonus(
        this.discoveryState,
        ability.category,
        this.activeVisitor.content.primaryFear,
        this.activeVisitor.content.clues,
      );
    }
    this.discoveryState = bonus.discovery;
    if (bonus.bonus > 0) {
      this.observationBonusTotal += bonus.bonus;
    }

    const fear = Phaser.Math.Clamp(this.npc.fear + result.fearGained, 0, NPC_MAX_FEAR);
    this.npc.syncFear(fear, getFearStage(fear));
    this.score = Math.max(0, this.score + result.scoreDelta + bonus.bonus);

    const ineffective = raw.strength === 'none';
    const failed = ineffective;
    if (ineffective) {
      this.ineffectiveScareCount += 1;
    }
    if (raw.noveltyMultiplier < 1) {
      this.repeatedScareCount += 1;
    }

    if (failed) {
      this.ghost.showFailedScareGlimpse();
    } else {
      this.ghost.playScarePulse(true);
    }

    if (failed) {
      this.npc.react('Ha! I saw you!', this.npc.stage, true);
    } else if (result.fearGained > 0) {
      this.npc.react(`${result.reaction}\n+${result.fearGained} fear`, this.npc.stage, false);
    } else {
      this.npc.react(result.reaction, this.npc.stage, false);
    }

    const repetitionNote = raw.noveltyMultiplier < 1
      ? ` That scare is getting stale (${Math.round(raw.noveltyMultiplier * 100)}% punch).`
      : '';
    const bonusNote = bonus.bonus > 0 ? ` Sneaky spy bonus +${bonus.bonus}!` : '';
    this.hud.setStatus(`${ability.name}: ${result.reaction}${bonusNote}${repetitionNote}`);
    this.updateHud();

    if (shouldDepartOnSuccess(this.npc.stage, this.activeVisitor.visit.successMinFearStage)) {
      this.triggerDeparture(true);
    }

    this.time.delayedCall(1800, () => {
      this.energy = Math.min(100, this.energy + 4);
      this.updateHud();
    });
  }

  private updatePinchZoom(): void {
    const first = this.input.pointer1;
    const second = this.input.pointer2;

    if (!first?.isDown || !second?.isDown) {
      this.pinchStartDistance = 0;
      return;
    }

    const distance = Phaser.Math.Distance.Between(first.x, first.y, second.x, second.y);

    if (this.pinchStartDistance === 0) {
      this.pinchStartDistance = distance;
      this.pinchStartStepIndex = this.zoomStepIndex;
      return;
    }

    const ratio = distance / this.pinchStartDistance;
    if (Math.abs(ratio - 1) < PINCH_THRESHOLD) return;

    this.setZoomStep(nearestZoomStepIndex(CAMERA.zoomSteps[this.pinchStartStepIndex] * ratio));
  }

  private updateNpcIndicator(): void {
    if (
      !this.npc.visible ||
      this.hauntingSession.phase === 'results' ||
      this.hauntingSession.phase === 'visitorDeparting'
    ) {
      this.hud.hideNpcIndicator();
      return;
    }

    const main = this.cameras.main;
    const { width, height } = this.scale.gameSize;
    const screenX = (this.npc.x - main.worldView.x) * main.zoom;
    const screenY = (this.npc.y - main.worldView.y) * main.zoom;

    const inset = ON_SCREEN_INSET * this.uiScale;
    const visible =
      screenX > inset &&
      screenX < width - inset &&
      screenY > inset &&
      screenY < height - inset;

    if (visible) {
      this.hud.hideNpcIndicator();
      return;
    }

    const distance = Phaser.Math.Distance.Between(this.ghost.x, this.ghost.y, this.npc.x, this.npc.y);
    this.hud.showNpcIndicator({ x: screenX, y: screenY }, distance);
  }

  private updateHud(): void {
    this.hud.update({
      score: this.score,
      energy: this.energy,
      fear: this.npc?.fear ?? 0,
      stage: this.npc?.stage ?? 'calm',
    });
  }
}
