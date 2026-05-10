export const ACHIEVEMENTS = [
  {
    id: 'first_play',
    icon: '🌱',
    check: ({ stats }) => stats.games.total >= 1,
  },
  {
    id: 'first_clear',
    icon: '✨',
    check: ({ stats }) => stats.linesCleared >= 1,
  },
  {
    id: 'score_1k',
    icon: '⭐',
    check: ({ stats }) => stats.score.best >= 1_000,
  },
  {
    id: 'score_5k',
    icon: '🏆',
    check: ({ stats }) => stats.score.best >= 5_000,
  },
  {
    id: 'score_10k',
    icon: '👑',
    check: ({ stats }) => stats.score.best >= 10_000,
  },
  {
    id: 'combo_5',
    icon: '🔥',
    check: ({ stats }) => stats.bestCombo >= 5,
  },
  {
    id: 'combo_10',
    icon: '💥',
    check: ({ stats }) => stats.bestCombo >= 10,
  },
  {
    id: 'full_clear',
    icon: '🌟',
    check: ({ flags }) => !!flags.everFullClear,
  },
  {
    id: 'lines_100',
    icon: '🧱',
    check: ({ stats }) => stats.linesCleared >= 100,
  },
  {
    id: 'lines_500',
    icon: '🏗',
    check: ({ stats }) => stats.linesCleared >= 500,
  },
  {
    id: 'stages_all',
    icon: '🎖',
    check: ({ stages }) => stages.completedCount >= 12,
  },
  {
    id: 'stages_perfect',
    icon: '🏅',
    check: ({ stages }) => stages.totalStars >= 36,
  },
  {
    id: 'daily_7',
    icon: '📅',
    check: ({ checkin }) => (checkin?.bestStreak ?? 0) >= 7,
  },
  {
    id: 'time_500',
    icon: '⚡',
    check: ({ stats }) => (stats.score.bestByMode?.timeAttack ?? 0) >= 500,
  },
  {
    id: 'time_1500',
    icon: '🚀',
    check: ({ stats }) => (stats.score.bestByMode?.timeAttack ?? 0) >= 1500,
  },
];

export function evaluate(unlockedIds, world) {
  const set = new Set(unlockedIds);
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (set.has(ach.id)) continue;
    try {
      if (ach.check(world)) {
        set.add(ach.id);
        newlyUnlocked.push(ach);
      }
    } catch {
      /* skip on missing world fields */
    }
  }
  return { ids: Array.from(set), newlyUnlocked };
}

export function getById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id) ?? null;
}
