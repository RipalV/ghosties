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

function startGuidedWelcome() {
  return reduceOnboarding(createOnboardingState(), { type: 'sessionReady' }, 'Nora');
}

function acknowledge(state: ReturnType<typeof reduceOnboarding>['state']) {
  return reduceOnboarding(state, { type: 'promptAcknowledged' }, 'Nora');
}

describe('guided onboarding progression', () => {
  it('starts with welcome when the lobby is ready', () => {
    const started = startGuidedWelcome();
    expect(started.state.mode).toBe('guided');
    expect(started.state.step).toBe('welcome');
    expect(started.presentation.instructionText).toContain('ghost');
  });

  it('does not start guided onboarding for Milo via session events', () => {
    let state = startGuidedWelcome().state;
    state = acknowledge(state).state;
    const miloArrival = reduceOnboarding(state, {
      type: 'guestArriving',
      visitIndex: 1,
      visitorId: 'milo',
    }, 'Milo');
    expect(miloArrival.state.step).toBe('welcome');
  });

  it('advances welcome to guest motive when Nora arrives', () => {
    let state = acknowledge(startGuidedWelcome().state).state;
    const motive = reduceOnboarding(state, {
      type: 'guestArriving',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora');
    expect(motive.state.step).toBe('guestMotive');
    expect(motive.presentation.instructionText).toContain('fear');
  });

  it('queues guest motive if Nora arrives during the welcome prompt', () => {
    let state = startGuidedWelcome().state;
    state = reduceOnboarding(state, {
      type: 'guestArriving',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;
    expect(state.guestArrivalPending).toBe(true);
    expect(state.step).toBe('welcome');

    const motive = acknowledge(state);
    expect(motive.state.step).toBe('guestMotive');
    expect(motive.presentation.instructionText).toContain('Nora');
  });

  it('advances through observe, clues, scare, and repeat on matching events', () => {
    let state = acknowledge(startGuidedWelcome().state).state;
    state = reduceOnboarding(state, {
      type: 'guestArriving',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;
    state = acknowledge(state).state;
    state = reduceOnboarding(state, {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;
    expect(state.step).toBe('moveNearObserve');

    state = acknowledge(state).state;
    state = reduceOnboarding(state, { type: 'observeCompletedWithClue' }, 'Nora').state;
    expect(state.step).toBe('reviewClues');

    state = acknowledge(state).state;
    state = reduceOnboarding(state, { type: 'cluePanelOpened' }, 'Nora').state;
    expect(state.step).toBe('chooseScareStayClose');

    state = acknowledge(state).state;
    const afterScare = reduceOnboarding(state, {
      type: 'scareCastResolved',
      exposure: 'partial',
    }, 'Nora');
    expect(afterScare.state.step).toBe('repeatLoop');
    expect(afterScare.presentation.instructionText).toContain('again');
  });

  it('does not advance to repeat on a zero-exposure scare', () => {
    let state = acknowledge(startGuidedWelcome().state).state;
    state = reduceOnboarding(state, {
      type: 'guestArriving',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;
    state = acknowledge(state).state;
    state = reduceOnboarding(state, {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;
    state = acknowledge(state).state;
    state = reduceOnboarding(state, { type: 'observeCompletedWithClue' }, 'Nora').state;
    state = acknowledge(state).state;
    state = reduceOnboarding(state, { type: 'cluePanelOpened' }, 'Nora').state;
    state = acknowledge(state).state;

    const miss = reduceOnboarding(state, { type: 'scareCastResolved', exposure: 'miss' }, 'Nora');
    expect(miss.state.step).toBe('chooseScareStayClose');
  });

  it('acknowledges a prompt without advancing the step', () => {
    let state = startGuidedWelcome().state;
    const acknowledged = acknowledge(state);
    expect(acknowledged.state.step).toBe('welcome');
    expect(acknowledged.state.presentationVisible).toBe(false);
  });

  it('finishes guided mode after acknowledging the repeat prompt', () => {
    let state = acknowledge(startGuidedWelcome().state).state;
    state = reduceOnboarding(state, {
      type: 'guestArriving',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;
    state = acknowledge(state).state;
    state = reduceOnboarding(state, {
      type: 'visitorTargetable',
      visitIndex: 0,
      visitorId: 'nora',
    }, 'Nora').state;
    state = acknowledge(state).state;
    state = reduceOnboarding(state, { type: 'observeCompletedWithClue' }, 'Nora').state;
    state = acknowledge(state).state;
    state = reduceOnboarding(state, { type: 'cluePanelOpened' }, 'Nora').state;
    state = acknowledge(state).state;
    state = reduceOnboarding(state, { type: 'scareCastResolved', exposure: 'full' }, 'Nora').state;

    const finished = acknowledge(state);
    expect(finished.state.sessionFinished).toBe(true);
    expect(finished.state.mode).toBe('finished');
  });

  it('skips end the guided sequence for the session', () => {
    const skipped = reduceOnboarding(startGuidedWelcome().state, { type: 'skipHelp' }, 'Nora');
    expect(skipped.state.sessionFinished).toBe(true);
    expect(skipped.state.mode).toBe('finished');

    const again = reduceOnboarding(skipped.state, { type: 'sessionReady' }, 'Nora');
    expect(again.state.mode).not.toBe('guided');
  });

  it('clears presentation on departure without finishing the session flag', () => {
    let state = startGuidedWelcome().state;
    const cleared = reduceOnboarding(state, { type: 'departureStarted' }, 'Nora');
    expect(cleared.state.sessionFinished).toBe(false);
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
      nearUnusedProp: false,
      shownHints: createCoachingHintSet(),
    });

    expect(hint.hintId).toBe('zeroExposure');
    expect(hint.message).toContain('Nora');
    expect(hint.message?.toLowerCase()).not.toContain('whisper');
  });

  it('does not offer coaching while guided onboarding is active', () => {
    const guided = startGuidedWelcome().state;

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
      nearUnusedProp: false,
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
    const observe = ONBOARDING_STEP_CONTENT.moveNearObserve.instruction('Milo');
    expect(observe).toContain('Milo');
    expect(observe.toLowerCase()).not.toContain('object');
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

    reduceOnboarding(createOnboardingState(), { type: 'sessionReady' }, 'Nora');
    reduceOnboarding(createOnboardingState(), { type: 'skipHelp' }, 'Nora');

    expect(score).toBe(42);
    expect(fear).toBe(18);
    expect(energy).toBe(77);
  });
});
