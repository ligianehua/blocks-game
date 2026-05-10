import { describe, it, expect } from 'vitest';
import { startStage, LEVELS, getLevel, rateStars } from '../../src/game/modes/stages.js';
import { isTargetMet } from '../../src/game/modes/stages.data.js';

describe('stages mode', () => {
  it('ships exactly 12 levels with sequential ids', () => {
    expect(LEVELS.length).toBe(12);
    LEVELS.forEach((l, i) => expect(l.id).toBe(i + 1));
  });

  it('every level has a target', () => {
    for (const l of LEVELS) {
      const hasScore = typeof l.target.score === 'number';
      const hasLines = typeof l.target.lines === 'number';
      expect(hasScore || hasLines).toBe(true);
    }
  });

  it('startStage applies init obstacles', () => {
    const level = getLevel(3);
    const g = startStage(3);
    const occupiedCount = Array.from(g.board.cells).filter((v) => v > 0).length;
    expect(occupiedCount).toBe(level.init.length);
  });

  it('startStage with no obstacles is empty', () => {
    const g = startStage(1);
    const occupiedCount = Array.from(g.board.cells).filter((v) => v > 0).length;
    expect(occupiedCount).toBe(0);
  });

  it('rateStars: 3 stars under best, 2 stars under good, else 1', () => {
    const level = getLevel(1);
    expect(rateStars(level, 1)).toBe(3);
    expect(rateStars(level, level.stars[0])).toBe(3);
    expect(rateStars(level, level.stars[0] + 1)).toBe(2);
    expect(rateStars(level, level.stars[1])).toBe(2);
    expect(rateStars(level, level.stars[1] + 1)).toBe(1);
  });

  it('isTargetMet for score target', () => {
    const level = { target: { score: 200 } };
    expect(isTargetMet(level, { score: 199, linesCleared: 0 })).toBe(false);
    expect(isTargetMet(level, { score: 200, linesCleared: 0 })).toBe(true);
  });

  it('isTargetMet for lines target', () => {
    const level = { target: { lines: 3 } };
    expect(isTargetMet(level, { score: 0, linesCleared: 2 })).toBe(false);
    expect(isTargetMet(level, { score: 0, linesCleared: 3 })).toBe(true);
  });

  it('throws on unknown level', () => {
    expect(() => startStage(999)).toThrow();
  });
});
