import type { ScareCategory } from '../abilities/ScareAbility';
import type { FearProfile } from '../fear/FearEngine';

export type ClueCategory = 'dialogue' | 'body_language' | 'nearby_object' | 'environmental_reaction';

export interface ClueDefinition {
  readonly id: string;
  readonly category: ClueCategory;
  readonly text: string;
  /** Progress threshold in 0–1 when this clue may unlock. */
  readonly revealAtProgress: number;
  readonly personalityOnly?: boolean;
}

export interface ObservationTuning {
  readonly range: number;
  readonly durationMs: number;
}

export interface NpcContent {
  readonly id: string;
  readonly displayName: string;
  readonly primaryFear: ScareCategory;
  readonly fearProfile: FearProfile;
  readonly clues: readonly ClueDefinition[];
  readonly observation: ObservationTuning;
}

export type ObservationStatus = 'idle' | 'observing';

export interface ObservationSession {
  readonly status: ObservationStatus;
  readonly progress: number;
}

export interface DiscoveryState {
  readonly discoveredClueIds: readonly string[];
  readonly observationBonusGranted: boolean;
}
