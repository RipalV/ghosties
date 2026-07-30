import type { OnboardingStepId, TutorialHighlightTarget } from './types';

export interface OnboardingStepContent {
  readonly icon: string;
  readonly instruction: (visitorName: string) => string;
  readonly highlight: TutorialHighlightTarget;
}

export const ONBOARDING_STEP_CONTENT: Record<OnboardingStepId, OnboardingStepContent> = {
  welcome: {
    icon: '👻',
    highlight: null,
    instruction: () => 'Welcome to the Crooked Moon! You are a sneaky ghost — snoop, spook, and climb the scare charts.',
  },
  guestMotive: {
    icon: '🎯',
    highlight: null,
    instruction: (name) => `A guest is coming! Spook ${name} silly and push their fear sky-high.`,
  },
  moveNearObserve: {
    icon: '👁',
    highlight: 'observe',
    instruction: (name) => `Sneak close to ${name}, then tap 👁 to Observe.`,
  },
  reviewClues: {
    icon: '🧩',
    highlight: 'clues',
    instruction: () => 'Nice snoop! Open 🧩 and peek at what you learned.',
  },
  chooseScareStayClose: {
    icon: '✨',
    highlight: 'scareGrid',
    instruction: (name) => `Pick a scare from your clues — stay close while it casts on ${name}!`,
  },
  repeatLoop: {
    icon: '🔁',
    highlight: null,
    instruction: (name) => `Boo-yah! Observe, check clues, and scare ${name} again!`,
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

export function highlightForOnboardingStep(step: OnboardingStepId): TutorialHighlightTarget {
  return ONBOARDING_STEP_CONTENT[step].highlight;
}
