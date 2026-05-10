import { createBoard, tryPlace, applyClears, isAnyPiecePlaceable } from './board.js';
import { pickPieces } from './pieces.js';
import { placementScore, clearScore } from './score.js';
import { createReplay, recordPlacement } from './replay.js';
import { mulberry32 } from '../core/rng.js';
import { canPlace, BOARD_SIZE } from '../core/bitboard.js';
import { emit } from '../core/events.js';

const HISTORY_CAP = 10;

export function createGame({
  seed = Date.now(),
  mode = 'classic',
  pickFn = null,
  initBoard = null,
  extraEndCheck = null,
  timeLimit = null,
  undosLeft = 3,
  hintsLeft = 3,
  metadata = {},
} = {}) {
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
    won: false,
    undosLeft,
    hintsLeft,
    history: [],
    timeLimit,
    timeLeft: timeLimit,
    metadata,
    pickFn: pickFn ?? defaultPickFn,
    extraEndCheck,
    replay: createReplay(seed, mode),
  };
  if (initBoard) initBoard(game);
  refillTray(game);
  return game;
}

function defaultPickFn(game) {
  return pickPieces(game.rng, 3, game.score);
}

export function refillTray(game) {
  game.tray = game.pickFn(game);
  game.traySlotsUsed = [false, false, false];
  emit('trayRefilled', { tray: game.tray });
  if (!isAnyPiecePlaceable(game.board, game.tray)) {
    finishGame(game, false);
  }
}

function finishGame(game, won) {
  if (game.over) return;
  game.over = true;
  game.won = won;
  emit('gameOver', { score: game.score, bestCombo: game.bestCombo, won, mode: game.mode, metadata: game.metadata });
}

function pushHistory(game) {
  game.history.push({
    occupancy: game.board.occupancy,
    cells: new Uint8Array(game.board.cells),
    score: game.score,
    combo: game.combo,
    bestCombo: game.bestCombo,
    linesCleared: game.linesCleared,
    placementsMade: game.placementsMade,
    tray: game.tray.slice(),
    traySlotsUsed: game.traySlotsUsed.slice(),
    over: game.over,
    won: game.won,
    replayLen: game.replay.placements.length,
  });
  if (game.history.length > HISTORY_CAP) game.history.shift();
}

export function placePiece(game, slotIdx, r, c) {
  if (game.over) return { ok: false, reason: 'over' };
  if (game.traySlotsUsed[slotIdx]) return { ok: false, reason: 'used' };
  const piece = game.tray[slotIdx];
  if (!piece) return { ok: false, reason: 'empty' };

  const placed = tryPlace(game.board, piece, r, c, piece.tier);
  if (!placed) return { ok: false, reason: 'invalid' };

  pushHistory(game);

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

  if (game.extraEndCheck) {
    const verdict = game.extraEndCheck(game);
    if (verdict?.over) {
      finishGame(game, !!verdict.won);
      return { ok: true, score: game.score };
    }
  }

  if (game.traySlotsUsed.every(Boolean)) {
    refillTray(game);
  } else if (!isAnyPiecePlaceable(game.board, remainingTray(game))) {
    finishGame(game, false);
  }

  return { ok: true, score: game.score };
}

export function undoLast(game) {
  if (game.over) return { ok: false, reason: 'over' };
  if (game.undosLeft <= 0) return { ok: false, reason: 'noUndo' };
  if (game.history.length === 0) return { ok: false, reason: 'empty' };
  const prev = game.history.pop();
  game.board = { occupancy: prev.occupancy, cells: new Uint8Array(prev.cells) };
  game.score = prev.score;
  game.combo = prev.combo;
  game.bestCombo = prev.bestCombo;
  game.linesCleared = prev.linesCleared;
  game.placementsMade = prev.placementsMade;
  game.tray = prev.tray;
  game.traySlotsUsed = prev.traySlotsUsed;
  game.over = prev.over;
  game.won = prev.won;
  game.replay.placements.length = prev.replayLen;
  game.undosLeft--;
  emit('undone', { undosLeft: game.undosLeft });
  return { ok: true, undosLeft: game.undosLeft };
}

export function findHint(game) {
  if (game.over) return null;
  for (let i = 0; i < 3; i++) {
    if (game.traySlotsUsed[i]) continue;
    const piece = game.tray[i];
    if (!piece) continue;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlace(game.board.occupancy, piece.cells, r, c)) {
          return { slotIdx: i, piece, r, c };
        }
      }
    }
  }
  return null;
}

export function useHint(game) {
  if (game.hintsLeft <= 0) return { ok: false, reason: 'noHint' };
  const hint = findHint(game);
  if (!hint) return { ok: false, reason: 'noFit' };
  game.hintsLeft--;
  emit('hintUsed', { hintsLeft: game.hintsLeft, hint });
  return { ok: true, hint, hintsLeft: game.hintsLeft };
}

export function tickTime(game, deltaMs) {
  if (game.over || game.timeLeft === null || game.timeLeft === undefined) return;
  game.timeLeft = Math.max(0, game.timeLeft - deltaMs);
  if (game.timeLeft === 0) finishGame(game, false);
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
    won: game.won,
    undosLeft: game.undosLeft,
    hintsLeft: game.hintsLeft,
    timeLeft: game.timeLeft,
  };
}
