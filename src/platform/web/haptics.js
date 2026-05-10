let enabled = true;

export function setEnabled(value) {
  enabled = !!value;
}

export function isEnabled() {
  return enabled;
}

export function vibrate(pattern) {
  if (!enabled) return;
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* noop */
  }
}

export const PATTERNS = {
  place: 8,
  clear: [12, 30, 12],
  combo: [20, 20, 60],
  gameover: [40, 60, 40, 60, 40],
};
