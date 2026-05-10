import { createGame } from '../state.js';
import { pickPieces } from '../pieces.js';

export function startClassic({ seed } = {}) {
  return createGame({
    seed: seed ?? Date.now(),
    mode: 'classic',
    pickFn: (game) => pickPieces(game.rng, 3, game.score),
  });
}
