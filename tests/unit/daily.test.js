import { describe, it, expect } from 'vitest';
import { startDaily, dateKey, DIFFICULTIES } from '../../src/game/modes/daily.js';

describe('daily challenge mode', () => {
  it('exposes 3 difficulties', () => {
    expect(DIFFICULTIES).toEqual(['easy', 'normal', 'hard']);
  });

  it('dateKey produces YYYY-MM-DD', () => {
    const d = new Date(2026, 4, 9);
    expect(dateKey(d)).toBe('2026-05-09');
  });

  it('same date+difficulty produces same starting tray', () => {
    const date = new Date(2026, 4, 10);
    const a = startDaily({ date, difficulty: 'normal' });
    const b = startDaily({ date, difficulty: 'normal' });
    expect(a.tray.map((p) => p.id)).toEqual(b.tray.map((p) => p.id));
  });

  it('different difficulty differs', () => {
    const date = new Date(2026, 4, 10);
    const a = startDaily({ date, difficulty: 'easy' });
    const b = startDaily({ date, difficulty: 'hard' });
    expect(a.seed).not.toBe(b.seed);
  });

  it('exposes metadata with date key + difficulty', () => {
    const g = startDaily({ date: new Date(2026, 4, 10), difficulty: 'normal' });
    expect(g.metadata.key).toBe('2026-05-10');
    expect(g.metadata.difficulty).toBe('normal');
  });
});
