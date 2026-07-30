import type { VisitorId } from '../content/visitorRegistry';
import { initialVisitIndex } from '../session/visitorRotation';
import type { OnboardingState } from './types';

/** Full guided onboarding only on the first Nora visit of the browser session. */
export function shouldOfferGuidedOnboarding(
  visitIndex: number,
  visitorId: VisitorId,
  sessionFinished: boolean,
): boolean {
  return visitIndex === initialVisitIndex() && visitorId === 'nora' && !sessionFinished;
}

export function isFirstNoraVisit(visitIndex: number, visitorId: VisitorId): boolean {
  return visitIndex === initialVisitIndex() && visitorId === 'nora';
}

export function createOnboardingState(sessionFinished = false): OnboardingState {
  return {
    mode: 'inactive',
    step: null,
    sessionFinished,
    presentationVisible: false,
  };
}

export function onboardingSessionFinished(state: OnboardingState): boolean {
  return state.sessionFinished || state.mode === 'finished';
}
