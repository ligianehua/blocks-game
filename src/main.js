import './styles/base.css';
import './styles/themes.css';
import './styles/components.css';

import { on, clear as clearEvents } from './core/events.js';
import { startClassic } from './game/modes/classic.js';
import { startDaily, dateKey, DIFFICULTIES } from './game/modes/daily.js';
import { startTimeAttack, DEFAULT_DURATION_MS } from './game/modes/timeAttack.js';
import { startStage, LEVELS, getLevel, rateStars } from './game/modes/stages.js';
import { placePiece, undoLast, useHint, tickTime } from './game/state.js';
import { nextMilestone, progressToNext } from './game/score.js';
import { emptyStats, recordGameOver, formatDuration } from './game/stats.js';
import {
  initBoard,
  initTray,
  renderBoard,
  renderTray,
  flashLines,
  showHint,
  clearHint,
} from './ui/render.js';
import { attachTrayDrag } from './ui/drag.js';
import { openModal, closeModal, isOpen } from './ui/modal.js';
import { scorePopup, comboBubble, fullClearBanner } from './ui/animations.js';
import * as tutorial from './ui/tutorial.js';
import {
  THEMES,
  applyTheme,
  applyDark,
  applyColorblind,
  isUnlocked,
  isKnownTheme,
} from './ui/theme.js';
import { renderCard, shareOrDownload } from './ui/share.js';
import * as storage from './platform/web/storage.js';
import * as audio from './platform/web/audio.js';
import * as haptics from './platform/web/haptics.js';
import * as i18n from './platform/web/i18n.js';
import * as analytics from './platform/web/analytics.js';
import * as errors from './platform/web/errors.js';

const KEYS = {
  best: 'bg.highScore',
  bestTime: 'bg.timeAttack.high',
  daily: 'bg.daily',
  stages: 'bg.stages',
  settings: 'bg.settings',
  save: 'bg.save',
  tutorialDone: 'bg.tutorialDone',
  stats: 'bg.stats',
};

let game = null;
let gameStartTs = 0;
let mode = 'classic';
let modeOpts = {};
let bestScore = 0;
let timeAttackBest = 0;
let stats = emptyStats();
let timer = null;
let timerStart = 0;
let settings = {
  music: true,
  sfx: true,
  haptics: true,
  language: null,
  theme: 'wood',
  dark: false,
  colorblind: false,
};

let lastResult = null;

function loadSettings() {
  const stored = storage.get(KEYS.settings, {});
  settings = { ...settings, ...stored };
  audio.setMuted('music', !settings.music);
  audio.setMuted('sfx', !settings.sfx);
  haptics.setEnabled(settings.haptics);
  applyDark(!!settings.dark);
  applyColorblind(!!settings.colorblind);
  if (!isUnlocked(settings.theme, bestScore)) settings.theme = 'wood';
  applyTheme(settings.theme);
}

function loadStats() {
  stats = storage.get(KEYS.stats, null) ?? emptyStats();
}

function saveStats() {
  storage.set(KEYS.stats, stats);
}

function saveSettings() {
  storage.set(KEYS.settings, settings);
}

function loadBest() {
  bestScore = storage.get(KEYS.best, 0);
  timeAttackBest = storage.get(KEYS.bestTime, 0);
  document.getElementById('best-score').textContent = bestScore;
}

function dailyKey(key, difficulty) {
  return `${KEYS.daily}.${key}.${difficulty}`;
}

function stageKey(levelId) {
  return `${KEYS.stages}.${levelId}`;
}

function updateScoreUi() {
  document.getElementById('current-score').textContent = game?.score ?? 0;
  const fill = document.getElementById('progress-fill');
  if (fill) {
    fill.style.width = `${Math.min(100, progressToNext(game?.score ?? 0) * 100)}%`;
    if (nextMilestone(game?.score ?? 0) === null) fill.style.width = '100%';
  }
}

function updateActionsUi() {
  const undoBtn = document.getElementById('btn-undo');
  const hintBtn = document.getElementById('btn-hint');
  const undoCount = document.getElementById('undo-count');
  const hintCount = document.getElementById('hint-count');
  if (!game) return;
  undoCount.textContent = game.undosLeft;
  hintCount.textContent = game.hintsLeft;
  undoBtn.disabled = game.undosLeft <= 0 || game.history.length === 0 || game.over;
  hintBtn.disabled = game.hintsLeft <= 0 || game.over;
}

