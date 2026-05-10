import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, evaluate, getById } from '../../src/game/achievements.js';
import { emptyStats } from '../../src/game/stats.js';

function world(overrides = {}) {
  return {
    stats: emptyStats(),
    flags: {},
    stages: { completedCount: 0, totalStars: 0 },
    checkin: { bestStreak: 0 },
    ...overrides,
  };
}

describe('achievements', () => {
  it('ships 15 achievements with unique ids', () => {
    expect(ACHIEVEMENTS.length).toBe(15);
    const ids = new Set(ACHIEVEMENTS.map((a) => a.id));
    expect(ids.size).toBe(ACHIEVEMENTS.length);
  });

  it('every achievement has a check function and icon', () => {
    for (const a of ACHIEVEMENTS) {
      expect(typeof a.check).toBe('function');
      expect(typeof a.icon).toBe('string');
    }
  });

  it('first_play unlocks after one game', () => {
    const stats = emptyStats();
    stats.games.total = 1;
    const r = evaluate([], world({ stats }));
    expect(r.ids).toContain('first_play');
    const newIds = r.newlyUnlocked.map((a) => a.id);
    expect(newIds).toContain('first_play');
  });

  it('combo_5 unlocks at bestCombo >= 5 but not 4', () => {
    const stats4 = emptyStats();
    stats4.bestCombo = 4;
    expect(evaluate([], world({ stats: stats4 })).ids).not.toContain('combo_5');

    const stats5 = emptyStats();
    stats5.bestCombo = 5;
    expect(evaluate([], world({ stats: stats5 })).ids).toContain('combo_5');
  });

  it('full_clear requires the flag', () => {
    const r1 = evaluate([], world({ flags: {} }));
    expect(r1.ids).not.toContain('full_clear');
    const r2 = evaluate([], world({ flags: { everFullClear: true } }));
    expect(r2.ids).toContain('full_clear');
  });

  it('does not re-emit already unlocked achievements', () => {
    const stats = emptyStats();
    stats.games.total = 1;
    const a = evaluate([], world({ stats }));
    const b = evaluate(a.ids, world({ stats }));
    expect(b.newlyUnlocked).toEqual([]);
  });

  it('stages_perfect needs all 36 stars', () => {
    expect(evaluate([], world({ stages: { completedCount: 12, totalStars: 35 } })).ids)
      .not.toContain('stages_perfect');
    expect(evaluate([], world({ stages: { completedCount: 12, totalStars: 36 } })).ids)
      .toContain('stages_perfect');
  });

  it('time_500 reads stats.score.bestByMode.timeAttack', () => {
    const stats = emptyStats();
    stats.score.bestByMode.timeAttack = 500;
    expect(evaluate([], world({ stats })).ids).toContain('time_500');
  });

  it('getById returns null for unknown', () => {
    expect(getById('first_play')).not.toBe(null);
    expect(getById('nope')).toBe(null);
  });
});
