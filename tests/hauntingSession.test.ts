import { describe, expect, it } from 'vitest';
import { NORA_VISIT } from '../src/game/content/noraVisit';
import {
  announceVisitor,
  beginActiveHaunting,
  beginVisitorDeparting,
  createHauntingSession,
  prepareNextVisit,
  shouldAnnounceVisitor,
  showResults,
  tickLocationReady,
  tickVisitorAnnounced,
} from '../src/game/session/hauntingSession';
import { resetSessionForNewVisit } from '../src/game/session/sessionReset';
import { isVisitorTargetable, targetableGateStatus } from '../src/game/session/targetableGate';
import { buildVisitResults, gradeForFearStage } from '../src/game/session/visitResults';
import {
  shouldDepartOnRouteComplete,
  shouldDepartOnSuccess,
  visitOutcomeForDeparture,
} from '../src/game/session/visitSuccess';
import {
  createVisitorRouteState,
  tickVisitorRoute,
} from '../src/game/session/visitorRoute';
import { NORA_CONTENT } from '../src/game/content/nora';

describe('haunting session phases', () => {
  it('advances from location ready to announced', () => {
    let session = createHauntingSession();
    session = tickLocationReady(session, 900);
    expect(session.phase).toBe('locationReady');
    expect(shouldAnnounceVisitor(session, NORA_VISIT.locationReadyAnnounceMs)).toBe(false);

    session = tickLocationReady(session, 900);
    expect(shouldAnnounceVisitor(session, NORA_VISIT.locationReadyAnnounceMs)).toBe(true);
    session = announceVisitor(session);
    expect(session.phase).toBe('visitorAnnounced');
  });

  it('walks announce → enter → active → depart → results', () => {
    let session = announceVisitor(createHauntingSession());
    session = tickVisitorAnnounced(session, 1000, NORA_VISIT.announceEnterDelayMs);
    expect(session.phase).toBe('visitorAnnounced');
    session = tickVisitorAnnounced(session, 1500, NORA_VISIT.announceEnterDelayMs);
    expect(session.phase).toBe('visitorEntering');

    session = beginActiveHaunting(session);
    expect(session.phase).toBe('activeHaunting');

    session = beginVisitorDeparting(session, 'haunted');
    expect(session.visitOutcome).toBe('haunted');
    session = showResults(session);
    expect(session.phase).toBe('results');

    session = prepareNextVisit();
    expect(session.phase).toBe('locationReady');
    expect(session.visitOutcome).toBeNull();
  });
});

describe('visitor presence vs fear', () => {
  it('allows targeting only while visiting during active haunting', () => {
    expect(isVisitorTargetable('activeHaunting', 'visiting')).toBe(true);
    expect(isVisitorTargetable('activeHaunting', 'entering')).toBe(false);
    expect(isVisitorTargetable('visitorEntering', 'entering')).toBe(false);
    expect(isVisitorTargetable('activeHaunting', 'calm' as never)).toBe(false);
  });

  it('returns friendly gate copy without relying on fear stage', () => {
    expect(targetableGateStatus('visitorAnnounced', 'offsite', 'Nora')).toContain('Ding-dong');
    expect(targetableGateStatus('visitorDeparting', 'departing', 'Nora')).toContain('leaving');
  });
});

describe('visit success and departure triggers', () => {
  it('departs on possessed by default', () => {
    expect(shouldDepartOnSuccess('possessed', NORA_VISIT.successMinFearStage)).toBe(true);
    expect(shouldDepartOnSuccess('swoon', NORA_VISIT.successMinFearStage)).toBe(false);
  });

  it('departs unimpressed when route completes first', () => {
    expect(shouldDepartOnRouteComplete(true, 'activeHaunting')).toBe(true);
    expect(shouldDepartOnRouteComplete(true, 'visitorDeparting')).toBe(false);
    expect(visitOutcomeForDeparture(false)).toBe('unimpressed');
  });
});

describe('session reset', () => {
  it('clears runtime and npc state for a new visit', () => {
    const reset = resetSessionForNewVisit();
    expect(reset.runtime.score).toBe(0);
    expect(reset.runtime.energy).toBe(100);
    expect(reset.runtime.discoveryState.discoveredClueIds).toEqual([]);
    expect(reset.npc.fear).toBe(0);
    expect(reset.npc.stage).toBe('calm');
  });
});

