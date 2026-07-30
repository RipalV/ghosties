import { ONBOARDING_STEP_CONTENT } from './onboardingContent';
import { shouldOfferGuidedOnboarding } from './onboardingSession';
import type {
  OnboardingEvent,
  OnboardingPresentation,
  OnboardingState,
  OnboardingStepId,
} from './types';

export interface ReduceOnboardingResult {
  readonly state: OnboardingState;
  readonly presentation: OnboardingPresentation;
}

const EMPTY_PRESENTATION: OnboardingPresentation = {
  instructionText: null,
  instructionIcon: null,
  highlight: null,
  showSkip: false,
};

function presentationForStep(
  step: OnboardingStepId,
  visitorName: string,
  showSkip: boolean,
): OnboardingPresentation {
  const content = ONBOARDING_STEP_CONTENT[step];
  return {
    instructionText: content.instruction(visitorName),
    instructionIcon: content.icon,
    highlight: content.highlight,
    showSkip,
  };
}

function withPresentation(
  state: OnboardingState,
  visitorName: string,
  visible: boolean,
): ReduceOnboardingResult {
  if (!visible || state.mode !== 'guided' || !state.step) {
    return {
      state: { ...state, presentationVisible: false },
      presentation: EMPTY_PRESENTATION,
    };
  }

  return {
    state: { ...state, presentationVisible: true },
    presentation: presentationForStep(state.step, visitorName, true),
  };
}

function finishSession(_state: OnboardingState): OnboardingState {
  return {
    mode: 'finished',
    step: null,
    sessionFinished: true,
    presentationVisible: false,
    guestArrivalPending: false,
    visitorTargetablePending: false,
  };
}

function advanceTo(
  state: OnboardingState,
  step: OnboardingStepId | 'complete',
  visitorName: string,
): ReduceOnboardingResult {
  if (step === 'complete') {
    const finished = finishSession(state);
    return { state: finished, presentation: EMPTY_PRESENTATION };
  }

  const next: OnboardingState = {
    ...state,
    mode: 'guided',
    step,
    presentationVisible: true,
  };
  return withPresentation(next, visitorName, true);
}

function handleGuidedEvent(
  state: OnboardingState,
  event: OnboardingEvent,
  visitorName: string,
): ReduceOnboardingResult {
  const step = state.step;
  if (!step) return { state, presentation: EMPTY_PRESENTATION };

  switch (step) {
    case 'moveNearObserve':
      if (event.type === 'observeCompletedWithClue') {
        return advanceTo(state, 'reviewClues', visitorName);
      }
      break;
    case 'reviewClues':
      if (event.type === 'cluePanelOpened') {
        return advanceTo(state, 'chooseScareStayClose', visitorName);
      }
      break;
    case 'chooseScareStayClose':
      if (event.type === 'scareCastResolved' && event.exposure !== 'miss') {
        return advanceTo(state, 'repeatLoop', visitorName);
      }
      break;
    default:
      break;
  }

  return withPresentation(state, visitorName, state.presentationVisible);
}

export function reduceOnboarding(
  state: OnboardingState,
  event: OnboardingEvent,
  visitorName: string,
): ReduceOnboardingResult {
  if (event.type === 'skipHelp') {
    const finished = finishSession(state);
    return { state: finished, presentation: EMPTY_PRESENTATION };
  }

  if (event.type === 'promptAcknowledged') {
    if (state.mode !== 'guided' || !state.presentationVisible || !state.step) {
      return { state, presentation: EMPTY_PRESENTATION };
    }

    if (state.step === 'repeatLoop') {
      return { state: finishSession(state), presentation: EMPTY_PRESENTATION };
    }

    const dismissed: OnboardingState = {
      ...state,
      presentationVisible: false,
    };

    if (dismissed.step === 'welcome' && dismissed.guestArrivalPending) {
      return advanceTo(
        { ...dismissed, guestArrivalPending: false },
        'guestMotive',
        visitorName,
      );
    }

    if (dismissed.step === 'guestMotive' && dismissed.visitorTargetablePending) {
      return advanceTo(
        { ...dismissed, visitorTargetablePending: false },
        'moveNearObserve',
        visitorName,
      );
    }

    return { state: dismissed, presentation: EMPTY_PRESENTATION };
  }

  if (event.type === 'departureStarted' || event.type === 'clearPresentation') {
    return {
      state: { ...state, presentationVisible: false },
      presentation: EMPTY_PRESENTATION,
    };
  }

  if (event.type === 'sessionReady') {
    if (state.mode === 'finished' || state.sessionFinished) {
      return { state, presentation: EMPTY_PRESENTATION };
    }
    if (shouldOfferGuidedOnboarding(0, 'nora', state.sessionFinished)) {
      const started: OnboardingState = {
        mode: 'guided',
        step: 'welcome',
        sessionFinished: false,
        presentationVisible: true,
        guestArrivalPending: false,
        visitorTargetablePending: false,
      };
      return withPresentation(started, visitorName, true);
    }
    return { state, presentation: EMPTY_PRESENTATION };
  }

  if (event.type === 'guestArriving') {
    if (
      !shouldOfferGuidedOnboarding(event.visitIndex, event.visitorId, state.sessionFinished) ||
      state.mode !== 'guided'
    ) {
      return { state, presentation: EMPTY_PRESENTATION };
    }

    if (state.step === 'welcome') {
      if (!state.presentationVisible) {
        return advanceTo({ ...state, guestArrivalPending: false }, 'guestMotive', visitorName);
      }
      return {
        state: { ...state, guestArrivalPending: true },
        presentation: EMPTY_PRESENTATION,
      };
    }

    return { state, presentation: EMPTY_PRESENTATION };
  }

  if (event.type === 'visitorTargetable') {
    if (state.mode !== 'guided') {
      return { state, presentation: EMPTY_PRESENTATION };
    }

    if (state.step === 'guestMotive') {
      if (!state.presentationVisible) {
        return advanceTo(
          { ...state, visitorTargetablePending: false },
          'moveNearObserve',
          visitorName,
        );
      }
      return {
        state: { ...state, visitorTargetablePending: true },
        presentation: EMPTY_PRESENTATION,
      };
    }

    return { state, presentation: EMPTY_PRESENTATION };
  }

  if (state.mode !== 'guided') {
    return { state, presentation: EMPTY_PRESENTATION };
  }

  return handleGuidedEvent(state, event, visitorName);
}
