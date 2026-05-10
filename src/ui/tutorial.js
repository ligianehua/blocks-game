import { t, onChange } from '../platform/web/i18n.js';
import { openModal, closeModal } from './modal.js';

const STEPS = ['tutorial.step1', 'tutorial.step2', 'tutorial.step3'];
let cursor = 0;

function render() {
  const stepEl = document.getElementById('tutorial-step');
  const dotsEl = document.getElementById('tutorial-dots');
  if (!stepEl || !dotsEl) return;
  stepEl.textContent = t(STEPS[cursor]);
  dotsEl.innerHTML = '';
  for (let i = 0; i < STEPS.length; i++) {
    const dot = document.createElement('span');
    if (i === cursor) dot.classList.add('active');
    dotsEl.appendChild(dot);
  }
  const nextBtn = document.querySelector('[data-action="tutorial-next"]');
  if (nextBtn) nextBtn.textContent = cursor === STEPS.length - 1 ? t('tutorial.done') : t('tutorial.next');
  const prevBtn = document.querySelector('[data-action="tutorial-prev"]');
  if (prevBtn) prevBtn.disabled = cursor === 0;
}

export function start() {
  cursor = 0;
  openModal('tutorial-modal');
  render();
}

export function next(onComplete) {
  if (cursor < STEPS.length - 1) {
    cursor++;
    render();
  } else {
    closeModal('tutorial-modal');
    onComplete?.();
  }
}

export function prev() {
  if (cursor > 0) {
    cursor--;
    render();
  }
}

export function close() {
  closeModal('tutorial-modal');
}

onChange(() => {
  if (!document.getElementById('tutorial-modal')?.hidden) render();
});
