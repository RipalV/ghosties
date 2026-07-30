import { describe, expect, it } from 'vitest';
import { LOBBY_PROPS, LOBBY_PROP_COMBO_BONUS } from '../src/game/content/lobbyProps';
import { NORA_VISIT } from '../src/game/content/noraVisit';
import { MILO_VISIT } from '../src/game/content/miloVisit';
import { resolveScare } from '../src/game/fear/FearEngine';
import { NORA_CONTENT } from '../src/game/content/nora';
import { scaleScareResult } from '../src/game/scareCast/scareCastExposure';
import { resetSessionForNewVisit } from '../src/game/session/sessionReset';
import {
  beginPropCastLink,
  clearLinkedProp,
  createPropVisitState,
  evaluatePropCombo,
  findNearbyUnusedProp,
  isWithinRadius,
  linkPropForCast,
  resetPropVisitState,
  selectPropForCast,
} from '../src/game/props';

const bell = LOBBY_PROPS.find((p) => p.id === 'reception-bell')!;
const portrait = LOBBY_PROPS.find((p) => p.id === 'crooked-portrait')!;
const fireplace = LOBBY_PROPS.find((p) => p.id === 'drafty-fireplace')!;

describe('lobby prop selection', () => {
  it('selects nearest compatible prop in ghost activation range', () => {
    const ghost = { x: bell.position.x + 20, y: bell.position.y + 10 };
    const selected = selectPropForCast(LOBBY_PROPS, ghost, 'object', true);
    expect(selected?.id).toBe('reception-bell');
  });

  it('rejects incompatible scare categories', () => {
    const ghost = { x: fireplace.position.x, y: fireplace.position.y };
    expect(selectPropForCast(LOBBY_PROPS, ghost, 'object', true)).toBeNull();
  });

  it('rejects when ghost is outside activation radius', () => {
    const ghost = { x: bell.position.x + 500, y: bell.position.y };
    expect(selectPropForCast(LOBBY_PROPS, ghost, 'object', true)).toBeNull();
  });

  it('blocks selection when visitor is not targetable', () => {
    const ghost = { x: bell.position.x, y: bell.position.y };
    expect(selectPropForCast(LOBBY_PROPS, ghost, 'object', false)).toBeNull();
  });

  it('links prop on cast start via beginPropCastLink', () => {
    const ghost = { x: portrait.position.x + 5, y: portrait.position.y };
    const next = beginPropCastLink(createPropVisitState(), LOBBY_PROPS, ghost, 'whisper', true);
    expect(next.linkedPropId).toBe('crooked-portrait');
  });
});

describe('lobby prop combo evaluation', () => {
  it('awards score bonus when exposure, category, and visitor radius match', () => {
    let state = linkPropForCast(createPropVisitState(), bell.id);
    const visitor = { x: bell.position.x + 30, y: bell.position.y + 20 };

    const result = evaluatePropCombo(
      state,
      LOBBY_PROPS,
      bell.id,
      'object',
      1,
      visitor,
      'nora',
    );

    expect(result.evaluation.awarded).toBe(true);
    expect(result.evaluation.scoreBonus).toBe(LOBBY_PROP_COMBO_BONUS);
    expect(result.evaluation.reactionCopy).toContain('bell');
    expect(result.state.awardedPropIds.has(bell.id)).toBe(true);
    expect(result.state.linkedPropId).toBeNull();
  });

  it('rejects zero exposure', () => {
    const state = linkPropForCast(createPropVisitState(), bell.id);
    const result = evaluatePropCombo(
      state,
      LOBBY_PROPS,
      bell.id,
      'object',
      0,
      bell.position,
      'nora',
    );
    expect(result.evaluation.awarded).toBe(false);
    expect(result.evaluation.scoreBonus).toBe(0);
  });

  it('rejects when visitor is outside reaction radius', () => {
    const state = linkPropForCast(createPropVisitState(), bell.id);
    const farVisitor = { x: bell.position.x + 400, y: bell.position.y + 400 };
    const result = evaluatePropCombo(
      state,
      LOBBY_PROPS,
      bell.id,
      'object',
      1,
      farVisitor,
      'nora',
    );
    expect(result.evaluation.awarded).toBe(false);
  });

  it('awards only once per prop per visit', () => {
    let state = linkPropForCast(createPropVisitState(), fireplace.id);
    const visitor = { x: fireplace.position.x, y: fireplace.position.y + 10 };

    const first = evaluatePropCombo(
      state,
      LOBBY_PROPS,
      fireplace.id,
      'cold',
      0.8,
      visitor,
      'milo',
    );
    state = first.state;
    state = linkPropForCast(state, fireplace.id);

    const second = evaluatePropCombo(
      state,
      LOBBY_PROPS,
      fireplace.id,
      'cold',
      1,
      visitor,
      'milo',
    );
    expect(first.evaluation.awarded).toBe(true);
    expect(second.evaluation.awarded).toBe(false);
  });

  it('uses visitor-specific reaction copy from content', () => {
    const state = linkPropForCast(createPropVisitState(), portrait.id);
    const nora = evaluatePropCombo(
      state,
      LOBBY_PROPS,
      portrait.id,
      'whisper',
      1,
      portrait.position,
      'nora',
    );
    const milo = evaluatePropCombo(
      state,
      LOBBY_PROPS,
      portrait.id,
      'whisper',
      1,
      portrait.position,
      'milo',
    );
    expect(nora.evaluation.reactionCopy).toContain('Nora');
    expect(milo.evaluation.reactionCopy).toContain('Milo');
  });
});

