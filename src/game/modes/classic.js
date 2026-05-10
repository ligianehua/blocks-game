import { createGame } from '../state.js';

export function startClassic({ seed } = {}) {
  return createGame({ seed: seed ?? Date.now(), mode: 'classic' });
}
