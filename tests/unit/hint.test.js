import { describe, it, expect, beforeEach } from 'vitest';
import { createGame, findHint, useHint, placePiece } from '../../src/game/state.js';
import { getById } from '../../src/game/pieces.js';
import { tryPlace } from '../../src/game/board.js';
import { clear as clearEvents } from '../../src/core/events.js';

describe('hint', () => {
  beforeEach(() => clearEvents());

  it('finds a placement on empty board', () => {
    const g = createGame({ seed: 1 });
    const dot = getById('dot');
    g.tray = [dot, dot, dot];
    g.traySlotsUsed = [false, false, false];
    const h = findHint(g);
    expect(h).not.toBe(null);
    expect(h.slotIdx).toBe(0);
    expect(h.r).toBe(0);
    expect(h.c).toBe(0);
  });

  it('skips used slots', () => {
    const g = createGame({ seed: 1 });
    const dot = getById('dot');
    g.tray = [dot, dot, dot];
    g.traySlotsUsed = [true, false, false];
    const h = findHint(g);
    expect(h.slotIdx).toBe(1);
  });

  it('useHint decrements counter and emits via return value', () => {
    const g = createGame({ seed: 1 });
    g.hintsLeft = 1;
    const r = useHint(g);
    expect(r.ok).toBe(true);
    expect(g.hintsLeft).toBe(0);
    expect(useHint(g).ok).toBe(false);
  });

  it('returns null when no piece fits', () => {
    const g = createGame({ seed: 1 });
    const dot = getById('dot');
    let board = g.board;
    for (let i = 0; i < 64; i++) {
      const next = tryPlace(board, dot, Math.floor(i / 8), i % 8);
      if (next) board = next;
    }
    g.board = board;
    g.tray = [dot, dot, dot];
    g.traySlotsUsed = [false, false, false];
    expect(findHint(g)).toBe(null);
  });
});
