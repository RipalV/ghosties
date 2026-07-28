import { describe, expect, it } from 'vitest';
import { getFearStage, getNoveltyMultiplier, resolveScare, type FearProfile } from '../src/game/fear/FearEngine';

const profile: FearProfile = {
  highFears: ['whisper'],
  mediumFears: ['cold'],
  ineffectiveFears: ['object'],
};

describe('FearEngine', () => {
  it('awards the strongest result for a fresh high fear', () => {
    const result = resolveScare(profile, { usesByCategory: {} }, 'whisper');
    expect(result.strength).toBe('high');
    expect(result.fearGained).toBe(28);
    expect(result.scoreDelta).toBe(33);
  });

  it('applies diminishing novelty for repeated scares', () => {
    expect(getNoveltyMultiplier(0)).toBe(1);
    expect(getNoveltyMultiplier(1)).toBe(0.7);
    expect(getNoveltyMultiplier(2)).toBe(0.35);
    expect(getNoveltyMultiplier(3)).toBe(0.1);
  });

  it('penalises an ineffective scare without adding fear', () => {
    const result = resolveScare(profile, { usesByCategory: {} }, 'object');
    expect(result.strength).toBe('none');
    expect(result.fearGained).toBe(0);
    expect(result.scoreDelta).toBe(-5);
  });

  it('maps fear values to the intended progression stages', () => {
    expect(getFearStage(0)).toBe('calm');
    expect(getFearStage(25)).toBe('uneasy');
    expect(getFearStage(65)).toBe('runaway');
    expect(getFearStage(100)).toBe('possessed');
  });
});
