import type { NpcContent } from '../observation/types';

/**
 * Nora's authored fears and clues for the vertical slice.
 *
 * Scare alignment (must match clue hints without naming abilities):
 * - Whisper = high (soft / quiet voices)
 * - Cold = medium (a chill unsettles her a little — not in these clues as the “answer”)
 * - Object = ineffective (moving furniture does not scare her)
 *
 * Each Observe pass unlocks at most one clue (in order). observe again for the next.
 */
export const NORA_CONTENT: NpcContent = {
  id: 'nora',
  displayName: 'Nora',
  primaryFear: 'whisper',
  fearProfile: {
    highFears: ['whisper'],
    mediumFears: ['cold'],
    ineffectiveFears: ['object'],
  },
  observation: {
    // Wider than Whisper (180) so Nora's stroll does not cancel observation as often.
    range: 280,
    // One clue per pass — long enough to read the reveal before observing again.
    durationMs: 8000,
  },
  clues: [
    {
      id: 'nora-whisper-mutter',
      category: 'dialogue',
      text: '"Please… no quiet voices near me."',
      // Each clue unlocks near the end of its own Observe pass.
      revealAtProgress: 0.85,
    },
    {
      id: 'nora-organised-hum',
      category: 'dialogue',
      text: 'Hums while lining up keys — so organised!',
      revealAtProgress: 0.85,
      personalityOnly: true,
    },
    {
      id: 'nora-quiet-glance',
      category: 'body_language',
      text: 'Cups her ear — soft voices make her flinch.',
      revealAtProgress: 0.85,
    },
    {
      id: 'nora-trolley-wobble',
      category: 'nearby_object',
      text: 'Trolley wobbles — she giggles. Moving stuff? Fine.',
      revealAtProgress: 0.85,
    },
  ],
};
