import { createBoard, tryPlace, applyClears, isAnyPiecePlaceable } from './board.js';
import { pickPieces } from './pieces.js';
import { placementScore, clearScore } from './score.js';
import { createReplay, recordPlacement } from './replay.js';
import { mulberry32 } from '../core/rng.js';
import { emit } from '../core/events.js';

export function createGame({ seed = Date.now(), mode = 'classic' } = {}) {
  const rng = mulberry32(seed);
  const game = {
    seed,
    mode,
    rng,
    board: createBoard(),
    tray: [],
    traySlotsUsed: [false, false, false],
    score: 0,
    combo: 0,
    bestCombo: 0,
    linesCleared: 0,
    placementsMade: 0,
    over: false,
    replay: createReplay(seed, mode),
  };
  refillTray(game);
  return game;
}

export function refillTray(game) {
  game.tray = pickPieces(game.rng, 3, game.score);
  game.traySlotsUsed = [false, false, false];
  emit('trayRefilled', { tray: game.tray });
  if (!isAnyPiecePlaceable(game.board, game.tray)) {
    game.over = true;
    emit('gameOver', { score: game.score, bestCombo: game.bestCombo });
  }
}

export function placePiece(game, slotIdx, r, c) {
  if (game.over) return { ok: false, reason: 'over' };
  if (game.traySlotsUsed[slotIdx]) return { ok: false, reason: 'used' };
  const piece = game.tray[slotIdx];
  if (!piece) return { ok: false, reason: 'empty' };

  const placed = tryPlace(game.board, piece, r, c, piece.tier);
  if (!placed) return { ok: false, reason: 'invalid' };

  game.board = placed;
  game.traySlotsUsed[slotIdx] = true;
  game.score += placementScore(piece);
  game.placementsMade++;
  recordPlacement(game.replay, piece.id, r, c);
  emit('piecePlaced', { piece, slotIdx, r, c, score: game.score });

  const result = applyClears(game.board);
  if (result.cleared) {
    game.board = result.board;
    game.combo++;
    if (game.combo > game.bestCombo) game.bestCombo = game.combo;
    game.linesCleared += result.rows.length + result.cols.length;
    const { gained, breakdown } = clearScore(
      { rows: result.rows, cols: result.cols },
      game.combo,
      result.emptyAfter,
    );
    game.score += gained;
    emit('linesCleared', {
      rows: result.rows,
      cols: result.cols,
      combo: game.combo,
      gained,
      breakdown,
      emptyAfter: result.emptyAfter,
      score: game.score,
    });
  } else {
    game.combo = 0;
  }

  if (game.traySlotsUsed.every(Boolean)) {
    refillTray(game);
  } else if (!isAnyPiecePlaceable(game.board, remainingTray(game))) {
    game.over = true;
    emit('gameOver', { score: game.score, bestCombo: game.bestCombo });
  }

  return { ok: true, score: game.score };
}

export function remainingTray(game) {
  return game.tray.filter((_, i) => !game.traySlotsUsed[i]);
}

export function snapshot(game) {
  return {
    seed: game.seed,
    mode: game.mode,
    score: game.score,
    combo: game.combo,
    bestCombo: game.bestCombo,
    linesCleared: game.linesCleared,
    placementsMade: game.placementsMade,
    cells: Array.from(game.board.cells),
    occupancy: game.board.occupancy.toString(),
    tray: game.tray.map((p) => p.id),
    traySlotsUsed: game.traySlotsUsed.slice(),
    over: game.over,
  };
}