function updateModeBanner() {
  const banner = document.getElementById('mode-banner');
  const labelEl = document.getElementById('mode-banner-label');
  const statusEl = document.getElementById('mode-banner-status');
  if (mode === 'classic') {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
  if (mode === 'daily') {
    labelEl.textContent = i18n.t('mode.labels.daily', { difficulty: i18n.t(`daily.${modeOpts.difficulty}`) });
    statusEl.textContent = '';
  } else if (mode === 'stages') {
    const level = getLevel(modeOpts.levelId);
    labelEl.textContent = i18n.t('mode.labels.stages', { n: modeOpts.levelId });
    if (level.target.score) statusEl.textContent = i18n.t('stages.targetScore', { n: level.target.score });
    else if (level.target.lines) statusEl.textContent = i18n.t('stages.targetLines', { n: level.target.lines });
    if (level.moveBudget) statusEl.textContent += ` · ${i18n.t('stages.moveBudget', { n: level.moveBudget - game.placementsMade })}`;
  } else if (mode === 'timeAttack') {
    const sec = Math.ceil((game?.timeLeft ?? 0) / 1000);
    labelEl.textContent = i18n.t('mode.labels.timeAttack', { sec: '' }).replace(/[·\s]+$/, '');
    statusEl.textContent = `⏱ ${sec}s`;
  }
}

function refreshAll() {
  if (!game) return;
  renderBoard(game.board);
  renderTray(game.tray, game.traySlotsUsed);
  updateScoreUi();
  updateActionsUi();
  updateModeBanner();
}

function stopTimer() {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

function startTimer() {
  stopTimer();
  timerStart = performance.now();
  timer = setInterval(() => {
    if (!game || game.over) {
      stopTimer();
      return;
    }
    const now = performance.now();
    const dt = now - timerStart;
    timerStart = now;
    tickTime(game, dt);
    updateModeBanner();
  }, 250);
}

function newGame() {
  stopTimer();
  if (mode === 'classic') {
    game = startClassic();
  } else if (mode === 'daily') {
    game = startDaily(modeOpts);
  } else if (mode === 'timeAttack') {
    game = startTimeAttack();
    startTimer();
  } else if (mode === 'stages') {
    game = startStage(modeOpts.levelId);
  }
  gameStartTs = performance.now();
  refreshAll();
  closeModal('gameover-modal');
  closeModal('settings-modal');
  closeModal('mode-modal');
  closeModal('daily-modal');
  closeModal('stages-modal');
  if (mode === 'classic') {
    persistSave();
  } else {
    storage.remove(KEYS.save);
  }
  analytics.track('game_start', { mode, ...modeOpts });
}

function handlePlace(slotIdx, r, c) {
  if (!game) return;
  audio.unlock();
  clearHint();
  const result = placePiece(game, slotIdx, r, c);
  if (!result.ok) return;
  refreshAll();
  audio.play('place');
  haptics.vibrate(haptics.PATTERNS.place);
  if (mode === 'classic') persistSave();
}

function handleUndo() {
  if (!game) return;
  const result = undoLast(game);
  if (!result.ok) return;
  refreshAll();
  audio.play('place');
  if (mode === 'classic') persistSave();
}

function handleHint() {
  if (!game) return;
  const result = useHint(game);
  if (!result.ok) return;
  showHint(result.hint.piece, result.hint.r, result.hint.c);
  updateActionsUi();
}

function persistSave() {
  if (!game || game.over || mode !== 'classic') {
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
  document.getElementById('toggle-dark').checked = !!settings.dark;
  document.getElementById('toggle-colorblind').checked = !!settings.colorblind;
  document.getElementById('select-language').value = i18n.getLocale();
  renderThemePicker();
}

function renderThemePicker() {
  const picker = document.getElementById('theme-picker');
  if (!picker) return;
  picker.innerHTML = '';
  for (const theme of THEMES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-swatch';
    btn.dataset.action = 'pick-theme';
    btn.dataset.theme = theme.id;
    btn.title = i18n.t(`theme.${theme.id}`);
    if (settings.theme === theme.id) btn.classList.add('selected');
    const unlocked = isUnlocked(theme.id, bestScore);
    if (!unlocked) {
      btn.classList.add('locked');
      btn.disabled = true;
      btn.dataset.lock = i18n.t('theme.locked', { n: theme.unlockScore });
    }

    const tile = document.createElement('div');
    tile.className = 'theme-swatch-preview';
    tile.dataset.theme = theme.id;
    btn.appendChild(tile);

    const label = document.createElement('span');
    label.className = 'theme-swatch-label';
    label.textContent = i18n.t(`theme.${theme.id}`);
    btn.appendChild(label);

    if (!unlocked) {
      const lock = document.createElement('span');
      lock.className = 'theme-swatch-lock';
      lock.textContent = `🔒 ${theme.unlockScore}`;
      btn.appendChild(lock);
    }
    picker.appendChild(btn);
  }
}

function pickTheme(themeId) {
  if (!isKnownTheme(themeId)) return;
  if (!isUnlocked(themeId, bestScore)) return;
  settings.theme = themeId;
  applyTheme(themeId);
  saveSettings();
  renderThemePicker();
}

function renderDailyModal() {
  const today = new Date();
  const key = dateKey(today);
  document.getElementById('daily-date').textContent = i18n.t('daily.today', { date: key });
  for (const d of DIFFICULTIES) {
    const score = storage.get(dailyKey(key, d), null);
    const el = document.getElementById(`daily-best-${d}`);
    if (el) el.textContent = score === null ? i18n.t('daily.noPlay') : i18n.t('daily.best', { n: score });
  }
}

function renderStagesGrid() {
  const grid = document.getElementById('stage-grid');
  grid.innerHTML = '';
  let unlockedThrough = 1;
  for (const level of LEVELS) {
    const record = storage.get(stageKey(level.id), null);
    if (record && record.stars > 0) unlockedThrough = Math.max(unlockedThrough, level.id + 1);
  }
  for (const level of LEVELS) {
    const record = storage.get(stageKey(level.id), null);
    const locked = level.id > unlockedThrough;
    const cell = document.createElement('button');
    cell.className = 'stage-cell';
    if (locked) cell.classList.add('locked');
    if (record?.stars > 0) cell.classList.add('completed');
    cell.disabled = locked;
    cell.dataset.action = 'start-stage';
    cell.dataset.levelId = level.id;
    const num = document.createElement('div');
    num.textContent = level.id;
    const stars = document.createElement('div');
    stars.className = 'stage-stars';
    if (locked) stars.textContent = '🔒';
    else stars.textContent = '★'.repeat(record?.stars ?? 0).padEnd(3, '☆');
    cell.appendChild(num);
    cell.appendChild(stars);
    grid.appendChild(cell);
  }
}

function persistResult(score, won) {
  if (mode === 'classic') {
    if (score > bestScore) {
      bestScore = score;
      storage.set(KEYS.best, bestScore);
      document.getElementById('best-score').textContent = bestScore;
      return true;
    }
  } else if (mode === 'timeAttack') {
    if (score > timeAttackBest) {
      timeAttackBest = score;
      storage.set(KEYS.bestTime, timeAttackBest);
      return true;
    }
  } else if (mode === 'daily') {
    const k = dailyKey(modeOpts.key ?? dateKey(new Date()), modeOpts.difficulty);
    const prev = storage.get(k, 0);
    if (score > prev) {
      storage.set(k, score);
      return true;
    }
  } else if (mode === 'stages') {
    const k = stageKey(modeOpts.levelId);
    const level = getLevel(modeOpts.levelId);
    const stars = won ? rateStars(level, game.placementsMade) : 0;
    const prev = storage.get(k, { stars: 0, score: 0 });
    if (won && (stars > prev.stars || score > prev.score)) {
      storage.set(k, { stars: Math.max(stars, prev.stars), score: Math.max(score, prev.score) });
      return true;
    }
  }
  return false;
}

function showGameOver({ score, won }) {
  stopTimer();
  audio.play(won ? 'newrecord' : 'gameover');
  haptics.vibrate(haptics.PATTERNS.gameover);
  const wasRecord = persistResult(score, won);
  if (wasRecord && mode === 'classic') audio.play('newrecord');

  const durationMs = Math.max(0, performance.now() - gameStartTs);
  stats = recordGameOver(stats, {
    mode,
    score,
    won,
    bestCombo: game?.bestCombo ?? 0,
    linesCleared: game?.linesCleared ?? 0,
    placements: game?.placementsMade ?? 0,
    durationMs,
  });
  saveStats();

  const titleEl = document.getElementById('gameover-title');
  titleEl.textContent = won ? i18n.t('gameover.won') : i18n.t('gameover.title');
  document.getElementById('gameover-final').textContent = score;
  document.getElementById('gameover-newrecord').hidden = !wasRecord;

  const starsEl = document.getElementById('gameover-stars');
  if (mode === 'stages' && won) {
    const level = getLevel(modeOpts.levelId);
    const stars = rateStars(level, game.placementsMade);
    starsEl.textContent = '★'.repeat(stars).padEnd(3, '☆');
    starsEl.hidden = false;
  } else {
    starsEl.hidden = true;
  }

  lastResult = {
    score,
    won,
    bestCombo: game?.bestCombo ?? 0,
    linesCleared: game?.linesCleared ?? 0,
    mode,
    modeLabel: modeLabel(),
    dateStr: new Date().toLocaleDateString(),
  };

  if (mode === 'classic') storage.remove(KEYS.save);
  openModal('gameover-modal');
  analytics.track('game_over', { mode, score, won });
}

function modeLabel() {
  if (mode === 'classic') return i18n.t('mode.labels.classic');
  if (mode === 'daily') return i18n.t('mode.labels.daily', { difficulty: i18n.t(`daily.${modeOpts.difficulty}`) });
  if (mode === 'stages') return i18n.t('mode.labels.stages', { n: modeOpts.levelId });
  if (mode === 'timeAttack') return i18n.t('mode.labels.timeAttack', { sec: Math.round((modeOpts.durationMs ?? DEFAULT_DURATION_MS) / 1000) });
  return mode;
}

async function handleShare() {
  if (!lastResult) return;
  const canvas = renderCard(lastResult);
  await shareOrDownload(canvas);
}

function renderStatsModal() {
  const body = document.getElementById('stats-body');
  if (!body) return;
  body.innerHTML = '';

  if (!stats || stats.games.total === 0) {
    const p = document.createElement('p');
    p.className = 'stats-empty';
    p.textContent = i18n.t('stats.noData');
    body.appendChild(p);
    return;
  }

  const rows = [
    [i18n.t('stats.totalGames'), stats.games.total],
    [`· ${i18n.t('mode.classic')}`, stats.games.classic ?? 0],
    [`· ${i18n.t('mode.daily')}`, stats.games.daily ?? 0],
    [`· ${i18n.t('mode.stages')}`, stats.games.stages ?? 0],
    [`· ${i18n.t('mode.timeAttack')}`, stats.games.timeAttack ?? 0],
    [i18n.t('stats.stagesCleared'), stats.won.stages ?? 0],
    [i18n.t('stats.best'), stats.score.best],
    [i18n.t('stats.totalScore'), stats.score.total],
    [i18n.t('stats.bestCombo'), stats.bestCombo],
    [i18n.t('stats.linesCleared'), stats.linesCleared],
    [i18n.t('stats.placements'), stats.placements],
    [i18n.t('stats.playTime'), formatDuration(stats.timeMs)],
  ];
  const table = document.createElement('table');
  table.className = 'stats-table';
  for (const [label, value] of rows) {
    const tr = document.createElement('tr');
    const a = document.createElement('th');
    a.textContent = label;
    const b = document.createElement('td');
    b.textContent = value;
    tr.appendChild(a);
    tr.appendChild(b);
    table.appendChild(tr);
  }
  body.appendChild(table);
}

function bindUi() {
  document.getElementById('btn-settings').addEventListener('click', () => {
    syncSettingsToUi();
    openModal('settings-modal');
  });

  document.getElementById('btn-daily').addEventListener('click', () => {
    renderDailyModal();
    openModal('daily-modal');
  });

  document.getElementById('btn-undo').addEventListener('click', handleUndo);
  document.getElementById('btn-hint').addEventListener('click', handleHint);

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
  document.getElementById('toggle-dark').addEventListener('change', (e) => {
    settings.dark = e.target.checked;
    applyDark(settings.dark);
    saveSettings();
  });
  document.getElementById('toggle-colorblind').addEventListener('change', (e) => {
    settings.colorblind = e.target.checked;
    applyColorblind(settings.colorblind);
    saveSettings();
  });
  document.getElementById('select-language').addEventListener('change', (e) => {
    settings.language = e.target.value;
    i18n.setLocale(e.target.value);
    saveSettings();
    refreshAll();
    renderThemePicker();
  });

  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    switch (action) {
      case 'close-settings': closeModal('settings-modal'); break;
      case 'close-mode': closeModal('mode-modal'); break;
      case 'close-daily': closeModal('daily-modal'); break;
      case 'close-stages': closeModal('stages-modal'); break;
      case 'close-tutorial':
        tutorial.close();
        storage.set(KEYS.tutorialDone, true);
        break;
      case 'open-mode':
        closeModal('settings-modal');
        closeModal('gameover-modal');
        openModal('mode-modal');
        break;
      case 'open-daily':
        closeModal('mode-modal');
        renderDailyModal();
        openModal('daily-modal');
        break;
      case 'open-stages':
        closeModal('mode-modal');
        renderStagesGrid();
        openModal('stages-modal');
        break;
      case 'show-tutorial':
        closeModal('settings-modal');
        tutorial.start();
        break;
      case 'tutorial-prev':
        tutorial.prev();
        break;
      case 'tutorial-next':
        tutorial.next(() => storage.set(KEYS.tutorialDone, true));
        break;
      case 'start-classic':
        mode = 'classic';
        modeOpts = {};
        newGame();
        break;
      case 'start-daily': {
        const difficulty = target.dataset.difficulty;
        mode = 'daily';
        modeOpts = { difficulty, key: dateKey(new Date()) };
        newGame();
        break;
      }
      case 'start-time':
        mode = 'timeAttack';
        modeOpts = { durationMs: DEFAULT_DURATION_MS };
        newGame();
        break;
      case 'start-stage': {
        const levelId = Number(target.dataset.levelId);
        if (!Number.isFinite(levelId)) break;
        mode = 'stages';
        modeOpts = { levelId };
        newGame();
        break;
      }
      case 'restart':
        newGame();
        break;
      case 'open-stats':
        closeModal('settings-modal');
        renderStatsModal();
        openModal('stats-modal');
        break;
      case 'close-stats':
        closeModal('stats-modal');
        break;
      case 'reset-stats':
        if (confirm(i18n.t('stats.confirmReset'))) {
          stats = emptyStats();
          saveStats();
          renderStatsModal();
        }
        break;
      case 'share':
        handleShare();
        break;
      case 'pick-theme':
        pickTheme(target.dataset.theme);
        break;
      default: break;
    }
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
    analytics.track('lines_cleared', { mode, rows: rows.length, cols: cols.length, combo, gained });
  });

  on('trayRefilled', () => updateActionsUi());
  on('undone', () => updateActionsUi());
  on('hintUsed', () => updateActionsUi());

  on('gameOver', (payload) => showGameOver(payload));
}

function maybeShowTutorial() {
  if (!storage.get(KEYS.tutorialDone, false)) {
    setTimeout(() => tutorial.start(), 600);
  }
}

function bootstrap() {
  errors.install();
  storage.runMigrations();
  loadBest();
  loadSettings();
  loadStats();
  i18n.init(settings.language);
  initBoard(document.getElementById('board'));
  initTray(document.getElementById('tray'));
  bindUi();
  bindGameEvents();
  attachTrayDrag({ getGame: () => game, onPlace: handlePlace });
  i18n.onChange(() => i18n.applyDom());

  mode = 'classic';
  modeOpts = {};
  newGame();
  maybeShowTutorial();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopTimer();
    else if (mode === 'timeAttack' && game && !game.over) startTimer();
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);
