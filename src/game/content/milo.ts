import type { NpcContent } from '../observation/types';

/**
 * Milo's authored fears and clues for the vertical slice.
 *
 * Scare alignment (must match clue hints without naming abilities):
 * - Object = high (wobbly / moving furniture)
 * - Cold = medium (a chill unsettles him a little)
 * - Whisper = ineffective (soft voices make him giggle, not jump)
 */
export const MILO_CONTENT: NpcContent = {
  id: 'milo',
  displayName: 'Milo',
  primaryFear: 'object',
  fearProfile: {
    highFears: ['object'],
    mediumFears: ['cold'],
    ineffectiveFears: ['whisper'],
  },
  observation: {
    range: 260,
    durationMs: 7500,
  },
  clues: [
    {
      id: 'milo-chair-grumble',
      category: 'dialogue',
      text: '"If that chair twitches again, I\'m out!"',
      revealAtProgress: 0.85,
    },
    {
      id: 'milo-snack-chat',
      category: 'dialogue',
      text: 'Raves about the snack bowl — total chatterbox!',
      revealAtProgress: 0.85,
      personalityOnly: true,
    },
    {
      id: 'milo-breeze-shiver',
      category: 'body_language',
      text: 'Shivers at a draft — chilly, not terrified.',
      revealAtProgress: 0.85,
    },
    {
      id: 'milo-stool-steady',
      category: 'nearby_object',
      text: 'Lunges for a wobbly stool — moving stuff freaks him out!',
      revealAtProgress: 0.85,
    },
  ],
};
