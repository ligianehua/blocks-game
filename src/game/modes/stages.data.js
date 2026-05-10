/**
 * Stage definitions. P1 ships 12 starter levels.
 * Schema:
 *   id:          number, sequential
 *   target:      { score?, lines? } — meeting any target wins
 *   init:        [[r, c], ...] obstacle cells (rendered as tier 3)
 *   moveBudget:  optional max placements; null = unlimited
 *   stars:       [bestMoves, goodMoves] thresholds for 3/2 stars; 1 star always granted on win
 */

export const LEVELS = [
  { id: 1, target: { score: 200 }, init: [], moveBudget: null, stars: [8, 14] },
  { id: 2, target: { score: 400 }, init: [], moveBudget: null, stars: [12, 22] },
  { id: 3, target: { score: 300 }, init: [[7, 0], [7, 1], [7, 2], [7, 3]], moveBudget: null, stars: [10, 18] },
  { id: 4, target: { lines: 3 }, init: [], moveBudget: null, stars: [8, 14] },
  { id: 5, target: { score: 600 }, init: [[3, 3], [3, 4], [4, 3], [4, 4]], moveBudget: null, stars: [16, 26] },
  { id: 6, target: { lines: 5 }, init: [], moveBudget: null, stars: [12, 22] },
  { id: 7, target: { score: 800 }, init: [[0, 0], [0, 7], [7, 0], [7, 7]], moveBudget: null, stars: [20, 32] },
  { id: 8, target: { score: 500 }, init: [], moveBudget: 25, stars: [12, 18] },
  { id: 9, target: { lines: 8 }, init: [], moveBudget: null, stars: [16, 28] },
  { id: 10, target: { score: 1000 }, init: [[6, 0], [6, 1], [6, 2], [6, 3], [6, 4]], moveBudget: null, stars: [22, 36] },
  { id: 11, target: { score: 1200 }, init: [], moveBudget: 30, stars: [20, 26] },
  { id: 12, target: { score: 1500 }, init: [[0, 3], [0, 4], [7, 3], [7, 4]], moveBudget: null, stars: [28, 44] },
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) ?? null;
}

export function rateStars(level, placementsMade) {
  const [best, good] = level.stars;
  if (placementsMade <= best) return 3;
  if (placementsMade <= good) return 2;
  return 1;
}

export function isTargetMet(level, game) {
  const t = level.target;
  if (t.score !== undefined && game.score >= t.score) return true;
  if (t.lines !== undefined && game.linesCleared >= t.lines) return true;
  return false;
}
