import { t } from '../platform/web/i18n.js';

let popupRoot = null;

function ensureRoot() {
  if (popupRoot) return popupRoot;
  popupRoot = document.createElement('div');
  popupRoot.className = 'popup-root';
  document.body.appendChild(popupRoot);
  return popupRoot;
}

export function scorePopup(text, x, y, variant = 'default') {
  const root = ensureRoot();
  const el = document.createElement('div');
  el.className = `score-popup variant-${variant}`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  root.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

export function comboBubble(combo, anchorEl) {
  if (combo < 1) return;
  const root = ensureRoot();
  const rect = anchorEl?.getBoundingClientRect();
  const el = document.createElement('div');
  el.className = `combo-badge tier-${Math.min(combo, 5)}`;
  el.textContent = `x${combo}`;
  if (rect) {
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top + rect.height / 2}px`;
  } else {
    el.style.left = '50%';
    el.style.top = '40%';
  }
  root.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

export function fullClearBanner(anchorEl) {
  const root = ensureRoot();
  const el = document.createElement('div');
  el.className = 'fullclear-banner';
  el.textContent = t('fullClear.label');
  const rect = anchorEl?.getBoundingClientRect();
  if (rect) {
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top + rect.height / 2}px`;
  }
  root.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

export function shake(el, ms = 300) {
  if (!el) return;
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), ms);
}
