export function emptyStats() {
  return {
    games: { classic: 0, daily: 0, stages: 0, timeAttack: 0, total: 0 },
    won: { stages: 0 },
    score: { total: 0, best: 0, bestByMode: {} },
    bestCombo: 0,
    linesCleared: 0,
    placements: 0,
    timeMs: 0,
    firstPlayedAt: null,
    lastPlayedAt: null,
  };
}

export function recordGameOver(stats, { mode, score, won, bestCombo, linesCleared, placements, durationMs }) {
  const s = stats ?? emptyStats();
  s.games[mode] = (s.games[mode] ?? 0) + 1;
  s.games.total++;
  if (mode === 'stages' && won) s.won.stages++;
  s.score.total += score;
  s.score.best = Math.max(s.score.best, score);
  s.score.bestByMode[mode] = Math.max(s.score.bestByMode[mode] ?? 0, score);
  s.bestCombo = Math.max(s.bestCombo, bestCombo ?? 0);
  s.linesCleared += linesCleared ?? 0;
  s.placements += placements ?? 0;
  s.timeMs += durationMs ?? 0;
  if (!s.firstPlayedAt) s.firstPlayedAt = Date.now();
  s.lastPlayedAt = Date.now();
  return s;
}

export function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
