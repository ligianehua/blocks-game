export function createReplay(seed, mode = 'classic') {
  return {
    seed,
    mode,
    startedAt: Date.now(),
    placements: [],
  };
}

export function recordPlacement(replay, pieceId, r, c) {
  replay.placements.push({ pieceId, r, c, t: Date.now() - replay.startedAt });
}

export function popPlacement(replay) {
  return replay.placements.pop() ?? null;
}

export function serialize(replay) {
  return JSON.stringify(replay);
}

export function deserialize(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
