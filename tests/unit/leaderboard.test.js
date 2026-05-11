import { describe, it, expect } from 'vitest';
import { emptyBoard, recordScore, rankFor, qualifies, sanitizeName } from '../../src/game/leaderboard.js';

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

  it('qualifies: any positive score on empty board', () => {
    const b = emptyBoard();
    expect(qualifies(b, 'classic', 100)).toBe(true);
    expect(qualifies(b, 'classic', 0)).toBe(false);
  });

  it('qualifies: must beat the lowest of top 10 once full', () => {
    let b = emptyBoard();
    for (let i = 1; i <= 10; i++) b = recordScore(b, 'classic', i * 100);
    expect(b.classic[9].score).toBe(100);
    expect(qualifies(b, 'classic', 50)).toBe(false);
    expect(qualifies(b, 'classic', 100)).toBe(false);
    expect(qualifies(b, 'classic', 150)).toBe(true);
  });

  it('sanitizeName trims, caps at 12, and returns null for empty', () => {
    expect(sanitizeName('  hi  ')).toBe('hi');
    expect(sanitizeName('')).toBe(null);
    expect(sanitizeName('   ')).toBe(null);
    expect(sanitizeName('aaaaaaaaaaaabbbb')).toBe('aaaaaaaaaaaa');
    expect(sanitizeName(null)).toBe(null);
    expect(sanitizeName(undefined)).toBe(null);
  });

  it('records name in entry meta', () => {
    let b = emptyBoard();
    b = recordScore(b, 'classic', 500, { name: 'Alice' });
    expect(b.classic[0].name).toBe('Alice');
  });
});
