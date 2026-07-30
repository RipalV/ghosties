import { describe, expect, it } from 'vitest';
import { MILO_CONTENT } from '../src/game/content/milo';
import { MILO_VISIT } from '../src/game/content/miloVisit';
import { NORA_VISIT } from '../src/game/content/noraVisit';
import {
  getVisitorDefinition,
  VISITOR_REGISTRY,
} from '../src/game/content/visitorRegistry';
import { resetDiscoveryState } from '../src/game/observation/discoveryStore';
import { discoverClue } from '../src/game/observation/discoveryStore';
import { createDiscoveryState } from '../src/game/observation/discoveryStore';
import { buildVisitResults } from '../src/game/session/visitResults';
import {
  advanceVisitIndex,
  getVisitorIdForVisitIndex,
  initialVisitIndex,
  VISITOR_SEQUENCE,
} from '../src/game/session/visitorRotation';
import { shouldDepartOnSuccess } from '../src/game/session/visitSuccess';

describe('visitor registry', () => {
  it('returns Nora and Milo with distinct primary fears', () => {
    const nora = getVisitorDefinition('nora');
    const milo = getVisitorDefinition('milo');
    expect(nora?.content.displayName).toBe('Nora');
    expect(milo?.content.displayName).toBe('Milo');
    expect(nora?.content.primaryFear).toBe('whisper');
    expect(milo?.content.primaryFear).toBe('object');
    expect(nora?.content.primaryFear).not.toBe(milo?.content.primaryFear);
  });

  it('rejects unknown visitor ids', () => {
    expect(getVisitorDefinition('unknown')).toBeUndefined();
  });

  it('registers both visitors with visit routes', () => {
    expect(VISITOR_REGISTRY.nora.visit.pointsOfInterest.length).toBeGreaterThanOrEqual(3);
    expect(VISITOR_REGISTRY.milo.visit.pointsOfInterest.length).toBeGreaterThanOrEqual(3);
  });
});

describe('deterministic visitor rotation', () => {
  it('starts with Nora', () => {
    expect(getVisitorIdForVisitIndex(initialVisitIndex())).toBe('nora');
  });

  it('alternates Nora → Milo → Nora', () => {
    expect(VISITOR_SEQUENCE).toEqual(['nora', 'milo']);
    expect(getVisitorIdForVisitIndex(0)).toBe('nora');
    expect(getVisitorIdForVisitIndex(1)).toBe('milo');
    expect(getVisitorIdForVisitIndex(2)).toBe('nora');
    expect(getVisitorIdForVisitIndex(3)).toBe('milo');
  });

  it('advances visit index on Next visit', () => {
    let index = initialVisitIndex();
    expect(getVisitorIdForVisitIndex(index)).toBe('nora');
    index = advanceVisitIndex(index);
    expect(getVisitorIdForVisitIndex(index)).toBe('milo');
    index = advanceVisitIndex(index);
    expect(getVisitorIdForVisitIndex(index)).toBe('nora');
  });
});

describe('visitor-specific success and results', () => {
  it('uses Milo visit success config', () => {
    expect(shouldDepartOnSuccess('possessed', MILO_VISIT.successMinFearStage)).toBe(true);
  });

  it('names the active visitor in results', () => {
    const miloResults = buildVisitResults({
      visitorName: MILO_VISIT.visitorName,
      outcome: 'unimpressed',
      finalFearStage: 'curious',
      finalFear: 12,
      score: 5,
      observationBonusTotal: 0,
      ineffectiveScareCount: 0,
      repeatedScareCount: 0,
      discoveredClueIds: [],
      clues: MILO_CONTENT.clues,
    });
    expect(miloResults.headline).toContain('Milo');
    expect(miloResults.headline).not.toContain('Nora');
  });
});

describe('session isolation between visitors', () => {
  it('clears Nora clues when discovery resets for the next visitor', () => {
    let state = createDiscoveryState();
    state = discoverClue(state, 'nora-whisper-mutter');
    expect(state.discoveredClueIds).toContain('nora-whisper-mutter');

    state = resetDiscoveryState();
    expect(state.discoveredClueIds).not.toContain('nora-whisper-mutter');
    expect(state.discoveredClueIds).toHaveLength(0);
  });

  it('Milo route pacing differs from Nora', () => {
    const noraPauses = NORA_VISIT.pointsOfInterest.map((poi) => poi.pauseMs);
    const miloPauses = MILO_VISIT.pointsOfInterest.map((poi) => poi.pauseMs);
    const noraTotal = noraPauses.reduce((sum, ms) => sum + ms, 0);
    const miloTotal = miloPauses.reduce((sum, ms) => sum + ms, 0);
    expect(miloTotal).not.toBe(noraTotal);
  });
});
