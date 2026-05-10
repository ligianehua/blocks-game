import { describe, it, expect } from 'vitest';
import { mulberry32, hashString, dailySeed } from '../../src/core/rng.js';

describe('mulberry32', () => {
  it('returns numbers in [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic', () => {
    const a = mulberry32(7);
    const b = mulberry32(7);
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
  });

  it('different seeds produce different streams', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });
});

describe('dailySeed', () => {
  it('same date+difficulty produces same seed', () => {
    const d = new Date(2026, 4, 10);
    expect(dailySeed(d, 'easy')).toBe(dailySeed(d, 'easy'));
  });

  it('different difficulty differs', () => {
    const d = new Date(2026, 4, 10);
    expect(dailySeed(d, 'easy')).not.toBe(dailySeed(d, 'hard'));
  });

  it('hashString is stable', () => {
    expect(hashString('hello')).toBe(hashString('hello'));
    expect(hashString('hello')).not.toBe(hashString('world'));
  });
});