describe('visit results', () => {
  it('builds haunted and escaped summaries with mischievous copy', () => {
    const haunted = buildVisitResults({
      visitorName: 'Nora',
      outcome: 'haunted',
      finalFearStage: 'possessed',
      finalFear: 100,
      score: 42,
      observationBonusTotal: 10,
      ineffectiveScareCount: 0,
      repeatedScareCount: 0,
      discoveredClueIds: ['clue-a'],
      clues: NORA_CONTENT.clues,
    });
    expect(haunted.headline).toContain('spook');
    expect(haunted.outcomeLabel).toBe('Epic haunt!');
    expect(haunted.bonusLine).toContain('+10');
    expect(haunted.stageLine).toContain('Spook-o-meter');

    const escaped = buildVisitResults({
      visitorName: 'Nora',
      outcome: 'unimpressed',
      finalFearStage: 'curious',
      finalFear: 12,
      score: 5,
      observationBonusTotal: 0,
      ineffectiveScareCount: 2,
      repeatedScareCount: 1,
      discoveredClueIds: [],
      clues: NORA_CONTENT.clues,
    });
    expect(escaped.outcomeLabel).toBe('Side-eye spook');
    expect(escaped.headline).toContain('curious');
    expect(escaped.notes.length).toBe(1);
    expect(escaped.notes[0]).toContain('mix it up');
    expect(escaped.cluesTitle.toLowerCase()).toContain('secret');
    expect(escaped.tip.length).toBeLessThan(50);
  });

  it('grades each fear stage with distinct fun outcomes', () => {
    expect(gradeForFearStage('calm').outcomeLabel).toBe('Ice cold');
    expect(gradeForFearStage('curious').outcomeLabel).toBe('Side-eye spook');
    expect(gradeForFearStage('uneasy').outcomeLabel).toBe('Jitters unlocked');
    expect(gradeForFearStage('frightened').outcomeLabel).toBe('Big scares!');
    expect(gradeForFearStage('runaway').outcomeLabel).toBe('Almost bolted!');
    expect(gradeForFearStage('swoon').outcomeLabel).toBe('Wobble zone');
    expect(gradeForFearStage('possessed').outcomeLabel).toBe('Epic haunt!');
  });

  it('keeps headlines short and punchy', () => {
    const swoon = buildVisitResults({
      visitorName: 'Nora',
      outcome: 'unimpressed',
      finalFearStage: 'swoon',
      finalFear: 85,
      score: 112,
      observationBonusTotal: 5,
      ineffectiveScareCount: 0,
      repeatedScareCount: 7,
      discoveredClueIds: [NORA_CONTENT.clues[0].id],
      clues: NORA_CONTENT.clues,
    });
    expect(swoon.headline.length).toBeLessThan(55);
    expect(swoon.notes).toHaveLength(1);
    expect(swoon.cluesTitle).toBe('Secrets');
  });
});

describe('visitor route progression', () => {
  it('stays offsite until entering', () => {
    const tick = tickVisitorRoute({
      state: createVisitorRouteState(),
      config: NORA_VISIT,
      deltaMs: 16,
      npcX: NORA_VISIT.spawn.x,
      npcY: NORA_VISIT.spawn.y,
      phase: 'locationReady',
    });
    expect(tick.state.presence).toBe('offsite');
    expect(tick.visible).toBe(false);
  });

  it('enters visiting at the entrance threshold', () => {
    const tick = tickVisitorRoute({
      state: createVisitorRouteState(),
      config: NORA_VISIT,
      deltaMs: 16,
      npcX: NORA_VISIT.entrance.x,
      npcY: NORA_VISIT.entrance.y,
      phase: 'visitorEntering',
    });
    expect(tick.enteredVisiting).toBe(true);
    expect(tick.state.presence).toBe('visiting');
    expect(tick.state.poiIndex).toBe(0);
  });

  it('marks route complete after the final POI', () => {
    const lastIndex = NORA_VISIT.pointsOfInterest.length - 1;
    const lastPoi = NORA_VISIT.pointsOfInterest[lastIndex];
    const tick = tickVisitorRoute({
      state: {
        ...createVisitorRouteState(),
        presence: 'visiting',
        leg: 'poi',
        poiIndex: lastIndex,
      },
      config: NORA_VISIT,
      deltaMs: 16,
      npcX: lastPoi.x,
      npcY: lastPoi.y,
      phase: 'activeHaunting',
    });
    expect(tick.state.routeComplete).toBe(true);
    expect(tick.state.poiIndex).toBe(NORA_VISIT.pointsOfInterest.length);
    expect(tick.state.pauseRemainingMs).toBe(0);
  });

  it('walks to exit while departing', () => {
    const tick = tickVisitorRoute({
      state: { ...createVisitorRouteState(), presence: 'departing', leg: 'exit' },
      config: NORA_VISIT,
      deltaMs: 16,
      npcX: NORA_VISIT.exit.x,
      npcY: NORA_VISIT.exit.y,
      phase: 'visitorDeparting',
    });
    expect(tick.reachedExit).toBe(true);
    expect(tick.state.presence).toBe('departed');
  });

  it('continues visiting presence while paused (casts allowed)', () => {
    const state = {
      ...createVisitorRouteState(),
      presence: 'visiting' as const,
      leg: 'poi' as const,
      poiIndex: 1,
      pauseRemainingMs: 500,
    };
    const tick = tickVisitorRoute({
      state,
      config: NORA_VISIT,
      deltaMs: 100,
      npcX: NORA_VISIT.pointsOfInterest[0].x,
      npcY: NORA_VISIT.pointsOfInterest[0].y,
      phase: 'activeHaunting',
    });
    expect(tick.state.presence).toBe('visiting');
    expect(tick.shouldMove).toBe(false);
    expect(tick.state.pauseRemainingMs).toBe(400);
  });
});
