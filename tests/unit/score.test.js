import { describe, it, expect } from 'vitest';
import {
  placementScore,
  clearScore,
  nextMilestone,
  progressToNext,
  MILESTONES,
} from '../../src/game/score.js';

describe('placementScore', () => {
  it('equals piece size', () => {
    expect(placementScore({ size: 1 })).toBe(1);
    expect(placementScore({ size: 5 })).toBe(5);
  });
});

describe('clearScore', () => {
  it('returns 0 when nothing cleared', () => {
    const r = clearScore({ rows: [], cols: [] }, 0, false);
    expect(r.gained).toBe(0);
  });

  it('single line at combo 0 = 80', () => {
    const r = clearScore({ rows: [3], cols: [] }, 0, false);
    expect(r.gained).toBe(80);
  });

  it('two lines apply 1.5x multiplier', () => {
    const r = clearScore({ rows: [3, 4], cols: [] }, 0, false);
    expect(r.gained).toBe(Math.round(160 * 1.5));
  });

  it('three lines apply 2x multiplier', () => {
    const r = clearScore({ rows: [3, 4, 5], cols: [] }, 0, false);
    expect(r.gained).toBe(Math.round(240 * 2));
  });

  it('cross adds +50', () => {
    const r = clearScore({ rows: [3], cols: [4] }, 0, false);
    expect(r.gained).toBe(Math.round(160 * 1.5) + 50);
  });

  it('full clear adds +300', () => {
    const r = clearScore({ rows: [3], cols: [] }, 0, true);
    expect(r.gained).toBe(80 + 300);
  });

  it('combo 3 applies 1.5x', () => {
    const r = clearScore({ rows: [3], cols: [] }, 3, false);
    expect(r.gained).toBe(Math.round(80 * 1.5));
  });
});

describe('milestones', () => {
  it('finds next', () => {
    expect(nextMilestone(0)).toBe(MILESTONES[0]);
    expect(nextMilestone(2500)).toBe(3000);
    expect(nextMilestone(999999)).toBe(null);
  });

  it('progress is 0..1', () => {
    expect(progressToNext(0)).toBeGreaterThanOrEqual(0);
    expect(progressToNext(0)).toBeLessThanOrEqual(1);
    expect(progressToNext(2500)).toBeCloseTo(0.5, 1);
  });
});
