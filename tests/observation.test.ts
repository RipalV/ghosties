import { describe, expect, it } from 'vitest';
import { NORA_CONTENT } from '../src/game/content/nora';
import {
  createDiscoveryState,
  discoverClue,
  grantObservationBonus,
  hasUsefulClue,
  resetDiscoveryState,
} from '../src/game/observation/discoveryStore';
import {
  OBSERVATION_BONUS_SCORE,
  applyObservationBonus,
  isObservationBonusEligible,
} from '../src/game/observation/observationBonus';
import {
  canStartObservation,
  cancelObservation,
  createObservationSession,
  findNextUndiscoveredClue,
  isInObservationRange,
  startObservation,
  tickObservation,
} from '../src/game/observation/observationSession';

const { clues, observation, primaryFear } = NORA_CONTENT;

function advanceUntilReveal(
  session = startObservation(createObservationSession()),
  discovery = createDiscoveryState(),
) {
  let current = session;
  for (let i = 0; i < 120; i += 1) {
    const tick = tickObservation(current, 100, observation.durationMs, true, clues, discovery);
    current = tick.session;
    if (tick.newlyRevealedClueIds.length > 0) {
      return { session: current, discovery, revealed: tick.newlyRevealedClueIds };
    }
    if (current.status === 'idle') break;
  }
  return { session: current, discovery, revealed: [] as string[] };
}

describe('observation session', () => {
  it('starts only when idle and in range', () => {
    const session = createObservationSession();
    expect(canStartObservation(session, true)).toBe(true);
    expect(canStartObservation(session, false)).toBe(false);
    expect(canStartObservation(startObservation(session), true)).toBe(false);
  });

  it('rejects observation start when out of range', () => {
    expect(isInObservationRange(observation.range + 1, observation.range)).toBe(false);
    expect(canStartObservation(createObservationSession(), false)).toBe(false);
  });

  it('evaluates range from world distance only (zoom-independent)', () => {
    const worldDistance = observation.range;
    expect(isInObservationRange(worldDistance, observation.range)).toBe(true);
    expect(isInObservationRange(worldDistance + 0.01, observation.range)).toBe(false);
  });

  it('advances progress while in range', () => {
    const session = startObservation(createObservationSession());
    const result = tickObservation(session, 500, observation.durationMs, true, clues, createDiscoveryState());
    expect(result.session.status).toBe('observing');
    expect(result.session.progress).toBeGreaterThan(0);
  });

  it('caps a single tick so a hitch cannot finish the meter instantly', () => {
    const session = startObservation(createObservationSession());
    const result = tickObservation(session, 5000, observation.durationMs, true, clues, createDiscoveryState());
    expect(result.session.status).toBe('observing');
    expect(result.session.progress).toBeCloseTo(100 / observation.durationMs, 5);
  });

  it('cancels in-progress observation when leaving range', () => {
    let session = startObservation(createObservationSession());
    session = tickObservation(session, 500, observation.durationMs, true, clues, createDiscoveryState()).session;
    const cancelled = tickObservation(session, 16, observation.durationMs, false, clues, createDiscoveryState());
    expect(cancelled.session.status).toBe('idle');
    expect(cancelled.session.progress).toBe(0);
  });

  it('clears in-progress progress via cancelObservation', () => {
    const session = cancelObservation(startObservation(createObservationSession()));
    expect(session.status).toBe('idle');
    expect(session.progress).toBe(0);
  });
});

describe('progressive clue discovery', () => {
  it('reveals only one clue per observation pass', () => {
    const first = advanceUntilReveal();
    expect(first.revealed).toEqual(['nora-whisper-mutter']);
    expect(first.session.status).toBe('idle');

    const discovery = discoverClue(createDiscoveryState(), 'nora-whisper-mutter');
    const second = advanceUntilReveal(startObservation(createObservationSession()), discovery);
    expect(second.revealed).toEqual(['nora-organised-hum']);
    expect(second.revealed).toHaveLength(1);
  });

  it('keeps discovered clues after observation is cancelled', () => {
    let discovery = createDiscoveryState();
    discovery = discoverClue(discovery, 'nora-whisper-mutter');
    const session = cancelObservation(startObservation(createObservationSession()));
    expect(session.status).toBe('idle');
    expect(discovery.discoveredClueIds).toContain('nora-whisper-mutter');
    expect(findNextUndiscoveredClue(clues, discovery)?.id).toBe('nora-organised-hum');
  });
});

