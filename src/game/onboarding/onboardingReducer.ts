import { ONBOARDING_STEP_CONTENT } from './onboardingContent';
import { shouldOfferGuidedOnboarding } from './onboardingSession';
import type {
  OnboardingEvent,
  OnboardingPresentation,
  OnboardingState,
  OnboardingStepId,
} from './types';
import { ONBOARDING_STEP_ORDER } from './types';

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

function nextStep(step: OnboardingStepId): OnboardingStepId | 'complete' {
  const index = ONBOARDING_STEP_ORDER.indexOf(step);
  if (index < 0 || index >= ONBOARDING_STEP_ORDER.length - 1) return 'complete';
  return ONBOARDING_STEP_ORDER[index + 1];
}

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
    case 'moveNear':
      if (event.type === 'enteredObserveRange') {
        return advanceTo(state, nextStep(step), visitorName);
      }
      break;
    case 'observe':
      if (event.type === 'observeCompletedWithClue') {
        return advanceTo(state, nextStep(step), visitorName);
      }
      break;
    case 'reviewClue':
      if (event.type === 'cluePanelOpened') {
        return advanceTo(state, nextStep(step), visitorName);
      }
      break;
    case 'chooseScare':
      if (event.type === 'scareCastStarted') {
        return advanceTo(state, nextStep(step), visitorName);
      }
      break;
    case 'stayInRange':
      if (event.type === 'scareCastInRange') {
        return advanceTo(state, nextStep(step), visitorName);
      }
      break;
    case 'understandExposure':
      if (event.type === 'scareCastResolved') {
        // Teach exposure on resolve, then hide until visit results appear so the player can keep scaring.
        return {
          state: {
            ...state,
            step: 'readResults',
            presentationVisible: false,
          },
          presentation: EMPTY_PRESENTATION,
        };
      }
      break;
    case 'readResults':
      if (event.type === 'resultsShown') {
        return advanceTo(state, nextStep(step), visitorName);
      }
      break;
    case 'startNextVisit':
      if (event.type === 'nextVisitStarted') {
        return advanceTo(state, 'complete', visitorName);
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

  if (event.type === 'departureStarted' || event.type === 'clearPresentation') {
    return {
      state: { ...state, presentationVisible: false },
      presentation: EMPTY_PRESENTATION,
    };
  }

  if (event.type === 'visitorTargetable') {
    if (
      shouldOfferGuidedOnboarding(event.visitIndex, event.visitorId, state.sessionFinished)
    ) {
      const started: OnboardingState = {
        mode: 'guided',
        step: 'moveNear',
        sessionFinished: false,
        presentationVisible: true,
      };
      return withPresentation(started, visitorName, true);
    }
    return { state, presentation: EMPTY_PRESENTATION };
  }

  if (state.mode !== 'guided') {
    if (event.type === 'resultsShown' && state.step === 'readResults') {
      return withPresentation(state, visitorName, false);
    }
    return { state, presentation: EMPTY_PRESENTATION };
  }

  if (event.type === 'resultsShown') {
    const step = state.step;
    if (step) {
      const stepIndex = ONBOARDING_STEP_ORDER.indexOf(step);
      const understandIndex = ONBOARDING_STEP_ORDER.indexOf('understandExposure');
      if (stepIndex >= 0 && stepIndex <= understandIndex) {
        return advanceTo(state, 'startNextVisit', visitorName);
      }
      if (step === 'readResults') {
        return advanceTo(state, 'startNextVisit', visitorName);
      }
    }
    return handleGuidedEvent(state, event, visitorName);
  }

  return handleGuidedEvent(state, event, visitorName);
}
