import { describe, expect, it } from 'vitest';
import { cssToWorldUnits, fitsAboveHead } from '../src/game/visuals/overheadPlacement';

describe('cssToWorldUnits', () => {
  it('converts CSS pixels using the camera zoom and the render zoom together', () => {
    // A camera zoom of 0.5 doubles the world span; a render zoom of 0.5 doubles it again.
    expect(cssToWorldUnits(66, 1, 1)).toBe(66);
    expect(cssToWorldUnits(66, 0.5, 1)).toBe(132);
    expect(cssToWorldUnits(66, 0.5, 0.5)).toBe(264);
  });
});

describe('fitsAboveHead', () => {
  const height = 32;
  const aboveY = -56;
  const clearance = 100;

  it('keeps a badge above the head when it clears the reserved band', () => {
    expect(fitsAboveHead(600, aboveY, height, 0, clearance)).toBe(true);
  });

  it('rejects the position when the badge would cross into the reserved band', () => {
    expect(fitsAboveHead(150, aboveY, height, 0, clearance)).toBe(false);
  });

  it('treats a badge resting exactly on the clearance line as fitting', () => {
    const characterY = clearance + height / 2 - aboveY;
    expect(fitsAboveHead(characterY, aboveY, height, 0, clearance)).toBe(true);
    expect(fitsAboveHead(characterY - 1, aboveY, height, 0, clearance)).toBe(false);
  });

  it('measures against the top of the current view rather than the world origin', () => {
    // The same character sits comfortably in one view and too high in another.
    expect(fitsAboveHead(600, aboveY, height, 0, clearance)).toBe(true);
    expect(fitsAboveHead(600, aboveY, height, 500, clearance)).toBe(false);
  });

  it('needs more room for a taller badge such as a two-line bubble', () => {
    const characterY = 220;
    expect(fitsAboveHead(characterY, -96, 30, 0, clearance)).toBe(true);
    expect(fitsAboveHead(characterY, -96, 90, 0, clearance)).toBe(false);
  });
});
