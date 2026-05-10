export const THEMES = [
  { id: 'wood', unlockScore: 0 },
  { id: 'candy', unlockScore: 1000 },
  { id: 'ocean', unlockScore: 3000 },
  { id: 'space', unlockScore: 5000 },
  { id: 'neon', unlockScore: 10000 },
];

export function applyTheme(themeId) {
  if (!isKnownTheme(themeId)) themeId = 'wood';
  document.documentElement.dataset.theme = themeId;
}

export function applyDark(enabled) {
  if (enabled) document.documentElement.dataset.dark = 'true';
  else delete document.documentElement.dataset.dark;
}

export function applyColorblind(enabled) {
  if (enabled) document.documentElement.dataset.colorblind = 'true';
  else delete document.documentElement.dataset.colorblind;
}

export const SHAPES = ['rounded', 'sharp', 'pill'];

export function applyShape(shape) {
  if (!SHAPES.includes(shape)) shape = 'rounded';
  if (shape === 'rounded') delete document.documentElement.dataset.shape;
  else document.documentElement.dataset.shape = shape;
}

export function isKnownTheme(id) {
  return THEMES.some((t) => t.id === id);
}

export function isUnlocked(themeId, bestScore) {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return false;
  return bestScore >= theme.unlockScore;
}

export function listUnlockedThemes(bestScore) {
  return THEMES.filter((t) => bestScore >= t.unlockScore).map((t) => t.id);
}
