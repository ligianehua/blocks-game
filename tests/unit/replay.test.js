import { describe, it, expect } from 'vitest';
import { createReplay, recordPlacement, popPlacement, serialize, deserialize } from '../../src/game/replay.js';

describe('replay log', () => {
  it('appends placements in order', () => {
    const r = createReplay(42);
    recordPlacement(r, 'h2', 0, 0);
    recordPlacement(r, 'sq2', 2, 3);
    expect(r.placements.length).toBe(2);
    expect(r.placements[0].pieceId).toBe('h2');
  });

  it('pop returns last and removes it', () => {
    const r = createReplay(1);
    recordPlacement(r, 'dot', 1, 1);
    const popped = popPlacement(r);
    expect(popped.pieceId).toBe('dot');
    expect(r.placements.length).toBe(0);
  });

  it('roundtrips through JSON', () => {
    const r = createReplay(7);
    recordPlacement(r, 'h3', 4, 2);
    const back = deserialize(serialize(r));
    expect(back.seed).toBe(7);
    expect(back.placements[0].pieceId).toBe('h3');
  });
});
