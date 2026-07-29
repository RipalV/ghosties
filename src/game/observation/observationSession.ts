import type { ClueDefinition, DiscoveryState, ObservationSession } from './types';

export function createObservationSession(): ObservationSession {
  return { status: 'idle', progress: 0 };
}

export function isInObservationRange(distance: number, range: number): boolean {
  return distance <= range;
}

export function canStartObservation(session: ObservationSession, inRange: boolean): boolean {
  return session.status === 'idle' && inRange;
}

export function startObservation(session: ObservationSession): ObservationSession {
  if (session.status !== 'idle') return session;
  return { status: 'observing', progress: 0 };
}

export interface ObservationTickResult {
  readonly session: ObservationSession;
  readonly newlyRevealedClueIds: readonly string[];
}

/**
 * Advances one observation pass. At most one clue unlocks per pass: the next
 * undiscovered clue in authored order, when progress reaches its threshold.
 * The pass then ends so the player can read that clue before observing again.
 */
export function tickObservation(
  session: ObservationSession,
  deltaMs: number,
  durationMs: number,
  inRange: boolean,
  clues: readonly ClueDefinition[],
  discovery: DiscoveryState,
): ObservationTickResult {
  if (session.status !== 'observing') {
    return { session, newlyRevealedClueIds: [] };
  }

  if (!inRange) {
    return { session: cancelObservation(session), newlyRevealedClueIds: [] };
  }

  // Cap a single tick so a long frame hitch cannot finish the meter instantly.
  const step = Math.min(Math.max(0, deltaMs), 100);
  const progress = Math.min(1, session.progress + step / durationMs);
  const nextClue = findNextUndiscoveredClue(clues, discovery);

  if (nextClue && progress >= nextClue.revealAtProgress) {
    return {
      session: { status: 'idle', progress: 0 },
      newlyRevealedClueIds: [nextClue.id],
    };
  }

  if (progress >= 1) {
    return { session: { status: 'idle', progress: 0 }, newlyRevealedClueIds: [] };
  }

  return {
    session: { status: 'observing', progress },
    newlyRevealedClueIds: [],
  };
}

export function cancelObservation(session: ObservationSession): ObservationSession {
  if (session.status !== 'observing') return session;
  return { status: 'idle', progress: 0 };
}

export function findNextUndiscoveredClue(
  clues: readonly ClueDefinition[],
  discovery: DiscoveryState,
): ClueDefinition | null {
  // Authored array order is the reveal sequence; each pass only considers the next one.
  return clues.find((clue) => !discovery.discoveredClueIds.includes(clue.id)) ?? null;
}
