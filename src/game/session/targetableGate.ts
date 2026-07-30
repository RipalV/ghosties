import type { HauntingPhase, VisitorPresence } from './types';

export function isVisitorTargetable(
  phase: HauntingPhase,
  presence: VisitorPresence,
): boolean {
  return phase === 'activeHaunting' && presence === 'visiting';
}

export function targetableGateStatus(
  phase: HauntingPhase,
  presence: VisitorPresence,
): string {
  if (phase === 'results') {
    return 'Visit over — tap Next visit when you are ready.';
  }
  if (phase === 'visitorDeparting' || presence === 'departing') {
    return "Nora's leaving — scares and Observe are paused.";
  }
  if (phase === 'locationReady') {
    return 'The lobby is quiet. Your ghost is home — a visitor may arrive soon…';
  }
  if (phase === 'visitorAnnounced') {
    return '🔔 Ding-dong! Nora is on her way to the lobby.';
  }
  if (phase === 'visitorEntering' || presence === 'entering') {
    return 'Nora is walking in — wait until she settles before Observe or scares.';
  }
  if (presence === 'offsite' || presence === 'departed') {
    return 'No visitor in the lobby right now.';
  }
  return '';
}
