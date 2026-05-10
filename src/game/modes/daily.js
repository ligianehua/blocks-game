import { createGame } from '../state.js';
import { pickPieces } from '../pieces.js';
import { mulberry32, dailySeed } from '../../core/rng.js';

const QUEUE_GROUPS = 80;

const DIFFICULTY_BIAS = {
  easy: 0,
  normal: 1500,
  hard: 4000,
};

export const DIFFICULTIES = ['easy', 'normal', 'hard'];

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startDaily({ date = new Date(), difficulty = 'normal' } = {}) {
  const key = dateKey(date);
  const seed = dailySeed(date, difficulty);
  const queueRng = mulberry32(seed);
  const bias = DIFFICULTY_BIAS[difficulty] ?? DIFFICULTY_BIAS.normal;

  const queue = [];
  for (let i = 0; i < QUEUE_GROUPS; i++) {
    queue.push(...pickPieces(queueRng, 3, bias));
  }
  let cursor = 0;

  return createGame({
    seed,
    mode: 'daily',
    pickFn: () => {
      const out = queue.slice(cursor, cursor + 3);
      cursor += 3;
      while (out.length < 3) out.push(...pickPieces(queueRng, 1, bias));
      return out;
    },
    metadata: { key, difficulty },
  });
}
