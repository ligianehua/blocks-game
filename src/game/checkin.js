function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  da.setHours(0, 0, 0, 0);
  db.setHours(0, 0, 0, 0);
  return Math.round((db - da) / 86_400_000);
}

export function emptyCheckin() {
  return { lastDay: null, streak: 0, bestStreak: 0, totalDays: 0, history: [] };
}

export function checkInToday(state, today = new Date()) {
  const s = state ? { ...state } : emptyCheckin();
  const todayKey = dayKey(today);
  if (s.lastDay === todayKey) {
    return { state: s, alreadyChecked: true, reward: null };
  }
  const gap = s.lastDay ? daysBetween(s.lastDay, todayKey) : null;
  if (gap === 1) {
    s.streak += 1;
  } else {
    s.streak = 1;
  }
  s.lastDay = todayKey;
  s.bestStreak = Math.max(s.bestStreak, s.streak);
  s.totalDays += 1;
  s.history = [...(s.history ?? []), todayKey].slice(-30);

  const reward = computeReward(s.streak);
  return { state: s, alreadyChecked: false, reward };
}

export function computeReward(streak) {
  if (streak >= 7) return { type: 'extras', undos: 2, hints: 2 };
  if (streak >= 3) return { type: 'extras', undos: 1, hints: 1 };
  return { type: 'extras', undos: 1, hints: 0 };
}

export { dayKey };
