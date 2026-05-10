import {
  BOARD_SIZE,
  EMPTY_BOARD,
  canPlace,
  place as placeBits,
  findFullLines,
  clearLines,
  isEmpty,
  hasAnyFit,
} from '../core/bitboard.js';

export function createBoard() {
  return {
    occupancy: EMPTY_BOARD,
    cells: new Uint8Array(BOARD_SIZE * BOARD_SIZE),
  };
}

export function cloneBoard(board) {
  return {
    occupancy: board.occupancy,
    cells: new Uint8Array(board.cells),
  };
}

export function tryPlace(board, piece, r, c, tier) {
  if (!canPlace(board.occupancy, piece.cells, r, c)) return null;
  const next = cloneBoard(board);
  next.occupancy = placeBits(board.occupancy, piece.cells, r, c);
  for (const [dr, dc] of piece.cells) {
    next.cells[(r + dr) * BOARD_SIZE + (c + dc)] = tier ?? piece.tier;
  }
  return next;
}

export function applyClears(board) {
  const { rows, cols } = findFullLines(board.occupancy);
  if (rows.length === 0 && cols.length === 0) {
    return { board, rows, cols, cleared: false, emptyAfter: false };
  }
  const next = cloneBoard(board);
  next.occupancy = clearLines(board.occupancy, rows, cols);
  for (const r of rows) {
    for (let c = 0; c < BOARD_SIZE; c++) next.cells[r * BOARD_SIZE + c] = 0;
  }
  for (const c of cols) {
    for (let r = 0; r < BOARD_SIZE; r++) next.cells[r * BOARD_SIZE + c] = 0;
  }
  return {
    board: next,
    rows,
    cols,
    cleared: true,
    emptyAfter: isEmpty(next.occupancy),
  };
}

export function isAnyPiecePlaceable(board, pieces) {
  return pieces.some((piece) => hasAnyFit(board.occupancy, piece.cells));
}

export function findFitAnchor(board, piece) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board.occupancy, piece.cells, r, c)) return { r, c };
    }
  }
  return null;
}
