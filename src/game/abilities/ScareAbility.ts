export type ScareCategory = 'whisper' | 'cold' | 'object';

export interface ScareAbility {
  id: string;
  name: string;
  category: ScareCategory;
  energyCost: number;
  range: number;
  emoji: string;
  description: string;
}

export const STARTING_ABILITIES: readonly ScareAbility[] = [
  {
    id: 'whisper',
    name: 'Whisper',
    category: 'whisper',
    energyCost: 8,
    range: 180,
    emoji: '💬',
    description: 'Whisper something spooky nearby.',
  },
  {
    id: 'cold-puff',
    name: 'Cold Puff',
    category: 'cold',
    energyCost: 6,
    range: 150,
    emoji: '❄️',
    description: 'Send a chilly breeze past the NPC.',
  },
  {
    id: 'object-nudge',
    name: 'Object Nudge',
    category: 'object',
    energyCost: 10,
    range: 210,
    emoji: '🪑',
    description: 'Nudge nearby furniture with ghost energy.',
  },
] as const;
