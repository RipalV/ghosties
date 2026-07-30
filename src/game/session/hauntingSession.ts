import type { HauntingSession, VisitOutcome } from './types';

export type { HauntingSession, VisitOutcome };

export function createHauntingSession(): HauntingSession {
  return {
    phase: 'locationReady',
    visitOutcome: null,
    locationReadyElapsedMs: 0,
    announcedElapsedMs: 0,
  };
}

export function tickLocationReady(session: HauntingSession, deltaMs: number): HauntingSession {
  if (session.phase !== 'locationReady') return session;
  const locationReadyElapsedMs = session.locationReadyElapsedMs + deltaMs;
  return { ...session, locationReadyElapsedMs };
}

export function shouldAnnounceVisitor(
  session: HauntingSession,
  announceAfterMs: number,
): boolean {
  return session.phase === 'locationReady' && session.locationReadyElapsedMs >= announceAfterMs;
}

export function announceVisitor(session: HauntingSession): HauntingSession {
  if (session.phase !== 'locationReady') return session;
  return { ...session, phase: 'visitorAnnounced', announcedElapsedMs: 0 };
}

export function tickVisitorAnnounced(
  session: HauntingSession,
  deltaMs: number,
  enterAfterMs: number,
): HauntingSession {
  if (session.phase !== 'visitorAnnounced') return session;
  const announcedElapsedMs = session.announcedElapsedMs + deltaMs;
  if (announcedElapsedMs >= enterAfterMs) {
    return { ...session, phase: 'visitorEntering', announcedElapsedMs };
  }
  return { ...session, announcedElapsedMs };
}

export function beginActiveHaunting(session: HauntingSession): HauntingSession {
  if (session.phase !== 'visitorEntering') return session;
  return { ...session, phase: 'activeHaunting' };
}

export function beginVisitorDeparting(
  session: HauntingSession,
  outcome: VisitOutcome,
): HauntingSession {
  if (session.phase !== 'activeHaunting') return session;
  return { ...session, phase: 'visitorDeparting', visitOutcome: outcome };
}

export function showResults(session: HauntingSession): HauntingSession {
  if (session.phase !== 'visitorDeparting') return session;
  return { ...session, phase: 'results' };
}

export function prepareNextVisit(): HauntingSession {
  return createHauntingSession();
}
