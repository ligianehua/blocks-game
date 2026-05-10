import { describe, it, expect } from 'vitest';
import { emptyCheckin, checkInToday, computeReward, dayKey } from '../../src/game/checkin.js';

describe('checkin', () => {
  it('first check-in sets streak=1', () => {
    const day = new Date(2026, 4, 10);
    const { state, alreadyChecked, reward } = checkInToday(emptyCheckin(), day);
    expect(alreadyChecked).toBe(false);
    expect(state.streak).toBe(1);
    expect(state.lastDay).toBe(dayKey(day));
    expect(reward.undos).toBeGreaterThan(0);
  });

  it('second consecutive day increments streak', () => {
    const d1 = new Date(2026, 4, 10);
    const d2 = new Date(2026, 4, 11);
    const a = checkInToday(emptyCheckin(), d1).state;
    const b = checkInToday(a, d2).state;
    expect(b.streak).toBe(2);
    expect(b.bestStreak).toBe(2);
  });

  it('skipping a day resets streak', () => {
    const d1 = new Date(2026, 4, 10);
    const d3 = new Date(2026, 4, 12);
    const a = checkInToday(emptyCheckin(), d1).state;
    const b = checkInToday(a, d3).state;
    expect(b.streak).toBe(1);
    expect(b.bestStreak).toBe(1);
  });

  it('checking same day twice is idempotent', () => {
    const d = new Date(2026, 4, 10);
    const a = checkInToday(emptyCheckin(), d);
    const b = checkInToday(a.state, d);
    expect(b.alreadyChecked).toBe(true);
    expect(b.state.streak).toBe(1);
  });

  it('reward scales with streak', () => {
    const r1 = computeReward(1);
    const r3 = computeReward(3);
    const r7 = computeReward(7);
    expect(r1.undos + r1.hints).toBeLessThan(r3.undos + r3.hints);
    expect(r3.undos + r3.hints).toBeLessThanOrEqual(r7.undos + r7.hints);
  });

  it('history records up to 30 entries', () => {
    let s = emptyCheckin();
    for (let i = 0; i < 40; i++) {
      s = checkInToday(s, new Date(2026, 0, 1 + i)).state;
    }
    expect(s.history.length).toBe(30);
    expect(s.totalDays).toBe(40);
  });
});
