import './styles/base.css';
import './styles/components.css';

import { on, emit } from './core/events.js';
import { startClassic } from './game/modes/classic.js';
import { placePiece } from './game/state.js';
import { nextMilestone, progressToNext } from './game/score.js';
import {
  initBoard,
  initTray,
  renderBoard,
  renderTray,
  flashLines,
} from './ui/render.js';
import { attachTrayDrag } from './ui/drag.js';
import { openModal, closeModal } from './ui/modal.js';
import { scorePopup, comboBubble, fullClearBanner } from './ui/animations.js';
import * as storage from './platform/web/storage.js';
import * as audio from './platform/web/audio.js';
import * as haptics from './platform/web/haptics.js';
import * as i18n from './platform/web/i18n.js';
import * as analytics from './platform/web/analytics.js';

const KEYS = {
  best: 'bg.highScore',
  settings: 'bg.settings',
  save: 'bg.save',
  stats: 'bg.stats',
};

let game = null;
let bestScore = 0;
let settings = {
  music: true,
  sfx: true,
  haptics: true,
  language: null,
};

function loadSettings() {
  const stored = storage.get(KEYS.settings, {});
  settings = { ...settings, ...stored };
  audio.setMuted('music', !settings.music);
  audio.setMuted('sfx', !settings.sfx);
  haptics.setEnabled(settings.haptics);
}

function saveSettings() {
  storage.set(KEYS.settings, settings);
}

function loadBest() {
  bestScore = storage.get(KEYS.best, 0);
  document.getElementById('best-score').textContent = bestScore;
}

function updateScoreUi(score) {
  document.getElementById('current-score').textContent = score;
  const next = nextMilestone(score);
  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = `${Math.min(100, progressToNext(score) * 100)}%`;
  if (next === null && fill) fill.style.width = '100%';
}

function refreshBoardAndTray() {
  if (!game) return;
  renderBoard(game.board);
  renderTray(game.tray, game.traySlotsUsed);
  updateScoreUi(game.score);
}

function newGame() {
  game = startClassic();
  refreshBoardAndTray();
  storage.remove(KEYS.save);
  closeModal('gameover-modal');
  closeModal('settings-modal');
  analytics.track('game_start', { mode: 'classic' });
}

function handlePlace(slotIdx, r, c) {
  if (!game) return;
  audio.unlock();
  const result = placePiece(game, slotIdx, r, c);
  if (!result.ok) return;
  refreshBoardAndTray();
  audio.play('place');
  haptics.vibrate(haptics.PATTERNS.place);
  persistSave();
}

function persistSave() {
  if (!game || game.over) {
    storage.remove(KEYS.save);
    return;
  }
  storage.set(KEYS.save, {
    score: game.score,
    cells: Array.from(game.board.cells),
    occupancy: game.board.occupancy.toString(),
    tray: game.tray.map((p) => p.id),
    traySlotsUsed: game.traySlotsUsed,
    seed: game.seed,
  });
}

function syncSettingsToUi() {
  document.getElementById('toggle-music').checked = settings.music;
  document.getElementById('toggle-sfx').checked = settings.sfx;
  document.getElementById('toggle-haptics').checked = settings.haptics;
  document.getElementById('select-language').value = i18n.getLocale();
}

function bindUi() {
  document.getElementById('btn-settings').addEventListener('click', () => {
    syncSettingsToUi();
    openModal('settings-modal');
  });

  document.getElementById('btn-daily').addEventListener('click', () => {
    alert(i18n.t('daily.comingSoon'));
  });

  document.getElementById('toggle-music').addEventListener('change', (e) => {
    settings.music = e.target.checked;
    audio.setMuted('music', !settings.music);
    saveSettings();
  });
  document.getElementById('toggle-sfx').addEventListener('change', (e) => {
    settings.sfx = e.target.checked;
    audio.setMuted('sfx', !settings.sfx);
    saveSettings();
  });
  document.getElementById('toggle-haptics').addEventListener('change', (e) => {
    settings.haptics = e.target.checked;
    haptics.setEnabled(settings.haptics);
    saveSettings();
  });
  document.getElementById('select-language').addEventListener('change', (e) => {
    settings.language = e.target.value;
    i18n.setLocale(e.target.value);
    saveSettings();
  });

  document.body.addEventListener('click', (e) => {
    const action = e.target?.dataset?.action;
    if (action === 'close-settings') closeModal('settings-modal');
    if (action === 'restart') newGame();
  });

  storage.onCrossTabChange((key) => {
    if (key === KEYS.best) loadBest();
    if (key === KEYS.settings) {
      loadSettings();
      syncSettingsToUi();
    }
  });
}

function bindGameEvents() {
  on('linesCleared', ({ rows, cols, combo, gained, emptyAfter }) => {
    flashLines(rows, cols);
    audio.play(combo >= 2 ? 'combo' : 'clear');
    haptics.vibrate(combo >= 2 ? haptics.PATTERNS.combo : haptics.PATTERNS.clear);
    const board = document.getElementById('board');
    const rect = board.getBoundingClientRect();
    scorePopup(`+${gained}`, rect.left + rect.width / 2, rect.top + rect.height / 2, 'clear');
    if (combo >= 2) comboBubble(combo, board);
    if (emptyAfter) fullClearBanner(board);
    analytics.track('lines_cleared', { rows: rows.length, cols: cols.length, combo, gained });
  });

  on('gameOver', ({ score, bestCombo }) => {
    audio.play('gameover');
    haptics.vibrate(haptics.PATTERNS.gameover);
    const wasRecord = score > bestScore;
    if (wasRecord) {
      bestScore = score;
      storage.set(KEYS.best, bestScore);
      document.getElementById('best-score').textContent = bestScore;
      audio.play('newrecord');
    }
    document.getElementById('gameover-final').textContent = score;
    document.getElementById('gameover-newrecord').hidden = !wasRecord;
    storage.remove(KEYS.save);
    openModal('gameover-modal');
    analytics.track('game_over', { score, bestCombo, wasRecord });
  });
}

function bootstrap() {
  storage.runMigrations();
  loadSettings();
  i18n.init(settings.language);
  loadBest();
  initBoard(document.getElementById('board'));
  initTray(document.getElementById('tray'));
  bindUi();
  bindGameEvents();
  attachTrayDrag({ getGame: () => game, onPlace: handlePlace });
  i18n.onChange(() => i18n.applyDom());

  newGame();
}

document.addEventListener('DOMContentLoaded', bootstrap);
