import { describe, it, expect } from 'vitest';
import { startTimeAttack, DEFAULT_DURATION_MS } from '../../src/game/modes/timeAttack.js';
import { tickTime } from '../../src/game/state.js';

describe('time attack mode', () => {
  it('starts with default duration', () => {
    const g = startTimeAttack();
    expect(g.timeLeft).toBe(DEFAULT_DURATION_MS);
    expect(g.timeLimit).toBe(DEFAULT_DURATION_MS);
  });

  it('accepts custom duration', () => {
    const g = startTimeAttack({ durationMs: 30000 });
    expect(g.timeLeft).toBe(30000);
  });

  it('tickTime decrements timeLeft', () => {
    const g = startTimeAttack({ durationMs: 1000 });
    tickTime(g, 200);
    expect(g.timeLeft).toBe(800);
  });

  it('tickTime to 0 ends game', () => {
    const g = startTimeAttack({ durationMs: 500 });
    tickTime(g, 600);
    expect(g.timeLeft).toBe(0);
    expect(g.over).toBe(true);
  });

  it('tickTime is a no-op once over', () => {
    const g = startTimeAttack({ durationMs: 500 });
    g.over = true;
    tickTime(g, 100);
    expect(g.timeLeft).toBe(500);
  });
});
