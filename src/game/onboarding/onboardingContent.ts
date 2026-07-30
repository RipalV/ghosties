import type { OnboardingStepId, TutorialHighlightTarget } from './types';

export interface OnboardingStepContent {
  readonly icon: string;
  readonly instruction: (visitorName: string) => string;
  readonly highlight: TutorialHighlightTarget;
}

export const ONBOARDING_STEP_CONTENT: Record<OnboardingStepId, OnboardingStepContent> = {
  moveNear: {
    icon: '👻',
    highlight: 'visitor',
    instruction: (name) => `Move your ghost closer to ${name}.`,
  },
  observe: {
    icon: '👁',
    highlight: 'observe',
    instruction: (name) => `Tap 👁 or press O to Observe ${name}.`,
  },
  reviewClue: {
    icon: '🧩',
    highlight: 'clues',
    instruction: () => 'Open 🧩 to read the clue you found.',
  },
  chooseScare: {
    icon: '✨',
    highlight: 'scareGrid',
    instruction: () => 'Pick a scare that might match the clue.',
  },
  stayInRange: {
    icon: '🎯',
    highlight: 'scareGrid',
    instruction: (name) => `Stay close while the scare casts to reach ${name}.`,
  },
  understandExposure: {
    icon: '📡',
    highlight: null,
    instruction: (name) =>
      `Full range = strong scare. Partly close = weaker. Too far = no effect on ${name}.`,
  },
  readResults: {
    icon: '📋',
    highlight: 'results',
    instruction: (name) => `See how you did with ${name}!`,
  },
  startNextVisit: {
    icon: '🔄',
    highlight: 'nextVisit',
    instruction: () => 'Tap Next visit to meet the next guest.',
  },
};

export type CoachingHintId =
  | 'farFromVisitor'
  | 'observeOutOfRange'
  | 'unreviewedClues'
  | 'zeroExposure'
  | 'repeatedIneffective'
  | 'routeNearlyDone';

export interface CoachingHintContent {
  readonly icon: string;
  readonly message: (visitorName: string) => string;
}

export const COACHING_HINT_CONTENT: Record<CoachingHintId, CoachingHintContent> = {
  farFromVisitor: {
    icon: '🏃',
    message: (name) => `Sneak closer to ${name} to Observe or scare.`,
  },
  observeOutOfRange: {
    icon: '👁',
    message: (name) => `Move nearer before you Observe ${name}.`,
  },
  unreviewedClues: {
    icon: '🧩',
    message: () => 'You found a clue — open 🧩 to read it.',
  },
  zeroExposure: {
    icon: '🎯',
    message: (name) => `Stay in range while the scare casts to spook ${name}.`,
  },
  repeatedIneffective: {
    icon: '💡',
    message: () => 'That scare is not working — try another or check your clues.',
  },
  routeNearlyDone: {
    icon: '⏰',
    message: (name) => `${name} is almost leaving — one more snoop or scare?`,
  },
};
