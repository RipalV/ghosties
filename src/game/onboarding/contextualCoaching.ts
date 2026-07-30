import type { ExposureOutcomeKind } from '../scareCast/scareCastExposure';
import { COACHING_HINT_CONTENT, type CoachingHintId } from './onboardingContent';
import { onboardingSessionFinished } from './onboardingSession';
import type { OnboardingState } from './types';

export interface CoachingInput {
  readonly onboarding: OnboardingState;
  readonly visitorTargetable: boolean;
  readonly visitorName: string;
  readonly inObserveRange: boolean;
  readonly inAnyScareRange: boolean;
  readonly observeOutOfRangeAttempt: boolean;
  readonly discoveredClueCount: number;
  readonly cluePanelReviewed: boolean;
  readonly lastResolvedExposure: ExposureOutcomeKind | null;
  readonly repeatedIneffectiveCount: number;
  readonly routeProgressRatio: number;
  readonly farFromVisitorMs: number;
  readonly nearUnusedProp: boolean;
  readonly shownHints: ReadonlySet<CoachingHintId>;
}

export interface CoachingPresentation {
  readonly hintId: CoachingHintId | null;
  readonly icon: string | null;
  readonly message: string | null;
}

const FAR_FROM_VISITOR_MS = 4500;
const ROUTE_NEARLY_DONE_RATIO = 0.72;
const REPEATED_INEFFECTIVE_THRESHOLD = 2;

export function estimateRouteProgress(
  leg: 'spawn' | 'entrance' | 'poi' | 'exit',
  poiIndex: number,
  poiCount: number,
  routeComplete: boolean,
): number {
  if (routeComplete) return 1;
  if (leg === 'exit') return 0.92;
  if (leg === 'poi' && poiCount > 0) {
    return Math.min(0.88, (poiIndex + 1) / (poiCount + 1));
  }
  if (leg === 'entrance') return 0.15;
  return 0;
}

export function coachingAllowed(onboarding: OnboardingState): boolean {
  return onboardingSessionFinished(onboarding) || onboarding.mode === 'finished';
}

export function selectCoachingHint(input: CoachingInput): CoachingPresentation {
  const empty: CoachingPresentation = { hintId: null, icon: null, message: null };
  if (!coachingAllowed(input.onboarding) || !input.visitorTargetable) {
    return empty;
  }

  const tryHint = (id: CoachingHintId): CoachingPresentation | null => {
    if (input.shownHints.has(id)) return null;
    const content = COACHING_HINT_CONTENT[id];
    return {
      hintId: id,
      icon: content.icon,
      message: content.message(input.visitorName),
    };
  };

  if (input.observeOutOfRangeAttempt) {
    return tryHint('observeOutOfRange') ?? empty;
  }

  if (input.lastResolvedExposure === 'miss') {
    return tryHint('zeroExposure') ?? empty;
  }

  if (input.nearUnusedProp) {
    return tryHint('propComboAvailable') ?? empty;
  }

  if (input.repeatedIneffectiveCount >= REPEATED_INEFFECTIVE_THRESHOLD) {
    return tryHint('repeatedIneffective') ?? empty;
  }

  if (
    input.discoveredClueCount > 0 &&
    !input.cluePanelReviewed
  ) {
    return tryHint('unreviewedClues') ?? empty;
  }

  if (input.routeProgressRatio >= ROUTE_NEARLY_DONE_RATIO) {
    return tryHint('routeNearlyDone') ?? empty;
  }

  if (
    !input.inObserveRange &&
    !input.inAnyScareRange &&
    input.farFromVisitorMs >= FAR_FROM_VISITOR_MS
  ) {
    return tryHint('farFromVisitor') ?? empty;
  }

  return empty;
}

export function markCoachingHintShown(
  shown: ReadonlySet<CoachingHintId>,
  hintId: CoachingHintId,
): Set<CoachingHintId> {
  if (shown.has(hintId)) return new Set(shown);
  return new Set([...shown, hintId]);
}

export function createCoachingHintSet(): Set<CoachingHintId> {
  return new Set();
}
