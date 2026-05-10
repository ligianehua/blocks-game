import { describe, it, expect, beforeEach } from 'vitest';
import { createGame, placePiece, undoLast } from '../../src/game/state.js';
import { getById } from '../../src/game/pieces.js';
import { clear as clearEvents } from '../../src/core/events.js';

function dotGame(seed = 1) {
  const g = createGame({ seed });
  const dot = getById('dot');
  g.tray = [dot, dot, dot];
  g.traySlotsUsed = [false, false, false];
  return g;
}

describe('undo', () => {
  beforeEach(() => clearEvents());

  it('starts with 3 undos', () => {
    const g = dotGame();
    expect(g.undosLeft).toBe(3);
    expect(g.history.length).toBe(0);
  });

  it('rejects undo when nothing to undo', () => {
    const g = dotGame();
    expect(undoLast(g).ok).toBe(false);
  });

  it('reverts the last placement', () => {
    const g = dotGame();
    placePiece(g, 0, 0, 0);
    const after = g.score;
    const occAfter = g.board.occupancy;
    expect(undoLast(g).ok).toBe(true);
    expect(g.score).toBeLessThan(after);
    expect(g.board.occupancy).not.toBe(occAfter);
    expect(g.traySlotsUsed[0]).toBe(false);
    expect(g.undosLeft).toBe(2);
  });

  it('rejects undo when undosLeft is 0', () => {
    const g = dotGame();
    g.undosLeft = 0;
    placePiece(g, 0, 0, 0);
    expect(undoLast(g).ok).toBe(false);
  });

  it('three placements then three undos returns to start', () => {
    const g = dotGame();
    const startScore = g.score;
    const startOcc = g.board.occupancy;
    placePiece(g, 0, 0, 0);
    placePiece(g, 1, 0, 1);
    placePiece(g, 2, 0, 2);
    undoLast(g);
    undoLast(g);
    undoLast(g);
    expect(g.score).toBe(startScore);
    expect(g.board.occupancy).toBe(startOcc);
    expect(g.undosLeft).toBe(0);
  });
});
