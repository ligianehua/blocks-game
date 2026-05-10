import { describe, it, expect } from 'vitest';
import { emptyBoard, recordScore, rankFor } from '../../src/game/leaderboard.js';

describe('leaderboard', () => {
  it('starts empty for all modes', () => {
    const b = emptyBoard();
    expect(b.classic).toEqual([]);
    expect(b.timeAttack).toEqual([]);
  });

  it('records descending order', () => {
    let b = emptyBoard();
    b = recordScore(b, 'classic', 100);
    b = recordScore(b, 'classic', 500);
    b = recordScore(b, 'classic', 200);
    expect(b.classic.map((e) => e.score)).toEqual([500, 200, 100]);
  });

  it('keeps top 10 only', () => {
    let b = emptyBoard();
    for (let i = 0; i < 15; i++) b = recordScore(b, 'classic', i * 100);
    expect(b.classic.length).toBe(10);
    expect(b.classic[0].score).toBe(1400);
  });

  it('per-mode independence', () => {
    let b = emptyBoard();
    b = recordScore(b, 'classic', 500);
    b = recordScore(b, 'timeAttack', 200);
    expect(b.classic.length).toBe(1);
    expect(b.timeAttack.length).toBe(1);
  });

  it('rankFor returns 1-based rank', () => {
    let b = emptyBoard();
    b = recordScore(b, 'classic', 1000);
    b = recordScore(b, 'classic', 500);
    expect(rankFor(b, 'classic', 2000)).toBe(1);
    expect(rankFor(b, 'classic', 750)).toBe(2);
    expect(rankFor(b, 'classic', 100)).toBe(3);
  });

  it('attaches metadata', () => {
    let b = emptyBoard();
    b = recordScore(b, 'stages', 300, { levelId: 5, won: true });
    expect(b.stages[0].levelId).toBe(5);
    expect(b.stages[0].won).toBe(true);
  });
});
