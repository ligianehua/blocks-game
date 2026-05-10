import { t } from '../platform/web/i18n.js';

const W = 720;
const H = 1280;

function readVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function renderCard({ score, mode, won, bestCombo, linesCleared, dateStr, modeLabel }) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bg1 = readVar('--color-bg-1', '#4a2912');
  const bg2 = readVar('--color-bg-2', '#5d3a1f');
  const board = readVar('--color-board', '#3a2110');
  const t1 = readVar('--tier-1', '#6fd6c0');
  const t2 = readVar('--tier-2', '#95d97a');
  const t3 = readVar('--tier-3', '#4fb89c');
  const accent = readVar('--color-accent', '#ffd54a');
  const text = readVar('--color-text', '#fff5e1');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, bg1);
  grad.addColorStop(1, bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = text;
  ctx.textAlign = 'center';
  ctx.font = 'bold 60px system-ui, sans-serif';
  ctx.fillText('Blocks Game', W / 2, 140);

  ctx.font = '32px system-ui, sans-serif';
  ctx.fillStyle = accent;
  ctx.fillText(modeLabel ?? mode, W / 2, 200);

  // Score
  ctx.fillStyle = accent;
  ctx.font = 'bold 200px system-ui, sans-serif';
  ctx.fillText(String(score), W / 2, 460);

  ctx.fillStyle = text;
  ctx.font = '36px system-ui, sans-serif';
  ctx.fillText(t('gameover.final'), W / 2, 520);

  if (won) {
    ctx.fillStyle = '#4fef7d';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.fillText('★ ' + t('gameover.won') + ' ★', W / 2, 600);
  }

  // Stats row
  ctx.fillStyle = text;
  ctx.font = '32px system-ui, sans-serif';
  ctx.textAlign = 'center';
  const statsY = 720;
  ctx.fillText(`${t('stats.bestCombo')}: ${bestCombo}`, W / 2, statsY);
  ctx.fillText(`${t('stats.linesCleared')}: ${linesCleared}`, W / 2, statsY + 50);

  // Decorative blocks
  const tiles = [t1, t2, t3, t1, t2];
  const ts = 90;
  const cx = W / 2 - (tiles.length * (ts + 8)) / 2 + 4;
  for (let i = 0; i < tiles.length; i++) {
    const x = cx + i * (ts + 8);
    const y = 880;
    ctx.fillStyle = tiles[i];
    roundRect(ctx, x, y, ts, ts, 12);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, x, y, ts, 12, 12);
    ctx.fill();
  }

  // Date
  ctx.fillStyle = text;
  ctx.font = '28px system-ui, sans-serif';
  ctx.fillText(dateStr, W / 2, 1080);

  ctx.font = '22px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('blocks-game', W / 2, 1180);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function shareOrDownload(canvas, filename = 'blocks-game-score.png') {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return { ok: false };
  if (navigator.canShare?.({ files: [new File([blob], filename, { type: 'image/png' })] })) {
    try {
      await navigator.share({
        files: [new File([blob], filename, { type: 'image/png' })],
        title: 'Blocks Game',
      });
      return { ok: true, method: 'share' };
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { ok: true, method: 'download' };
}
