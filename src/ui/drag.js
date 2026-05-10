import { canPlace } from '../core/bitboard.js';
import { getCellSize, getBoardRect, setGhost, clearGhost, getSlotEl } from './render.js';
import { dimensions } from '../game/pieces.js';

let active = null;

export function attachTrayDrag({ getGame, onPlace }) {
  document.addEventListener('pointerdown', (e) => {
    const slotEl = e.target.closest('.tray-slot');
    if (!slotEl) return;
    if (slotEl.classList.contains('used')) return;
    const idx = Number(slotEl.dataset.slot);
    const game = getGame();
    if (!game || game.over) return;
    const piece = game.tray[idx];
    if (!piece || game.traySlotsUsed[idx]) return;

    e.preventDefault();
    startDrag({ slotEl, idx, piece, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, getGame, onPlace });
  });
}

function startDrag({ slotEl, idx, piece, pointerId, startX, startY, getGame, onPlace }) {
  const ghost = createDragGhost(piece);
  document.body.appendChild(ghost);

  const slotRect = slotEl.getBoundingClientRect();
  const trayCellSize = slotRect.width / Math.max(...piece.cells.map(([_, c]) => c)) / 1.5; // rough
  const targetCell = getCellSize();
  const offsetY = targetCell * 1.5;

  active = { idx, piece, ghost, pointerId, offsetY, getGame, onPlace };
  positionGhost(startX, startY);
  updatePreview(startX, startY);

  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', onUp);
}

function createDragGhost(piece) {
  const dims = dimensions(piece);
  const cellSize = getCellSize();
  const ghost = document.createElement('div');
  ghost.className = 'drag-ghost';
  ghost.style.setProperty('--cell-size', `${cellSize}px`);
  ghost.style.setProperty('--piece-rows', dims.rows);
  ghost.style.setProperty('--piece-cols', dims.cols);
  const occupied = new Set(piece.cells.map(([r, c]) => `${r},${c}`));
  for (let r = 0; r < dims.rows; r++) {
    for (let c = 0; c < dims.cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'piece-cell';
      if (occupied.has(`${r},${c}`)) cell.classList.add('filled', `tier-${piece.tier}`);
      ghost.appendChild(cell);
    }
  }
  return ghost;
}

function positionGhost(clientX, clientY) {
  if (!active) return;
  const { ghost, offsetY, piece } = active;
  const dims = dimensions(piece);
  const cellSize = getCellSize();
  const w = dims.cols * cellSize;
  const h = dims.rows * cellSize;
  const x = clientX - w / 2;
  const y = clientY - h - offsetY;
  ghost.style.transform = `translate(${x}px, ${y}px)`;
}

function previewAnchor(clientX, clientY) {
  if (!active) return null;
  const rect = getBoardRect();
  if (!rect) return null;
  const cellSize = getCellSize();
  const dims = dimensions(active.piece);
  const w = dims.cols * cellSize;
  const h = dims.rows * cellSize;
  const offsetY = active.offsetY;
  const left = clientX - w / 2;
  const top = clientY - h - offsetY;
  const anchorC = Math.round((left - rect.left) / cellSize);
  const anchorR = Math.round((top - rect.top) / cellSize);
  return { r: anchorR, c: anchorC };
}

function updatePreview(clientX, clientY) {
  if (!active) return;
  const game = active.getGame();
  if (!game) return;
  const anchor = previewAnchor(clientX, clientY);
  if (!anchor) {
    clearGhost();
    return;
  }
  const valid = canPlace(game.board.occupancy, active.piece.cells, anchor.r, anchor.c);
  setGhost(active.piece, anchor.r, anchor.c, valid);
  active.lastAnchor = anchor;
  active.lastValid = valid;
}

function onMove(e) {
  if (!active || e.pointerId !== active.pointerId) return;
  positionGhost(e.clientX, e.clientY);
  updatePreview(e.clientX, e.clientY);
}

function onUp(e) {
  if (!active || e.pointerId !== active.pointerId) return;
  const { idx, lastAnchor, lastValid, ghost, onPlace } = active;
  document.removeEventListener('pointermove', onMove);
  document.removeEventListener('pointerup', onUp);
  document.removeEventListener('pointercancel', onUp);
  clearGhost();
  ghost.remove();
  if (lastValid && lastAnchor) {
    onPlace(idx, lastAnchor.r, lastAnchor.c);
  } else {
    const slotEl = getSlotEl(idx);
    if (slotEl) {
      slotEl.classList.add('shake');
      setTimeout(() => slotEl.classList.remove('shake'), 240);
    }
  }
  active = null;
}
