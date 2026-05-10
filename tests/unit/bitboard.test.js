import { describe, it, expect } from 'vitest';
import {
  BOARD_SIZE,
  EMPTY_BOARD,
  bit,
  getBit,
  rowMask,
  colMask,
  pieceMask,
  canPlace,
  place,
  findFullLines,
  clearLines,
  hasAnyFit,
  canFitAll,
  popcount,
  isEmpty,
} from '../../src/core/bitboard.js';

describe('bitboard primitives', () => {
  it('bit() and getBit() roundtrip', () => {
    let b = EMPTY_BOARD;
    b |= bit(3, 4);
    expect(getBit(b, 3, 4)).toBe(true);
    expect(getBit(b, 3, 5)).toBe(false);
  });

  it('rowMask covers exactly 8 bits', () => {
    const m = rowMask(2);
    expect(popcount(m)).toBe(BOARD_SIZE);
    for (let c = 0; c < BOARD_SIZE; c++) expect(getBit(m, 2, c)).toBe(true);
    for (let c = 0; c < BOARD_SIZE; c++) expect(getBit(m, 1, c)).toBe(false);
  });

  it('colMask covers exactly 8 bits', () => {
    const m = colMask(5);
    expect(popcount(m)).toBe(BOARD_SIZE);
    for (let r = 0; r < BOARD_SIZE; r++) expect(getBit(m, r, 5)).toBe(true);
    for (let r = 0; r < BOARD_SIZE; r++) expect(getBit(m, r, 4)).toBe(false);
  });
});

describe('piece placement', () => {
  const square2 = [[0, 0], [0, 1], [1, 0], [1, 1]];

  it('pieceMask returns null for out-of-bounds', () => {
    expect(pieceMask(square2, 7, 7)).toBe(null);
    expect(pieceMask(square2, -1, 0)).toBe(null);
  });

  it('canPlace rejects overlap', () => {
    let b = EMPTY_BOARD;
    b = place(b, square2, 0, 0);
    expect(canPlace(b, square2, 0, 0)).toBe(false);
    expect(canPlace(b, square2, 2, 2)).toBe(true);
  });

  it('place returns null on conflict', () => {
    let b = place(EMPTY_BOARD, square2, 0, 0);
    expect(place(b, square2, 0, 0)).toBe(null);
  });
});

describe('line clearing', () => {
  it('detects full row', () => {
    let b = EMPTY_BOARD;
    for (let c = 0; c < BOARD_SIZE; c++) b |= bit(3, c);
    const { rows, cols } = findFullLines(b);
    expect(rows).toEqual([3]);
    expect(cols).toEqual([]);
  });

  it('detects full column', () => {
    let b = EMPTY_BOARD;
    for (let r = 0; r < BOARD_SIZE; r++) b |= bit(r, 5);
    const { rows, cols } = findFullLines(b);
    expect(rows).toEqual([]);
    expect(cols).toEqual([5]);
  });

  it('detects cross', () => {
    let b = EMPTY_BOARD;
    for (let c = 0; c < BOARD_SIZE; c++) b |= bit(2, c);
    for (let r = 0; r < BOARD_SIZE; r++) b |= bit(r, 4);
    const { rows, cols } = findFullLines(b);
    expect(rows).toEqual([2]);
    expect(cols).toEqual([4]);
  });

  it('clearLines removes only the matched lines', () => {
    let b = EMPTY_BOARD;
    for (let c = 0; c < BOARD_SIZE; c++) b |= bit(3, c);
    b |= bit(5, 5);
    const cleared = clearLines(b, [3], []);
    expect(getBit(cleared, 3, 0)).toBe(false);
    expect(getBit(cleared, 5, 5)).toBe(true);
  });
});

describe('fit detection', () => {
  const dot = [[0, 0]];
  const big = Array.from({ length: BOARD_SIZE }, (_, c) => [0, c]);

  it('hasAnyFit on empty board is true', () => {
    expect(hasAnyFit(EMPTY_BOARD, dot)).toBe(true);
  });

  it('hasAnyFit returns false when nothing fits', () => {
    let b = EMPTY_BOARD;
    for (let r = 0; r < BOARD_SIZE; r++)
      for (let c = 0; c < BOARD_SIZE; c++) b |= bit(r, c);
    expect(hasAnyFit(b, dot)).toBe(false);
  });

  it('canFitAll empty pieces', () => {
    expect(canFitAll(EMPTY_BOARD, [])).toBe(true);
  });

  it('canFitAll three small pieces on empty board', () => {
    expect(canFitAll(EMPTY_BOARD, [dot, dot, dot])).toBe(true);
  });

  it('canFitAll three full rows requires sequential clearing', () => {
    expect(canFitAll(EMPTY_BOARD, [big, big, big])).toBe(true);
  });

  it('isEmpty', () => {
    expect(isEmpty(EMPTY_BOARD)).toBe(true);
    expect(isEmpty(bit(0, 0))).toBe(false);
  });
});
