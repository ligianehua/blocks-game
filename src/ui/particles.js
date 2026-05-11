let root = null;

function ensureRoot() {
  if (root) return root;
  root = document.createElement('div');
  root.className = 'fx-root';
  document.body.appendChild(root);
  return root;
}

export function burst(x, y, { count = 8, color = '#ffd54a', size = 8 } = {}) {
  const host = ensureRoot();
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const dist = 30 + Math.random() * 40;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 10;
    const rot = (Math.random() - 0.5) * 360;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.background = color;
    p.style.setProperty('--dx', `${dx}px`);
    p.style.setProperty('--dy', `${dy}px`);
    p.style.setProperty('--rot', `${rot}deg`);
    host.appendChild(p);
    setTimeout(() => p.remove(), 720);
  }
}

export function shockwave(x, y, color = '#ffd54a') {
  const host = ensureRoot();
  const ring = document.createElement('div');
  ring.className = 'shockwave';
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.borderColor = color;
  host.appendChild(ring);
  setTimeout(() => ring.remove(), 520);
}
