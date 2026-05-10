const KEEP = 10;

export function emptyBoard() {
  return { classic: [], daily: [], stages: [], timeAttack: [] };
}

export function recordScore(board, mode, score, meta = {}) {
  const next = { ...emptyBoard(), ...board };
  const entries = next[mode] ?? [];
  entries.push({ score, ts: Date.now(), ...meta });
  entries.sort((a, b) => b.score - a.score);
  next[mode] = entries.slice(0, KEEP);
  return next;
}

export function rankFor(board, mode, score) {
  const entries = board?.[mode] ?? [];
  let rank = 1;
  for (const e of entries) {
    if (score > e.score) break;
    rank++;
  }
  return rank;
}
