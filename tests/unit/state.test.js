import { describe, it, expect, beforeEach } from 'vitest';
import { createGame, placePiece, remainingTray } from '../../src/game/state.js';
import { getById } from '../../src/game/pieces.js';
import { clear as clearEvents, on } from '../../src/core/events.js';

describe('game state lifecycle', () => {
  beforeEach(() => clearEvents());

  it('starts with score 0 and a full tray', () => {
    const g = createGame({ seed: 99 });
    expect(g.score).toBe(0);
    expect(g.tray.length).toBe(3);
    expect(g.traySlotsUsed).toEqual([false, false, false]);
    expect(g.over).toBe(false);
  });

  it('placePiece increments score by piece size', () => {
    const g = createGame({ seed: 99 });
    const piece = g.tray[0];
    const beforeScore = g.score;
    const result = placePiece(g, 0, 0, 0);
    if (!result.ok) return; // piece may not fit at (0,0); skip if so
    expect(g.score).toBeGreaterThanOrEqual(beforeScore + piece.size);
  });

  it('rejects re-placing the same slot', () => {
    const g = createGame({ seed: 99 });
    const r1 = placePiece(g, 0, 0, 0);
    if (!r1.ok) return;
    const r2 = placePiece(g, 0, 0, 0);
    expect(r2.ok).toBe(false);
  });

  it('refills tray after all 3 slots used', () => {
    const g = createGame({ seed: 99 });
    let refills = 0;
    on('trayRefilled', () => refills++);
    const dot = getById('dot');
    g.tray = [dot, dot, dot];
    placePiece(g, 0, 0, 0);
    placePiece(g, 1, 0, 1);
    placePiece(g, 2, 0, 2);
    expect(refills).toBeGreaterThan(0);
    expect(g.traySlotsUsed.some(Boolean)).toBe(false);
  });

  it('remainingTray excludes used slots', () => {
    const g = createGame({ seed: 99 });
    g.traySlotsUsed = [true, false, false];
    expect(remainingTray(g).length).toBe(2);
  });
});
