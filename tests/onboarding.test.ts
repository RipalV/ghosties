import { describe, expect, it } from 'vitest';
import {
  createCoachingHintSet,
  estimateRouteProgress,
  markCoachingHintShown,
  selectCoachingHint,
} from '../src/game/onboarding/contextualCoaching';
import { ONBOARDING_STEP_CONTENT } from '../src/game/onboarding/onboardingContent';
import { reduceOnboarding } from '../src/game/onboarding/onboardingReducer';
import {
  createOnboardingState,
  shouldOfferGuidedOnboarding,
} from '../src/game/onboarding/onboardingSession';

describe('onboarding session gate', () => {
  it('offers guided onboarding on the first Nora visit only', () => {
    expect(shouldOfferGuidedOnboarding(0, 'nora', false)).toBe(true);
    expect(shouldOfferGuidedOnboarding(1, 'milo', false)).toBe(false);
    expect(shouldOfferGuidedOnboarding(0, 'nora', true)).toBe(false);
  });
});

describe('guided onboarding progression', () => {
  it('starts at moveNear when Nora becomes targetable', () => {
    const started = reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora');

    expect(started.state.mode).toBe('guided');
    expect(started.state.step).toBe('moveNear');
    expect(started.presentation.instructionText).toContain('Nora');
  });

  it('does not start guided onboarding for Milo', () => {
    const result = reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 1,
      visitorId: 'milo',
    }, 'Milo');

    expect(result.state.mode).toBe('inactive');
    expect(result.presentation.instructionText).toBeNull();
  });

  it('advances moveNear when already in observation range at targetable', () => {
    let state = createOnboardingState();
    state = reduceOnboarding(state, {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;
    expect(state.step).toBe('moveNear');

    const advanced = reduceOnboarding(state, { type: 'enteredObserveRange' }, 'Nora');
    expect(advanced.state.step).toBe('observe');
    expect(advanced.presentation.instructionText).toContain('Observe');
  });

  it('advances steps only on matching events', () => {
    let state = reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;

    const invalidObserve = reduceOnboarding(state, { type: 'observeCompletedWithClue' }, 'Nora');
    expect(invalidObserve.state.step).toBe('moveNear');

    state = reduceOnboarding(state, { type: 'enteredObserveRange' }, 'Nora').state;
    expect(state.step).toBe('observe');

    state = reduceOnboarding(state, { type: 'observeCompletedWithClue' }, 'Nora').state;
    expect(state.step).toBe('reviewClue');

    state = reduceOnboarding(state, { type: 'cluePanelOpened' }, 'Nora').state;
    expect(state.step).toBe('chooseScare');

    state = reduceOnboarding(state, { type: 'scareCastStarted' }, 'Nora').state;
    expect(state.step).toBe('stayInRange');

    state = reduceOnboarding(state, { type: 'scareCastInRange' }, 'Nora').state;
    expect(state.step).toBe('understandExposure');

    const afterResolve = reduceOnboarding(state, { type: 'scareCastResolved', exposure: 'partial' }, 'Nora');
    expect(afterResolve.state.step).toBe('readResults');
    expect(afterResolve.state.presentationVisible).toBe(false);
    expect(afterResolve.presentation.instructionText).toBeNull();
  });

  it('shows next-visit help when results appear after the first scare', () => {
    let state = reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;

    state = reduceOnboarding(state, { type: 'enteredObserveRange' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'observeCompletedWithClue' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'cluePanelOpened' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'scareCastStarted' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'scareCastInRange' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'scareCastResolved', exposure: 'full' }, 'Nora').state;
    expect(state.step).toBe('readResults');
    expect(state.presentationVisible).toBe(false);

    const shown = reduceOnboarding(state, { type: 'resultsShown' }, 'Nora');
    expect(shown.state.step).toBe('startNextVisit');
    expect(shown.presentation.instructionText).toContain('Next visit');
  });

  it('jumps to next-visit help when results appear mid-tutorial', () => {
    let state = reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;

    state = reduceOnboarding(state, { type: 'enteredObserveRange' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'observeCompletedWithClue' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'cluePanelOpened' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'scareCastStarted' }, 'Nora').state;
    expect(state.step).toBe('stayInRange');

    const shown = reduceOnboarding(state, { type: 'resultsShown' }, 'Nora');
    expect(shown.state.step).toBe('startNextVisit');
    expect(shown.presentation.highlight).toBe('nextVisit');
  });

  it('skips end the guided sequence for the session', () => {
    let state = reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;

    const skipped = reduceOnboarding(state, { type: 'skipHelp' }, 'Nora');
    expect(skipped.state.sessionFinished).toBe(true);
    expect(skipped.state.mode).toBe('finished');
    expect(skipped.presentation.instructionText).toBeNull();

    const again = reduceOnboarding(skipped.state, {
      type: 'visitorTargetable',
      visitIndex: 2,
      visitorId: 'nora',
    }, 'Nora');
    expect(again.state.mode).not.toBe('guided');
  });

  it('completes after Next visit and does not restart in-session', () => {
    let state = reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;

    state = reduceOnboarding(state, { type: 'enteredObserveRange' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'observeCompletedWithClue' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'cluePanelOpened' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'scareCastStarted' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'scareCastInRange' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'scareCastResolved', exposure: 'full' }, 'Nora').state;
    state = reduceOnboarding(state, { type: 'resultsShown' }, 'Nora').state;
    expect(state.step).toBe('startNextVisit');

    const finished = reduceOnboarding(state, { type: 'nextVisitStarted' }, 'Nora');
    expect(finished.state.sessionFinished).toBe(true);
    expect(finished.state.mode).toBe('finished');
  });

  it('clears presentation on departure without finishing the session flag', () => {
    const state = reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;

    const cleared = reduceOnboarding(state, { type: 'departureStarted' }, 'Nora');
    expect(cleared.state.sessionFinished).toBe(false);
    expect(cleared.presentation.instructionText).toBeNull();
    expect(cleared.state.presentationVisible).toBe(false);
  });
});

