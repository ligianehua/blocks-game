const VERSION_KEY = 'bg.version';
const CURRENT_VERSION = 1;

const memoryFallback = new Map();
let useMemory = false;

function backend() {
  if (useMemory) return null;
  try {
    const test = '__bg_probe__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return localStorage;
  } catch {
    useMemory = true;
    return null;
  }
}

export function rawGet(key) {
  const ls = backend();
  if (ls) {
    try {
      return ls.getItem(key);
    } catch {
      return null;
    }
  }
  return memoryFallback.get(key) ?? null;
}

export function rawSet(key, value) {
  const ls = backend();
  if (ls) {
    try {
      ls.setItem(key, value);
      return true;
    } catch {
      useMemory = true;
    }
  }
  memoryFallback.set(key, value);
  return true;
}

export function rawRemove(key) {
  const ls = backend();
  if (ls) {
    try {
      ls.removeItem(key);
    } catch {
      /* noop */
    }
  }
  memoryFallback.delete(key);
}

export function get(key, fallback = null) {
  const raw = rawGet(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function set(key, value) {
  return rawSet(key, JSON.stringify(value));
}

export function remove(key) {
  rawRemove(key);
}

const MIGRATIONS = {
  // Future: 1: (state) => ({ ...state, newField: defaultValue }),
};

export function runMigrations() {
  const stored = parseInt(rawGet(VERSION_KEY) ?? '0', 10);
  if (stored === CURRENT_VERSION) return;
  for (let v = stored; v < CURRENT_VERSION; v++) {
    const fn = MIGRATIONS[v];
    if (fn) fn();
  }
  rawSet(VERSION_KEY, String(CURRENT_VERSION));
}

export function onCrossTabChange(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = (e) => {
    if (!e.key || !e.key.startsWith('bg.')) return;
    handler(e.key, e.newValue);
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
