import type { ExposureOutcomeKind } from '../scareCast/scareCastExposure';
import type { VisitorId } from '../content/visitorRegistry';

export type OnboardingStepId =
  | 'welcome'
  | 'guestMotive'
  | 'moveNearObserve'
  | 'reviewClues'
  | 'chooseScareStayClose'
  | 'repeatLoop';

export type OnboardingMode = 'inactive' | 'guided' | 'finished';

export type TutorialHighlightTarget =
  | 'observe'
  | 'clues'
  | 'scareGrid'
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
  readonly guestArrivalPending: boolean;
  readonly visitorTargetablePending: boolean;
}

export type OnboardingEvent =
  | { readonly type: 'sessionReady' }
  | { readonly type: 'guestArriving'; readonly visitIndex: number; readonly visitorId: VisitorId }
  | { readonly type: 'visitorTargetable'; readonly visitIndex: number; readonly visitorId: VisitorId }
  | { readonly type: 'observeCompletedWithClue' }
  | { readonly type: 'cluePanelOpened' }
  | { readonly type: 'scareCastResolved'; readonly exposure: ExposureOutcomeKind }
  | { readonly type: 'skipHelp' }
  | { readonly type: 'promptAcknowledged' }
  | { readonly type: 'departureStarted' }
  | { readonly type: 'clearPresentation' };

export const ONBOARDING_STEP_ORDER: readonly OnboardingStepId[] = [
  'welcome',
  'guestMotive',
  'moveNearObserve',
  'reviewClues',
  'chooseScareStayClose',
  'repeatLoop',
] as const;
