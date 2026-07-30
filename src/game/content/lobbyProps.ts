import type { ScareCategory } from '../abilities/ScareAbility';
import type { VisitorId } from './visitorRegistry';

/** Score-only bonus for a successful hotel-trick combo (does not affect fear). */
export const LOBBY_PROP_COMBO_BONUS = 10;

export const HOTEL_TRICK_AWARD_MESSAGE = 'Hotel trick!';

export interface LobbyPropDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly compatibleCategory: ScareCategory;
  readonly ghostActivationRadius: number;
  readonly visitorReactionRadius: number;
  readonly visualKey: string;
  readonly defaultReactionCopy: string;
  /** Per-visitor reaction overrides — keyed in content, not scene branches. */
  readonly visitorReactions?: Partial<Record<VisitorId, string>>;
}

/**
 * Three hauntable lobby props. Positions align with existing furniture silhouettes:
 * bell on the reception desk, crooked portrait on the left wall, drafty hearth by the piano nook.
 *
 * Intended route pairings (see noraVisit / miloVisit POI tweaks):
 * - Nora: reception bell (Object Nudge) + crooked portrait (Whisper)
 * - Milo: drafty fireplace (Cold Puff)
 */
export const LOBBY_PROPS: readonly LobbyPropDefinition[] = [
  {
    id: 'reception-bell',
    displayName: 'Reception bell',
    /** Matches the brass bell on the reception counter in LobbyEnvironment. */
    position: { x: 574, y: 333 },
    compatibleCategory: 'object',
    ghostActivationRadius: 140,
    visitorReactionRadius: 120,
    visualKey: 'bell',
    defaultReactionCopy: 'Ding! The bell jingles all by itself!',
    visitorReactions: {
      nora: 'Nora jumps — that bell was not supposed to ring!',
      milo: 'Milo spins toward the desk — who rang that?',
    },
  },
  {
    id: 'crooked-portrait',
    displayName: 'Crooked portrait',
    /** Floor hotspot under the left-wall painting (not a second floor frame). */
    position: { x: 540, y: 390 },
    compatibleCategory: 'whisper',
    ghostActivationRadius: 130,
    visitorReactionRadius: 120,
    visualKey: 'portrait',
    defaultReactionCopy: 'The portrait whispers back — eerie!',
    visitorReactions: {
      nora: 'Nora shivers — the painted eyes seem to follow her!',
      milo: 'Milo leans away — did that portrait just sigh?',
    },
  },
  {
    id: 'drafty-fireplace',
    displayName: 'Drafty fireplace',
    /** Matches the fireplace prop beside the piano nook. */
    position: { x: 1020, y: 420 },
    compatibleCategory: 'cold',
    ghostActivationRadius: 140,
    visitorReactionRadius: 125,
    visualKey: 'fireplace',
    defaultReactionCopy: 'A chilly draft whooshes from the hearth!',
    visitorReactions: {
      nora: 'Nora hugs herself — brr, where is that draft coming from?',
      milo: 'Milo rubs his arms — the fireplace just exhaled ice!',
    },
  },
] as const;

export function getLobbyPropById(id: string): LobbyPropDefinition | undefined {
  return LOBBY_PROPS.find((prop) => prop.id === id);
}

export function propReactionCopy(
  prop: LobbyPropDefinition,
  visitorId: VisitorId,
): string {
  return prop.visitorReactions?.[visitorId] ?? prop.defaultReactionCopy;
}
