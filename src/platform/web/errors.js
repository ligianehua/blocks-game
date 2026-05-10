/**
 * Lightweight error reporter. Captures window.onerror + unhandledrejection.
 * Maintains a localStorage ring buffer of the last 20 errors for diagnostics.
 *
 * To swap in Sentry: replace the `report()` body with `Sentry.captureException`.
 */

const KEY = 'bg.errors';
const MAX = 20;

function readBuffer() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeBuffer(buf) {
  try {
    localStorage.setItem(KEY, JSON.stringify(buf));
  } catch {
    /* noop */
  }
}

function report(record) {
  const buf = readBuffer();
  buf.push(record);
  if (buf.length > MAX) buf.splice(0, buf.length - MAX);
  writeBuffer(buf);
  if (typeof console !== 'undefined') {
    console.error('[bg-errors]', record);
  }
}

export function install() {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (event) => {
    report({
      kind: 'error',
      message: event.message,
      source: event.filename,
      line: event.lineno,
      col: event.colno,
      stack: event.error?.stack,
      ts: Date.now(),
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    report({
      kind: 'rejection',
      message: String(event.reason?.message ?? event.reason),
      stack: event.reason?.stack,
      ts: Date.now(),
    });
  });
}

export function recent() {
  return readBuffer();
}

export function clear() {
  writeBuffer([]);
}
