import { BOARD_SIZE } from '../core/bitboard.js';
import { dimensions } from '../game/pieces.js';

let boardEl = null;
let trayEl = null;
const cellEls = [];
const slotEls = [];

export function initBoard(rootEl) {
  boardEl = rootEl;
  boardEl.innerHTML = '';
  boardEl.style.setProperty('--board-size', BOARD_SIZE);
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.dataset.r = r;
      el.dataset.c = c;
      boardEl.appendChild(el);
      cellEls.push(el);
    }
  }
}

export function initTray(rootEl) {
  trayEl = rootEl;
  trayEl.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const slot = document.createElement('div');
    slot.className = 'tray-slot';
    slot.dataset.slot = i;
    trayEl.appendChild(slot);
    slotEls.push(slot);
  }
}

export function renderBoard(board) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const tier = board.cells[r * BOARD_SIZE + c];
      const el = cellEls[r * BOARD_SIZE + c];
      el.className = 'cell';
      if (tier > 0) el.classList.add('filled', `tier-${tier}`);
    }
  }
}

export function renderTray(tray, traySlotsUsed) {
  for (let i = 0; i < 3; i++) {
    const slot = slotEls[i];
    slot.innerHTML = '';
    slot.classList.toggle('used', !!traySlotsUsed[i]);
    const piece = tray[i];
    if (!piece || traySlotsUsed[i]) continue;
    slot.dataset.pieceId = piece.id;
    const dims = dimensions(piece);
    const pieceEl = createPieceEl(piece);
    pieceEl.style.setProperty('--piece-rows', dims.rows);
    pieceEl.style.setProperty('--piece-cols', dims.cols);
    slot.appendChild(pieceEl);
  }
}

export function createPieceEl(piece, { tier } = {}) {
  const dims = dimensions(piece);
  const wrap = document.createElement('div');
  wrap.className = 'piece';
  wrap.dataset.pieceId = piece.id;
  wrap.style.setProperty('--piece-rows', dims.rows);
  wrap.style.setProperty('--piece-cols', dims.cols);

  const occupied = new Set(piece.cells.map(([r, c]) => `${r},${c}`));
  for (let r = 0; r < dims.rows; r++) {
    for (let c = 0; c < dims.cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'piece-cell';
      if (occupied.has(`${r},${c}`)) {
        cell.classList.add('filled', `tier-${tier ?? piece.tier}`);
      }
      wrap.appendChild(cell);
    }
  }
  return wrap;
}

export function setGhost(piece, anchorR, anchorC, valid) {
  clearGhost();
  if (!piece || anchorR === null || anchorC === null) return;
  for (const [dr, dc] of piece.cells) {
    const r = anchorR + dr;
    const c = anchorC + dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) continue;
    const el = cellEls[r * BOARD_SIZE + c];
    el.classList.add('ghost');
    el.classList.add(valid ? 'ghost-valid' : 'ghost-invalid');
  }
}

export function clearGhost() {
  for (const el of cellEls) {
    el.classList.remove('ghost', 'ghost-valid', 'ghost-invalid');
  }
}

export function getCellAt(clientX, clientY) {
  if (!boardEl) return null;
  const rect = boardEl.getBoundingClientRect();
  const cellSize = rect.width / BOARD_SIZE;
  const c = Math.floor((clientX - rect.left) / cellSize);
  const r = Math.floor((clientY - rect.top) / cellSize);
  if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return null;
  return { r, c };
}

export function getBoardRect() {
  return boardEl?.getBoundingClientRect() ?? null;
}

export function getCellSize() {
  if (!boardEl) return 0;
  return boardEl.getBoundingClientRect().width / BOARD_SIZE;
}

export function getSlotEl(idx) {
  return slotEls[idx];
}

export function flashLines(rows, cols) {
  for (const r of rows) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      cellEls[r * BOARD_SIZE + c].classList.add('flash');
    }
  }
  for (const c of cols) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      cellEls[r * BOARD_SIZE + c].classList.add('flash');
    }
  }
  setTimeout(() => {
    for (const el of cellEls) el.classList.remove('flash');
  }, 280);
}
