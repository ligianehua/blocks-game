import { describe, it, expect } from 'vitest';
import { PIECES, dimensions, pickPieces, getById } from '../../src/game/pieces.js';
import { mulberry32 } from '../../src/core/rng.js';

describe('piece library', () => {
  it('has unique ids', () => {
    const ids = new Set(PIECES.map((p) => p.id));
    expect(ids.size).toBe(PIECES.length);
  });

  it('all cells start at 0,0 corner', () => {
    for (const p of PIECES) {
      const minR = Math.min(...p.cells.map(([r]) => r));
      const minC = Math.min(...p.cells.map(([, c]) => c));
      expect(minR).toBe(0);
      expect(minC).toBe(0);
    }
  });

  it('dimensions reflect bounding box', () => {
    expect(dimensions(getById('h3'))).toEqual({ rows: 1, cols: 3 });
    expect(dimensions(getById('sq3'))).toEqual({ rows: 3, cols: 3 });
  });

  it('tiers are 1, 2, or 3', () => {
    for (const p of PIECES) expect([1, 2, 3]).toContain(p.tier);
  });
});

describe('pickPieces', () => {
  it('returns the requested count', () => {
    const rng = mulberry32(123);
    const picks = pickPieces(rng, 3, 0);
    expect(picks.length).toBe(3);
    for (const p of picks) expect(getById(p.id)).toBeDefined();
  });

  it('is deterministic for same seed', () => {
    const a = pickPieces(mulberry32(42), 5, 1000);
    const b = pickPieces(mulberry32(42), 5, 1000);
    expect(a.map((p) => p.id)).toEqual(b.map((p) => p.id));
  });
});
