let ctx = null;
let unlocked = false;
const muted = { music: false, sfx: false };

function ensureCtx() {
  if (ctx) return ctx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  ctx = new Ctx();
  return ctx;
}

export function unlock() {
  const c = ensureCtx();
  if (!c || unlocked) return;
  if (c.state === 'suspended') {
    c.resume().catch(() => {});
  }
  unlocked = true;
}

export function setMuted(category, value) {
  muted[category] = !!value;
}

export function isMuted(category) {
  return !!muted[category];
}

function tone(freq, durationMs, type = 'sine', gain = 0.1) {
  const c = ensureCtx();
  if (!c || muted.sfx) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(c.destination);
  const now = c.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

export function play(name) {
  switch (name) {
    case 'place':
      tone(440, 80, 'square', 0.05);
      break;
    case 'clear':
      tone(660, 120, 'sine', 0.08);
      setTimeout(() => tone(880, 120, 'sine', 0.08), 60);
      break;
    case 'combo':
      tone(880, 100, 'sine', 0.1);
      setTimeout(() => tone(1100, 100, 'sine', 0.1), 50);
      setTimeout(() => tone(1320, 140, 'sine', 0.1), 100);
      break;
    case 'gameover':
      tone(330, 200, 'sawtooth', 0.08);
      setTimeout(() => tone(220, 280, 'sawtooth', 0.08), 150);
      break;
    case 'newrecord':
      tone(880, 120, 'sine', 0.1);
      setTimeout(() => tone(1100, 120, 'sine', 0.1), 100);
      setTimeout(() => tone(1320, 120, 'sine', 0.1), 200);
      setTimeout(() => tone(1760, 200, 'sine', 0.12), 300);
      break;
    default:
      break;
  }
}
