import { describe, it, expect } from 'vitest';
import { emptyStats, recordGameOver, formatDuration } from '../../src/game/stats.js';

describe('stats', () => {
  it('emptyStats has zeroed counters', () => {
    const s = emptyStats();
    expect(s.games.total).toBe(0);
    expect(s.score.best).toBe(0);
    expect(s.bestCombo).toBe(0);
    expect(s.timeMs).toBe(0);
    expect(s.firstPlayedAt).toBe(null);
  });

  it('recordGameOver increments counters', () => {
    let s = emptyStats();
    s = recordGameOver(s, {
      mode: 'classic',
      score: 500,
      won: false,
      bestCombo: 3,
      linesCleared: 4,
      placements: 12,
      durationMs: 60_000,
    });
    expect(s.games.classic).toBe(1);
    expect(s.games.total).toBe(1);
    expect(s.score.best).toBe(500);
    expect(s.score.bestByMode.classic).toBe(500);
    expect(s.bestCombo).toBe(3);
    expect(s.linesCleared).toBe(4);
    expect(s.placements).toBe(12);
    expect(s.timeMs).toBe(60_000);
    expect(s.firstPlayedAt).not.toBe(null);
  });

  it('best score is monotonic', () => {
    let s = emptyStats();
    s = recordGameOver(s, { mode: 'classic', score: 500, bestCombo: 0, linesCleared: 0, placements: 0, durationMs: 0 });
    s = recordGameOver(s, { mode: 'classic', score: 200, bestCombo: 0, linesCleared: 0, placements: 0, durationMs: 0 });
    expect(s.score.best).toBe(500);
  });

  it('counts won stages', () => {
    let s = emptyStats();
    s = recordGameOver(s, { mode: 'stages', score: 100, won: true, bestCombo: 0, linesCleared: 0, placements: 5, durationMs: 1000 });
    s = recordGameOver(s, { mode: 'stages', score: 50, won: false, bestCombo: 0, linesCleared: 0, placements: 5, durationMs: 1000 });
    expect(s.won.stages).toBe(1);
    expect(s.games.stages).toBe(2);
  });

  it('formatDuration', () => {
    expect(formatDuration(5_000)).toBe('5s');
    expect(formatDuration(75_000)).toBe('1m 15s');
    expect(formatDuration(3_725_000)).toBe('1h 2m');
  });
});
