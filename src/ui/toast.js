function ensureRoot() {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.className = 'toast-root';
    document.body.appendChild(root);
  }
  return root;
}

export function show(text, { icon } = {}) {
  const root = ensureRoot();
  const el = document.createElement('div');
  el.className = 'toast';
  if (icon) {
    const i = document.createElement('span');
    i.className = 'toast-icon';
    i.textContent = icon;
    el.appendChild(i);
  }
  const t = document.createElement('span');
  t.textContent = text;
  el.appendChild(t);
  root.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
