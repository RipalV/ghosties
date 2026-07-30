import type { PropVisitState } from './types';

export function createPropVisitState(): PropVisitState {
  return {
    awardedPropIds: new Set(),
    linkedPropId: null,
  };
}

export function resetPropVisitState(): PropVisitState {
  return createPropVisitState();
}

export function linkPropForCast(
  state: PropVisitState,
  propId: string,
): PropVisitState {
  return { ...state, linkedPropId: propId };
}

export function clearLinkedProp(state: PropVisitState): PropVisitState {
  if (state.linkedPropId === null) return state;
  return { ...state, linkedPropId: null };
}

export function markPropAwarded(
  state: PropVisitState,
  propId: string,
): PropVisitState {
  if (state.awardedPropIds.has(propId)) return state;
  return {
    ...state,
    awardedPropIds: new Set([...state.awardedPropIds, propId]),
  };
}

export function isPropAwarded(state: PropVisitState, propId: string): boolean {
  return state.awardedPropIds.has(propId);
}
