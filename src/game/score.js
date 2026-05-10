import { BOARD_SIZE } from '../core/bitboard.js';

const LINE_BASE = 10;
const CROSS_BONUS = 50;
const FULL_CLEAR_BONUS = 300;

const COMBO_MULTIPLIER = [1, 1, 1.2, 1.5, 2, 3];

function multiLineMultiplier(lineCount) {
  if (lineCount <= 1) return 1;
  if (lineCount === 2) return 1.5;
  if (lineCount === 3) return 2;
  return 3;
}

function comboMultiplier(combo) {
  if (combo <= 0) return 1;
  return COMBO_MULTIPLIER[Math.min(combo, COMBO_MULTIPLIER.length - 1)];
}

export function placementScore(piece) {
  return piece.size;
}

export function clearScore({ rows, cols }, combo, boardEmptyAfter) {
  const lineCount = rows.length + cols.length;
  if (lineCount === 0) return { gained: 0, breakdown: { lines: 0 } };

  const cellsCleared = lineCount * BOARD_SIZE;
  const base = LINE_BASE * cellsCleared;
  const lineMul = multiLineMultiplier(lineCount);
  const comboMul = comboMultiplier(combo);
  let gained = Math.round(base * lineMul * comboMul);

  const cross = rows.length > 0 && cols.length > 0 ? CROSS_BONUS : 0;
  const fullClear = boardEmptyAfter ? FULL_CLEAR_BONUS : 0;
  gained += cross + fullClear;

  return {
    gained,
    breakdown: {
      lines: lineCount,
      base,
      lineMul,
      comboMul,
      cross,
      fullClear,
    },
  };
}

export const MILESTONES = [2000, 3000, 4000, 5000, 8000, 10000, 20000, 50000];

export function nextMilestone(score) {
  return MILESTONES.find((m) => m > score) ?? null;
}

export function progressToNext(score) {
  const next = nextMilestone(score);
  if (next === null) return 1;
  const prev = [...MILESTONES].reverse().find((m) => m <= score) ?? 0;
  return (score - prev) / (next - prev);
}
