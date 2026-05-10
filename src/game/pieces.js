function p(id, cells) {
  const size = cells.length;
  let tier = 1;
  if (size >= 5) tier = 3;
  else if (size >= 3) tier = 2;
  return { id, cells, size, tier };
}

export const PIECES = [
  p('dot', [[0, 0]]),
  p('h2', [[0, 0], [0, 1]]),
  p('v2', [[0, 0], [1, 0]]),
  p('h3', [[0, 0], [0, 1], [0, 2]]),
  p('v3', [[0, 0], [1, 0], [2, 0]]),
  p('h4', [[0, 0], [0, 1], [0, 2], [0, 3]]),
  p('v4', [[0, 0], [1, 0], [2, 0], [3, 0]]),
  p('h5', [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]),
  p('v5', [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]),
  p('sq2', [[0, 0], [0, 1], [1, 0], [1, 1]]),
  p('sq3', [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]),
  p('L_tl', [[0, 0], [1, 0], [1, 1]]),
  p('L_tr', [[0, 1], [1, 0], [1, 1]]),
  p('L_bl', [[0, 0], [0, 1], [1, 0]]),
  p('L_br', [[0, 0], [0, 1], [1, 1]]),
  p('L4_tl', [[0, 0], [1, 0], [2, 0], [2, 1]]),
  p('L4_tr', [[0, 1], [1, 1], [2, 0], [2, 1]]),
  p('L4_bl', [[0, 0], [0, 1], [1, 0], [2, 0]]),
  p('L4_br', [[0, 0], [0, 1], [1, 1], [2, 1]]),
  p('T_d', [[0, 0], [0, 1], [0, 2], [1, 1]]),
  p('T_u', [[0, 1], [1, 0], [1, 1], [1, 2]]),
  p('T_l', [[0, 1], [1, 0], [1, 1], [2, 1]]),
  p('T_r', [[0, 0], [1, 0], [1, 1], [2, 0]]),
  p('S_h', [[0, 1], [0, 2], [1, 0], [1, 1]]),
  p('Z_h', [[0, 0], [0, 1], [1, 1], [1, 2]]),
];

export function dimensions(piece) {
  let maxR = 0;
  let maxC = 0;
  for (const [r, c] of piece.cells) {
    if (r > maxR) maxR = r;
    if (c > maxC) maxC = c;
  }
  return { rows: maxR + 1, cols: maxC + 1 };
}

function tierWeight(tier, score) {
  if (tier === 1) return Math.max(1, 5 - Math.floor(score / 1000));
  if (tier === 2) return 3 + Math.floor(score / 2000);
  return 1 + Math.floor(score / 3000);
}

export function pickPieces(rng, count = 3, score = 0) {
  const weights = PIECES.map((piece) => tierWeight(piece.tier, score));
  const total = weights.reduce((s, w) => s + w, 0);
  const out = [];
  for (let i = 0; i < count; i++) {
    let roll = rng() * total;
    for (let j = 0; j < PIECES.length; j++) {
      roll -= weights[j];
      if (roll <= 0) {
        out.push(PIECES[j]);
        break;
      }
    }
    if (out.length <= i) out.push(PIECES[PIECES.length - 1]);
  }
  return out;
}

export function getById(id) {
  return PIECES.find((p) => p.id === id);
}