describe('discovery store and observation bonus', () => {
  it('tracks useful clues separately from personality-only clues', () => {
    let discovery = createDiscoveryState();
    expect(hasUsefulClue(discovery, clues)).toBe(false);

    discovery = discoverClue(discovery, 'nora-organised-hum');
    expect(hasUsefulClue(discovery, clues)).toBe(false);

    discovery = discoverClue(discovery, 'nora-whisper-mutter');
    expect(hasUsefulClue(discovery, clues)).toBe(true);
  });

  it('grants a matching scare bonus once per session after a useful clue', () => {
    let discovery = discoverClue(createDiscoveryState(), 'nora-whisper-mutter');
    expect(isObservationBonusEligible('whisper', primaryFear, discovery, clues)).toBe(true);

    const first = applyObservationBonus(discovery, 'whisper', primaryFear, clues);
    expect(first.bonus).toBe(OBSERVATION_BONUS_SCORE);
    discovery = first.discovery;

    const second = applyObservationBonus(discovery, 'whisper', primaryFear, clues);
    expect(second.bonus).toBe(0);
  });

  it('does not grant bonus for mismatched or ineffective scares', () => {
    const discovery = discoverClue(createDiscoveryState(), 'nora-whisper-mutter');
    expect(applyObservationBonus(discovery, 'cold', primaryFear, clues).bonus).toBe(0);
    expect(applyObservationBonus(discovery, 'object', primaryFear, clues).bonus).toBe(0);
  });

  it('resets discovery and bonus eligibility for a new session', () => {
    let discovery = grantObservationBonus(discoverClue(createDiscoveryState(), 'nora-whisper-mutter'));
    discovery = resetDiscoveryState();
    expect(discovery.discoveredClueIds).toEqual([]);
    expect(discovery.observationBonusGranted).toBe(false);
    expect(isObservationBonusEligible('whisper', primaryFear, discovery, clues)).toBe(false);
  });

  it('prevents duplicate clue discovery in one session', () => {
    let discovery = discoverClue(createDiscoveryState(), 'nora-whisper-mutter');
    discovery = discoverClue(discovery, 'nora-whisper-mutter');
    expect(discovery.discoveredClueIds).toEqual(['nora-whisper-mutter']);
  });
});

describe('NORA_CONTENT authored slice', () => {
  it('loads fear profile, clues, and observation tuning from data', () => {
    expect(NORA_CONTENT.fearProfile.highFears).toContain('whisper');
    expect(NORA_CONTENT.clues.length).toBeGreaterThanOrEqual(3);
    expect(NORA_CONTENT.observation.range).toBeGreaterThan(0);
    expect(NORA_CONTENT.observation.durationMs).toBeGreaterThan(0);
  });

  it('includes useful clues from at least two categories plus one personality detail', () => {
    const useful = NORA_CONTENT.clues.filter((clue) => !clue.personalityOnly);
    const categories = new Set(useful.map((clue) => clue.category));
    const personalityCount = NORA_CONTENT.clues.filter((clue) => clue.personalityOnly).length;

    expect(useful.length).toBeGreaterThanOrEqual(3);
    expect(categories.size).toBeGreaterThanOrEqual(2);
    expect(personalityCount).toBeGreaterThanOrEqual(1);
  });

  it('does not label the primary fear directly in clue text', () => {
    for (const clue of NORA_CONTENT.clues) {
      expect(clue.text.toLowerCase()).not.toMatch(/\bwhisper\b/);
      expect(clue.text.toLowerCase()).not.toContain('primary fear');
    }
  });

  it('reveals clues in authored order across multiple observe passes', () => {
    let discovery = createDiscoveryState();
    const expectedOrder = NORA_CONTENT.clues.map((clue) => clue.id);

    for (const expectedId of expectedOrder) {
      const { revealed } = advanceUntilReveal(startObservation(createObservationSession()), discovery);
      expect(revealed).toEqual([expectedId]);
      discovery = discoverClue(discovery, expectedId);
    }

    expect(findNextUndiscoveredClue(NORA_CONTENT.clues, discovery)).toBeNull();
  });
});
