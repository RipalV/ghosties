import type { ScareCategory } from '../abilities/ScareAbility';
import {
  HOTEL_TRICK_AWARD_MESSAGE,
  LOBBY_PROP_COMBO_BONUS,
  LOBBY_PROPS,
  type LobbyPropDefinition,
  propReactionCopy,
} from '../content/lobbyProps';
import type { VisitorId } from '../content/visitorRegistry';
import { shouldApplyScareOutcome } from '../scareCast/scareCastExposure';
import { isWithinRadius, worldDistance } from './propDistance';
import {
  clearLinkedProp,
  isPropAwarded,
  linkPropForCast,
  markPropAwarded,
} from './propVisitState';
import type { PropComboEvaluation, PropVisitState, WorldPoint } from './types';

export { LOBBY_PROPS };

export function selectPropForCast(
  props: readonly LobbyPropDefinition[],
  ghost: WorldPoint,
  category: ScareCategory,
  visitorTargetable: boolean,
): LobbyPropDefinition | null {
  if (!visitorTargetable) return null;

  let best: LobbyPropDefinition | null = null;
  let bestDistance = Infinity;

  for (const prop of props) {
    if (prop.compatibleCategory !== category) continue;
    const distance = worldDistance(ghost, prop.position);
    if (distance > prop.ghostActivationRadius) continue;
    if (distance < bestDistance) {
      best = prop;
      bestDistance = distance;
    }
  }

  return best;
}

export function beginPropCastLink(
  state: PropVisitState,
  props: readonly LobbyPropDefinition[],
  ghost: WorldPoint,
  category: ScareCategory,
  visitorTargetable: boolean,
): PropVisitState {
  const selected = selectPropForCast(props, ghost, category, visitorTargetable);
  if (!selected) return clearLinkedProp(state);
  return linkPropForCast(state, selected.id);
}

export function evaluatePropCombo(
  state: PropVisitState,
  props: readonly LobbyPropDefinition[],
  linkedPropId: string | null,
  category: ScareCategory,
  exposureRatio: number,
  visitor: WorldPoint,
  visitorId: VisitorId,
): { evaluation: PropComboEvaluation; state: PropVisitState } {
  const noAward: PropComboEvaluation = {
    scoreBonus: 0,
    propId: null,
    reactionCopy: null,
    awarded: false,
  };

  if (!linkedPropId || !shouldApplyScareOutcome(exposureRatio)) {
    return { evaluation: noAward, state: clearLinkedProp(state) };
  }

  const prop = props.find((entry) => entry.id === linkedPropId);
  if (!prop || prop.compatibleCategory !== category) {
    return { evaluation: noAward, state: clearLinkedProp(state) };
  }

  if (isPropAwarded(state, prop.id)) {
    return { evaluation: noAward, state: clearLinkedProp(state) };
  }

  if (!isWithinRadius(visitor, prop.position, prop.visitorReactionRadius)) {
    return { evaluation: noAward, state: clearLinkedProp(state) };
  }

  const nextState = markPropAwarded(clearLinkedProp(state), prop.id);
  return {
    evaluation: {
      scoreBonus: LOBBY_PROP_COMBO_BONUS,
      propId: prop.id,
      reactionCopy: propReactionCopy(prop, visitorId),
      awarded: true,
    },
    state: nextState,
  };
}

export function findNearbyUnusedProp(
  props: readonly LobbyPropDefinition[],
  state: PropVisitState,
  ghost: WorldPoint,
  visitorTargetable: boolean,
): LobbyPropDefinition | null {
  if (!visitorTargetable) return null;

  let best: LobbyPropDefinition | null = null;
  let bestDistance = Infinity;

  for (const prop of props) {
    if (isPropAwarded(state, prop.id)) continue;
    const distance = worldDistance(ghost, prop.position);
    if (distance > prop.ghostActivationRadius) continue;
    if (distance < bestDistance) {
      best = prop;
      bestDistance = distance;
    }
  }

  return best;
}

export function hotelTrickStatusMessage(
  evaluation: PropComboEvaluation,
): string | null {
  if (!evaluation.awarded || evaluation.scoreBonus <= 0) return null;
  return `${HOTEL_TRICK_AWARD_MESSAGE} +${evaluation.scoreBonus} haunt points`;
}
