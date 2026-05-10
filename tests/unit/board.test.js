import { describe, it, expect } from 'vitest';
import {
  createBoard,
  tryPlace,
  applyClears,
  isAnyPiecePlaceable,
} from '../../src/game/board.js';
import { BOARD_SIZE } from '../../src/core/bitboard.js';
import { getById } from '../../src/game/pieces.js';

describe('board operations', () => {
  it('creates an empty board', () => {
    const b = createBoard();
    expect(b.cells.length).toBe(BOARD_SIZE * BOARD_SIZE);
    expect(Array.from(b.cells).every((v) => v === 0)).toBe(true);
  });

  it('tryPlace stamps tier into cells', () => {
    const b = createBoard();
    const dot = getById('dot');
    const next = tryPlace(b, dot, 4, 4);
    expect(next).not.toBe(null);
    expect(next.cells[4 * BOARD_SIZE + 4]).toBe(dot.tier);
    expect(b.cells[4 * BOARD_SIZE + 4]).toBe(0);
  });

  it('tryPlace returns null on conflict', () => {
    const b = createBoard();
    const dot = getById('dot');
    const after = tryPlace(b, dot, 0, 0);
    expect(tryPlace(after, dot, 0, 0)).toBe(null);
  });

  it('applyClears clears full rows and reports them', () => {
    let b = createBoard();
    const h4 = getById('h4');
    b = tryPlace(b, h4, 0, 0);
    b = tryPlace(b, h4, 0, 4);
    expect(b).not.toBe(null);
    const result = applyClears(b);
    expect(result.cleared).toBe(true);
    expect(result.rows).toEqual([0]);
    expect(result.cols).toEqual([]);
    expect(result.emptyAfter).toBe(true);
  });

  it('isAnyPiecePlaceable detects dead end', () => {
    let b = createBoard();
    const dot = getById('dot');
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const next = tryPlace(b, dot, r, c);
        if (next) b = next;
      }
    }
    expect(isAnyPiecePlaceable(b, [dot])).toBe(false);
    expect(isAnyPiecePlaceable(createBoard(), [dot])).toBe(true);
  });
});
