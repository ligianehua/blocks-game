import { createGame } from '../state.js';
import { pickPieces } from '../pieces.js';

export const DEFAULT_DURATION_MS = 90_000;

export function startTimeAttack({ seed, durationMs = DEFAULT_DURATION_MS } = {}) {
  return createGame({
    seed: seed ?? Date.now(),
    mode: 'timeAttack',
    pickFn: (game) => pickPieces(game.rng, 3, game.score),
    timeLimit: durationMs,
    metadata: { durationMs },
  });
}
