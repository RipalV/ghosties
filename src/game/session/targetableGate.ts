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
  visitorName: string,
): string {
  if (phase === 'results') {
    return 'Visit over — tap Next visit when you are ready.';
  }
  if (phase === 'visitorDeparting' || presence === 'departing') {
    return `${visitorName} is leaving — scares and Observe are paused.`;
  }
  if (phase === 'locationReady') {
    return 'The lobby is quiet. Your ghost is home — a visitor may arrive soon…';
  }
  if (phase === 'visitorAnnounced') {
    return `🔔 Ding-dong! ${visitorName} is on the way to the lobby.`;
  }
  if (phase === 'visitorEntering' || presence === 'entering') {
    return `${visitorName} is walking in — wait until they settle before Observe or scares.`;
  }
  if (presence === 'offsite' || presence === 'departed') {
    return 'No visitor in the lobby right now.';
  }
  return '';
}
