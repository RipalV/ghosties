import type { FearStage, ScareHistory } from '../fear/FearEngine';
import { createDiscoveryState, resetDiscoveryState } from '../observation/discoveryStore';
import { createObservationSession } from '../observation/observationSession';
import type { DiscoveryState, ObservationSession } from '../observation/types';
import {
  createScareCastSession,
  type ScareCastSession,
} from '../scareCast/scareCastSession';
import {
  createPropVisitState,
  resetPropVisitState,
  type PropVisitState,
} from '../props';

export const STARTING_ENERGY = 100;
export const STARTING_SCORE = 0;

export interface SessionRuntimeState {
  score: number;
  energy: number;
  discoveryState: DiscoveryState;
  observationSession: ObservationSession;
  scareCastSession: ScareCastSession;
  propVisitState: PropVisitState;
  observationBonusTotal: number;
  ineffectiveScareCount: number;
  repeatedScareCount: number;
}

export interface NpcSessionState {
  fear: number;
  stage: FearStage;
  scareHistory: ScareHistory;
}

export function createSessionRuntimeState(): SessionRuntimeState {
  return {
    score: STARTING_SCORE,
    energy: STARTING_ENERGY,
    discoveryState: createDiscoveryState(),
    observationSession: createObservationSession(),
    scareCastSession: createScareCastSession(),
    propVisitState: createPropVisitState(),
    observationBonusTotal: 0,
    ineffectiveScareCount: 0,
    repeatedScareCount: 0,
  };
}

export function resetSessionForNewVisit(): {
  runtime: SessionRuntimeState;
  npc: NpcSessionState;
} {
  return {
    runtime: {
      score: STARTING_SCORE,
      energy: STARTING_ENERGY,
      discoveryState: resetDiscoveryState(),
      observationSession: createObservationSession(),
      scareCastSession: createScareCastSession(),
      propVisitState: resetPropVisitState(),
      observationBonusTotal: 0,
      ineffectiveScareCount: 0,
      repeatedScareCount: 0,
    },
    npc: {
      fear: 0,
      stage: 'calm',
      scareHistory: { usesByCategory: {} },
    },
  };
}
