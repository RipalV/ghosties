import { describe, expect, it } from 'vitest';
import { STARTING_ABILITIES } from '../src/game/abilities/ScareAbility';
import { resolveScare } from '../src/game/fear/FearEngine';
import { NORA_CONTENT } from '../src/game/content/nora';
import {
  classifyExposureOutcome,
  scaleScareResult,
  shouldApplyScareOutcome,
} from '../src/game/scareCast/scareCastExposure';
import {
  SCARE_CAST_DURATION_MS,
  cancelScareCast,
  createScareCastSession,
  exposureRatioFromSession,
  isCastingAbility,
  isInAbilityRange,
  tickScareCast,
  tryStartScareCast,
} from '../src/game/scareCast/scareCastSession';

const whisper = STARTING_ABILITIES[0];
const cold = STARTING_ABILITIES[1];
const { fearProfile } = NORA_CONTENT;

describe('scare cast session', () => {
  it('starts when affordable even out of range', () => {
    const idle = createScareCastSession();
    expect(tryStartScareCast(idle, whisper.id, true).started).toBe(true);
    expect(tryStartScareCast(idle, whisper.id, false).started).toBe(false);
    expect(tryStartScareCast(idle, whisper.id, true).session.exposureMs).toBe(0);
  });

  it('evaluates ability range from world distance only', () => {
    expect(isInAbilityRange(whisper.range, whisper.range)).toBe(true);
    expect(isInAbilityRange(whisper.range + 0.01, whisper.range)).toBe(false);
  });

  it('advances progress while in range and accumulates exposure', () => {
    const started = tryStartScareCast(createScareCastSession(), whisper.id, true);
    const tick = tickScareCast(started.session, 500, SCARE_CAST_DURATION_MS, true);
    expect(tick.session.status).toBe('casting');
    expect(tick.session.progress).toBeGreaterThan(0);
    expect(tick.session.exposureMs).toBe(100);
    expect(tick.completedAbilityId).toBeNull();
  });

  it('advances progress out of range without accumulating exposure', () => {
    let session = tryStartScareCast(createScareCastSession(), whisper.id, true).session;
    for (let i = 0; i < 4; i += 1) {
      session = tickScareCast(session, 100, SCARE_CAST_DURATION_MS, true).session;
    }
    const outOfRange = tickScareCast(session, 400, SCARE_CAST_DURATION_MS, false);
    expect(outOfRange.session.status).toBe('casting');
    expect(outOfRange.session.progress).toBeGreaterThan(session.progress);
    expect(outOfRange.session.exposureMs).toBe(400);
    expect(outOfRange.completedAbilityId).toBeNull();
  });

  it('caps a single tick so a hitch cannot finish instantly', () => {
    const started = tryStartScareCast(createScareCastSession(), whisper.id, true);
    const tick = tickScareCast(started.session, 5000, SCARE_CAST_DURATION_MS, true);
    expect(tick.session.progress).toBeCloseTo(100 / SCARE_CAST_DURATION_MS, 5);
    expect(tick.completedAbilityId).toBeNull();
  });

  it('signals completion with full exposure when in range the whole cast', () => {
    let session = tryStartScareCast(createScareCastSession(), whisper.id, true).session;
    let exposureRatio: number | null = null;
    for (let i = 0; i < 40; i += 1) {
      const tick = tickScareCast(session, 100, SCARE_CAST_DURATION_MS, true);
      session = tick.session;
      if (tick.exposureRatio !== null) {
        exposureRatio = tick.exposureRatio;
        break;
      }
    }
    expect(exposureRatio).toBe(1);
    expect(session.status).toBe('idle');
  });

  it('signals completion with zero exposure when never in range', () => {
    let session = tryStartScareCast(createScareCastSession(), whisper.id, true).session;
    let exposureRatio: number | null = null;
    for (let i = 0; i < 40; i += 1) {
      const tick = tickScareCast(session, 100, SCARE_CAST_DURATION_MS, false);
      session = tick.session;
      if (tick.exposureRatio !== null) {
        exposureRatio = tick.exposureRatio;
        break;
      }
    }
    expect(exposureRatio).toBe(0);
  });

  it('signals partial exposure when only partly in range', () => {
    let session = tryStartScareCast(createScareCastSession(), whisper.id, true).session;
    session = tickScareCast(session, 750, SCARE_CAST_DURATION_MS, true).session;
    let exposureRatio: number | null = null;
    for (let i = 0; i < 40; i += 1) {
      const tick = tickScareCast(session, 100, SCARE_CAST_DURATION_MS, false);
      session = tick.session;
      if (tick.exposureRatio !== null) {
        exposureRatio = tick.exposureRatio;
        break;
      }
    }
    expect(exposureRatio).not.toBeNull();
    expect(exposureRatio!).toBeGreaterThan(0);
    expect(exposureRatio!).toBeLessThan(1);
  });

  it('blocks restarting the same scare mid-cast', () => {
    const casting = tryStartScareCast(createScareCastSession(), whisper.id, true).session;
    const blocked = tryStartScareCast(casting, whisper.id, true);
    expect(blocked.started).toBe(false);
    expect(blocked.sameAbilityBlocked).toBe(true);
    expect(blocked.session).toBe(casting);
  });

  it('switches to a different scare by cancelling the previous cast', () => {
    const whisperCast = tryStartScareCast(createScareCastSession(), whisper.id, true);
    const switched = tryStartScareCast(whisperCast.session, cold.id, true);
    expect(switched.started).toBe(true);
    expect(switched.switchedFromAbilityId).toBe(whisper.id);
    expect(switched.session.abilityId).toBe(cold.id);
    expect(switched.session.progress).toBe(0);
    expect(switched.session.exposureMs).toBe(0);
  });

  it('uses the shared cast duration constant for all starting abilities', () => {
    expect(SCARE_CAST_DURATION_MS).toBeGreaterThan(0);
    for (const ability of STARTING_ABILITIES) {
      const started = tryStartScareCast(createScareCastSession(), ability.id, true);
      let session = started.session;
      let completed = false;
      for (let i = 0; i < 40; i += 1) {
        const tick = tickScareCast(session, 100, SCARE_CAST_DURATION_MS, true);
        session = tick.session;
        if (tick.completedAbilityId === ability.id) {
          completed = true;
          break;
        }
      }
      expect(completed).toBe(true);
    }
  });

  it('cancel helper clears casting state', () => {
    const casting = tryStartScareCast(createScareCastSession(), whisper.id, true).session;
    expect(cancelScareCast(casting).status).toBe('idle');
    expect(isCastingAbility(casting, whisper.id)).toBe(true);
    expect(isCastingAbility(cancelScareCast(casting), whisper.id)).toBe(false);
  });

  it('computes exposure ratio from session', () => {
    const session = {
      status: 'casting' as const,
      abilityId: whisper.id,
      progress: 0.5,
      exposureMs: 750,
    };
    expect(exposureRatioFromSession(session, SCARE_CAST_DURATION_MS)).toBe(0.5);
  });
});

