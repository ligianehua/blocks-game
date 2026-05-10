export const BOARD_SIZE = 8;
export const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE;
export const EMPTY_BOARD = 0n;
export const FULL_MASK = (1n << BigInt(BOARD_CELLS)) - 1n;

const ROW_MASKS = Array.from({ length: BOARD_SIZE }, (_, r) => 0xffn << BigInt(r * BOARD_SIZE));
const COL_MASKS = Array.from({ length: BOARD_SIZE }, (_, c) => {
  let m = 0n;
  for (let r = 0; r < BOARD_SIZE; r++) m |= 1n << BigInt(r * BOARD_SIZE + c);
  return m;
});

export function bit(r, c) {
  return 1n << BigInt(r * BOARD_SIZE + c);
}

export function getBit(board, r, c) {
  return (board & bit(r, c)) !== 0n;
}

export function rowMask(r) {
  return ROW_MASKS[r];
}

export function colMask(c) {
  return COL_MASKS[c];
}

export function pieceMask(cells, anchorR, anchorC) {
  let m = 0n;
  for (const [dr, dc] of cells) {
    const r = anchorR + dr;
    const c = anchorC + dc;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) return null;
    m |= 1n << BigInt(r * BOARD_SIZE + c);
  }
  return m;
}

export function canPlace(board, cells, r, c) {
  const m = pieceMask(cells, r, c);
  if (m === null) return false;
  return (board & m) === 0n;
}

export function place(board, cells, r, c) {
  const m = pieceMask(cells, r, c);
  if (m === null || (board & m) !== 0n) return null;
  return board | m;
}

export function findFullLines(board) {
  const rows = [];
  const cols = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    if ((board & ROW_MASKS[r]) === ROW_MASKS[r]) rows.push(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    if ((board & COL_MASKS[c]) === COL_MASKS[c]) cols.push(c);
  }
  return { rows, cols };
}

export function clearLines(board, rows, cols) {
  let mask = 0n;
  for (const r of rows) mask |= ROW_MASKS[r];
  for (const c of cols) mask |= COL_MASKS[c];
  return board & ~mask;
}

export function hasAnyFit(board, cells) {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (canPlace(board, cells, r, c)) return true;
    }
  }
  return false;
}

export function canFitAll(board, pieces) {
  if (pieces.length === 0) return true;
  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlace(board, piece, r, c)) {
          const next = board | pieceMask(piece, r, c);
          const { rows, cols } = findFullLines(next);
          const cleared = (rows.length || cols.length) ? clearLines(next, rows, cols) : next;
          const rest = pieces.slice(0, i).concat(pieces.slice(i + 1));
          if (canFitAll(cleared, rest)) return true;
        }
      }
    }
  }
  return false;
}

export function popcount(board) {
  let n = 0;
  let b = board;
  while (b !== 0n) {
    b &= b - 1n;
    n++;
  }
  return n;
}

export function isEmpty(board) {
  return board === EMPTY_BOARD;
}
