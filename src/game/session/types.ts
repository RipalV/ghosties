import type { FearStage } from '../fear/FearEngine';

export type HauntingPhase =
  | 'locationReady'
  | 'visitorAnnounced'
  | 'visitorEntering'
  | 'activeHaunting'
  | 'visitorDeparting'
  | 'results';

export type VisitOutcome = 'haunted' | 'unimpressed';

export type VisitorPresence = 'offsite' | 'entering' | 'visiting' | 'departing' | 'departed';

export interface HauntingSession {
  readonly phase: HauntingPhase;
  readonly visitOutcome: VisitOutcome | null;
  readonly locationReadyElapsedMs: number;
  readonly announcedElapsedMs: number;
}

export interface VisitWaypoint {
  readonly x: number;
  readonly y: number;
  readonly pauseMs: number;
}

export interface VisitorVisitConfig {
  readonly visitorName: string;
  readonly spawn: { readonly x: number; readonly y: number };
  readonly entrance: { readonly x: number; readonly y: number };
  readonly pointsOfInterest: readonly VisitWaypoint[];
  readonly exit: { readonly x: number; readonly y: number };
  readonly successMinFearStage: FearStage;
  readonly locationReadyAnnounceMs: number;
  readonly announceEnterDelayMs: number;
  readonly entranceArrivalThreshold: number;
  readonly exitArrivalThreshold: number;
}
