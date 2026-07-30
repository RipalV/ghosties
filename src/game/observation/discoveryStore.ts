import type { ClueDefinition, DiscoveryState } from './types';

export function createDiscoveryState(): DiscoveryState {
  return { discoveredClueIds: [], observationBonusGranted: false };
}

export function resetDiscoveryState(): DiscoveryState {
  return createDiscoveryState();
}

export function discoverClue(state: DiscoveryState, clueId: string): DiscoveryState {
  if (state.discoveredClueIds.includes(clueId)) return state;
  return {
    ...state,
    discoveredClueIds: [...state.discoveredClueIds, clueId],
  };
}

export function grantObservationBonus(state: DiscoveryState): DiscoveryState {
  if (state.observationBonusGranted) return state;
  return { ...state, observationBonusGranted: true };
}

export function hasUsefulClue(
  state: DiscoveryState,
  clues: readonly ClueDefinition[],
): boolean {
  return state.discoveredClueIds.some((id) => {
    const clue = clues.find((entry) => entry.id === id);
    return clue !== undefined && !clue.personalityOnly;
  });
}
