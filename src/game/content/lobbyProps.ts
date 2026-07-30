import type { ScareCategory } from '../abilities/ScareAbility';
import { artPointToWorld, LOBBY_ART_SPOTS } from '../world/lobbyArtLayout';
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

const bellPos = artPointToWorld(LOBBY_ART_SPOTS.receptionBell.x, LOBBY_ART_SPOTS.receptionBell.y);
const portraitPos = artPointToWorld(
  LOBBY_ART_SPOTS.crookedPortrait.x,
  LOBBY_ART_SPOTS.crookedPortrait.y,
);
const fireplacePos = artPointToWorld(
  LOBBY_ART_SPOTS.draftyFireplace.x,
  LOBBY_ART_SPOTS.draftyFireplace.y,
);

/**
 * Three hauntable lobby props. Positions track the painted Crooked Moon lobby
 * art spots (reception bell / portrait / fireplace).
 *
 * Intended route pairings (see noraVisit / miloVisit POI tweaks):
 * - Nora: reception bell (Object Nudge) + crooked portrait (Whisper)
 * - Milo: drafty fireplace (Cold Puff)
 */
export const LOBBY_PROPS: readonly LobbyPropDefinition[] = [
  {
    id: 'reception-bell',
    displayName: 'Reception bell',
    position: bellPos,
    compatibleCategory: 'object',
    ghostActivationRadius: 150,
    visitorReactionRadius: 130,
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
    position: portraitPos,
    compatibleCategory: 'whisper',
    ghostActivationRadius: 140,
    visitorReactionRadius: 130,
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
    position: fireplacePos,
    compatibleCategory: 'cold',
    ghostActivationRadius: 150,
    visitorReactionRadius: 135,
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
