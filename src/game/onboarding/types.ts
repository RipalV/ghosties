import type { ExposureOutcomeKind } from '../scareCast/scareCastExposure';
import type { VisitorId } from '../content/visitorRegistry';

export type OnboardingStepId =
  | 'moveNear'
  | 'observe'
  | 'reviewClue'
  | 'chooseScare'
  | 'stayInRange'
  | 'understandExposure'
  | 'readResults'
  | 'startNextVisit';

export type OnboardingMode = 'inactive' | 'guided' | 'finished';

export type TutorialHighlightTarget =
  | 'visitor'
  | 'observe'
  | 'clues'
  | 'scareGrid'
  | 'results'
  | 'nextVisit'
  | null;

export interface OnboardingPresentation {
  readonly instructionText: string | null;
  readonly instructionIcon: string | null;
  readonly highlight: TutorialHighlightTarget;
  readonly showSkip: boolean;
}

export interface OnboardingState {
  readonly mode: OnboardingMode;
  readonly step: OnboardingStepId | null;
  readonly sessionFinished: boolean;
  readonly presentationVisible: boolean;
}

export type OnboardingEvent =
  | { readonly type: 'visitorTargetable'; readonly visitIndex: number; readonly visitorId: VisitorId }
  | { readonly type: 'enteredObserveRange' }
  | { readonly type: 'observeCompletedWithClue' }
  | { readonly type: 'cluePanelOpened' }
  | { readonly type: 'scareCastStarted' }
  | { readonly type: 'scareCastInRange' }
  | { readonly type: 'scareCastResolved'; readonly exposure: ExposureOutcomeKind }
  | { readonly type: 'resultsShown' }
  | { readonly type: 'nextVisitStarted' }
  | { readonly type: 'skipHelp' }
  | { readonly type: 'departureStarted' }
  | { readonly type: 'clearPresentation' };

export const ONBOARDING_STEP_ORDER: readonly OnboardingStepId[] = [
  'moveNear',
  'observe',
  'reviewClue',
  'chooseScare',
  'stayInRange',
  'understandExposure',
  'readResults',
  'startNextVisit',
] as const;