describe('scare cast exposure outcomes', () => {
  it('classifies miss, partial, and full exposure', () => {
    expect(classifyExposureOutcome(0)).toBe('miss');
    expect(classifyExposureOutcome(0.25)).toBe('partial');
    expect(classifyExposureOutcome(1)).toBe('full');
  });

  it('zero exposure zeroes fear and score', () => {
    const raw = resolveScare(fearProfile, { usesByCategory: {} }, 'whisper');
    const scaled = scaleScareResult(raw, 0);
    expect(scaled.fearGained).toBe(0);
    expect(scaled.scoreDelta).toBe(0);
  });

  it('partial exposure scales a high fear scare', () => {
    const raw = resolveScare(fearProfile, { usesByCategory: {} }, 'whisper');
    const scaled = scaleScareResult(raw, 0.5);
    expect(scaled.fearGained).toBe(Math.round(raw.fearGained * 0.5));
    expect(scaled.scoreDelta).toBe(Math.round(raw.scoreDelta * 0.5));
  });

  it('full exposure keeps resolveScare values', () => {
    const raw = resolveScare(fearProfile, { usesByCategory: {} }, 'whisper');
    expect(scaleScareResult(raw, 1)).toEqual(raw);
  });

  it('skips outcome application when Nora had zero exposure', () => {
    expect(shouldApplyScareOutcome(0)).toBe(false);
    expect(shouldApplyScareOutcome(0.01)).toBe(true);
  });
});
