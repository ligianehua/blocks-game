import { createGame } from '../state.js';
import { pickPieces, getById } from '../pieces.js';
import { tryPlace } from '../board.js';
import { getLevel, isTargetMet } from './stages.data.js';

export { LEVELS, getLevel, rateStars, isTargetMet } from './stages.data.js';

export function startStage(levelId, { seed } = {}) {
  const level = getLevel(levelId);
  if (!level) throw new Error(`Unknown level: ${levelId}`);
  const stageSeed = seed ?? 12345 + levelId * 7919;

  return createGame({
    seed: stageSeed,
    mode: 'stages',
    pickFn: (game) => pickPieces(game.rng, 3, game.score),
    initBoard: (game) => {
      const dot = getById('dot');
      for (const [r, c] of level.init) {
        const next = tryPlace(game.board, dot, r, c, 3);
        if (next) game.board = next;
      }
    },
    extraEndCheck: (game) => {
      if (isTargetMet(level, game)) return { over: true, won: true };
      if (level.moveBudget !== null && game.placementsMade >= level.moveBudget) {
        return { over: true, won: false };
      }
      return null;
    },
    metadata: { levelId, target: level.target, moveBudget: level.moveBudget, stars: level.stars },
  });
}