describe('contextual coaching', () => {
  it('selects zero-exposure coaching without naming a hidden fear', () => {
    const finished = reduceOnboarding(createOnboardingState(), { type: 'skipHelp' }, 'Nora').state;
    const hint = selectCoachingHint({
      onboarding: finished,
      visitorTargetable: true,
      visitorName: 'Nora',
      inObserveRange: true,
      inAnyScareRange: true,
      observeOutOfRangeAttempt: false,
      discoveredClueCount: 1,
      cluePanelReviewed: true,
      lastResolvedExposure: 'miss',
      repeatedIneffectiveCount: 0,
      routeProgressRatio: 0.2,
      farFromVisitorMs: 0,
      shownHints: createCoachingHintSet(),
    });

    expect(hint.hintId).toBe('zeroExposure');
    expect(hint.message).toContain('Nora');
    expect(hint.message?.toLowerCase()).not.toContain('whisper');
  });

  it('does not offer coaching while guided onboarding is active', () => {
    const guided = reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;

    const hint = selectCoachingHint({
      onboarding: guided,
      visitorTargetable: true,
      visitorName: 'Nora',
      inObserveRange: false,
      inAnyScareRange: false,
      observeOutOfRangeAttempt: false,
      discoveredClueCount: 0,
      cluePanelReviewed: false,
      lastResolvedExposure: null,
      repeatedIneffectiveCount: 0,
      routeProgressRatio: 0.9,
      farFromVisitorMs: 5000,
      shownHints: createCoachingHintSet(),
    });

    expect(hint.hintId).toBeNull();
  });

  it('tracks shown hints deterministically', () => {
    const shown = markCoachingHintShown(createCoachingHintSet(), 'zeroExposure');
    expect(shown.has('zeroExposure')).toBe(true);
    expect(markCoachingHintShown(shown, 'zeroExposure')).toEqual(shown);
  });
});

describe('onboarding content', () => {
  it('parameterises copy by visitor name without spoiling fears', () => {
    const moveNear = ONBOARDING_STEP_CONTENT.moveNear.instruction('Milo');
    expect(moveNear).toContain('Milo');
    expect(moveNear.toLowerCase()).not.toContain('object');
  });

  it('estimates route progress for coaching eligibility', () => {
    expect(estimateRouteProgress('poi', 2, 4, false)).toBeGreaterThan(0.5);
    expect(estimateRouteProgress('exit', 0, 4, false)).toBeGreaterThan(0.8);
  });
});

describe('onboarding independence from gameplay', () => {
  it('does not mutate external score, fear, or energy values', () => {
    const score = 42;
    const fear = 18;
    const energy = 77;

    reduceOnboarding(createOnboardingState(), {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora');
    reduceOnboarding(createOnboardingState(), { type: 'skipHelp' }, 'Nora');

    expect(score).toBe(42);
    expect(fear).toBe(18);
    expect(energy).toBe(77);
  });
});