describe('lobby prop combo isolation from fear maths', () => {
  it('does not change scaled scare fear or score deltas', () => {
    const raw = resolveScare(NORA_CONTENT.fearProfile, { usesByCategory: {} }, 'object');
    const scaled = scaleScareResult(raw, 1, 'Nora');
    expect(scaled.fearGained).toBe(raw.fearGained);
    expect(scaled.scoreDelta).toBe(raw.scoreDelta);
  });
});

describe('lobby prop visit state reset', () => {
  it('resets awarded props and links between visits', () => {
    let state = linkPropForCast(createPropVisitState(), bell.id);
    state = evaluatePropCombo(
      state,
      LOBBY_PROPS,
      bell.id,
      'object',
      1,
      bell.position,
      'nora',
    ).state;

    expect(state.awardedPropIds.size).toBe(1);
    const reset = resetPropVisitState();
    expect(reset.awardedPropIds.size).toBe(0);
    expect(reset.linkedPropId).toBeNull();

    const sessionReset = resetSessionForNewVisit();
    expect(sessionReset.runtime.propVisitState.awardedPropIds.size).toBe(0);
  });

  it('clears linked prop on cancel helper', () => {
    const linked = linkPropForCast(createPropVisitState(), bell.id);
    expect(clearLinkedProp(linked).linkedPropId).toBeNull();
  });
});

describe('lobby prop coaching discovery', () => {
  it('finds nearby unused props for coaching', () => {
    const ghost = { x: fireplace.position.x + 10, y: fireplace.position.y };
    const found = findNearbyUnusedProp(LOBBY_PROPS, createPropVisitState(), ghost, true);
    expect(found?.id).toBe('drafty-fireplace');
  });

  it('ignores already awarded props', () => {
    const ghost = { x: fireplace.position.x, y: fireplace.position.y };
    const awarded = evaluatePropCombo(
      linkPropForCast(createPropVisitState(), fireplace.id),
      LOBBY_PROPS,
      fireplace.id,
      'cold',
      1,
      fireplace.position,
      'milo',
    ).state;
    expect(findNearbyUnusedProp(LOBBY_PROPS, awarded, ghost, true)).toBeNull();
  });
});

describe('visitor route prop proximity', () => {
  it('places Nora near bell and portrait POIs within reaction radii', () => {
    const poiBell = NORA_VISIT.pointsOfInterest[0];
    const poiPortrait = NORA_VISIT.pointsOfInterest[1];
    expect(isWithinRadius(poiBell, bell.position, bell.visitorReactionRadius)).toBe(true);
    expect(isWithinRadius(poiPortrait, portrait.position, portrait.visitorReactionRadius)).toBe(true);
  });

  it('places Milo near the drafty fireplace POI within reaction radius', () => {
    const poiFireplace = MILO_VISIT.pointsOfInterest[1];
    expect(isWithinRadius(poiFireplace, fireplace.position, fireplace.visitorReactionRadius)).toBe(true);
  });
});
