import type { HauntingPhase, VisitorPresence, VisitorVisitConfig } from './types';

export type RouteLeg = 'spawn' | 'entrance' | 'poi' | 'exit';

export interface VisitorRouteState {
  readonly presence: VisitorPresence;
  readonly leg: RouteLeg;
  readonly poiIndex: number;
  readonly pauseRemainingMs: number;
  readonly routeComplete: boolean;
}

export function createVisitorRouteState(): VisitorRouteState {
  return {
    presence: 'offsite',
    leg: 'spawn',
    poiIndex: 0,
    pauseRemainingMs: 0,
    routeComplete: false,
  };
}

export function resetVisitorRouteState(): VisitorRouteState {
  return createVisitorRouteState();
}

function worldDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.hypot(dx, dy);
}

export interface RouteTickInput {
  readonly state: VisitorRouteState;
  readonly config: VisitorVisitConfig;
  readonly deltaMs: number;
  readonly npcX: number;
  readonly npcY: number;
  readonly phase: HauntingPhase;
}

export interface RouteTickResult {
  readonly state: VisitorRouteState;
  readonly targetX: number;
  readonly targetY: number;
  readonly shouldMove: boolean;
  readonly visible: boolean;
  readonly enteredVisiting: boolean;
  readonly reachedExit: boolean;
}

export function tickVisitorRoute(input: RouteTickInput): RouteTickResult {
  const { config, deltaMs, npcX, npcY, phase } = input;
  let state = input.state;

  if (state.pauseRemainingMs > 0) {
    state = {
      ...state,
      pauseRemainingMs: Math.max(0, state.pauseRemainingMs - deltaMs),
    };
    return {
      state,
      targetX: npcX,
      targetY: npcY,
      shouldMove: false,
      visible: state.presence !== 'offsite',
      enteredVisiting: false,
      reachedExit: false,
    };
  }

  if (phase === 'locationReady' || phase === 'visitorAnnounced') {
    return {
      state: {
        ...state,
        presence: 'offsite',
        leg: 'spawn',
        poiIndex: 0,
        routeComplete: false,
      },
      targetX: config.spawn.x,
      targetY: config.spawn.y,
      shouldMove: false,
      visible: false,
      enteredVisiting: false,
      reachedExit: false,
    };
  }

  if (phase === 'visitorEntering') {
    const threshold = config.entranceArrivalThreshold;
    const dist = worldDistance(npcX, npcY, config.entrance.x, config.entrance.y);
    if (dist < threshold) {
      return {
        state: {
          ...state,
          presence: 'visiting',
          leg: 'poi',
          poiIndex: 0,
          pauseRemainingMs: 0,
        },
        targetX: config.entrance.x,
        targetY: config.entrance.y,
        shouldMove: false,
        visible: true,
        enteredVisiting: true,
        reachedExit: false,
      };
    }
    return {
      state: { ...state, presence: 'entering', leg: 'entrance' },
      targetX: config.entrance.x,
      targetY: config.entrance.y,
      shouldMove: true,
      visible: true,
      enteredVisiting: false,
      reachedExit: false,
    };
  }

  if (phase === 'visitorDeparting') {
    const threshold = config.exitArrivalThreshold;
    const dist = worldDistance(npcX, npcY, config.exit.x, config.exit.y);
    if (dist < threshold) {
      return {
        state: { ...state, presence: 'departed', leg: 'exit' },
        targetX: config.exit.x,
        targetY: config.exit.y,
        shouldMove: false,
        visible: false,
        enteredVisiting: false,
        reachedExit: true,
      };
    }
    return {
      state: { ...state, presence: 'departing', leg: 'exit' },
      targetX: config.exit.x,
      targetY: config.exit.y,
      shouldMove: true,
      visible: true,
      enteredVisiting: false,
      reachedExit: false,
    };
  }

  if (phase === 'results') {
    return {
      state: { ...state, presence: 'departed', leg: 'exit' },
      targetX: config.exit.x,
      targetY: config.exit.y,
      shouldMove: false,
      visible: false,
      enteredVisiting: false,
      reachedExit: false,
    };
  }

  // activeHaunting — continue POI progression even during scare casts
  const pois = config.pointsOfInterest;
  if (state.poiIndex >= pois.length) {
    return {
      state: { ...state, presence: 'visiting', leg: 'poi', routeComplete: true },
      targetX: npcX,
      targetY: npcY,
      shouldMove: false,
      visible: true,
      enteredVisiting: false,
      reachedExit: false,
    };
  }

  const poi = pois[state.poiIndex];
  const threshold = config.entranceArrivalThreshold;
  const dist = worldDistance(npcX, npcY, poi.x, poi.y);
  if (dist < threshold) {
    const nextIndex = state.poiIndex + 1;
    const finishedRoute = nextIndex >= pois.length;
    return {
      state: {
        ...state,
        presence: 'visiting',
        leg: 'poi',
        poiIndex: nextIndex,
        // No dwell at the final stop — leave as soon as the tour completes.
        pauseRemainingMs: finishedRoute ? 0 : poi.pauseMs,
        routeComplete: finishedRoute,
      },
      targetX: poi.x,
      targetY: poi.y,
      shouldMove: false,
      visible: true,
      enteredVisiting: false,
      reachedExit: false,
    };
  }

  return {
    state: { ...state, presence: 'visiting', leg: 'poi' },
    targetX: poi.x,
    targetY: poi.y,
    shouldMove: true,
    visible: true,
    enteredVisiting: false,
    reachedExit: false,
  };
}
