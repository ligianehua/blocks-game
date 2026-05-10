/* @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { THEMES, applyTheme, applyDark, applyColorblind, isUnlocked, isKnownTheme, listUnlockedThemes } from '../../src/ui/theme.js';

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-dark');
    document.documentElement.removeAttribute('data-colorblind');
  });

  it('lists 5 themes including wood as default', () => {
    expect(THEMES.length).toBe(5);
    expect(THEMES[0].id).toBe('wood');
    expect(THEMES[0].unlockScore).toBe(0);
  });

  it('isKnownTheme matches the catalog', () => {
    expect(isKnownTheme('wood')).toBe(true);
    expect(isKnownTheme('candy')).toBe(true);
    expect(isKnownTheme('rainbow')).toBe(false);
  });

  it('applyTheme sets data-theme', () => {
    applyTheme('candy');
    expect(document.documentElement.dataset.theme).toBe('candy');
  });

  it('applyTheme falls back to wood for unknown', () => {
    applyTheme('rainbow');
    expect(document.documentElement.dataset.theme).toBe('wood');
  });

  it('applyDark toggles attribute', () => {
    applyDark(true);
    expect(document.documentElement.dataset.dark).toBe('true');
    applyDark(false);
    expect(document.documentElement.dataset.dark).toBeUndefined();
  });

  it('applyColorblind toggles attribute', () => {
    applyColorblind(true);
    expect(document.documentElement.dataset.colorblind).toBe('true');
    applyColorblind(false);
    expect(document.documentElement.dataset.colorblind).toBeUndefined();
  });

  it('isUnlocked respects threshold', () => {
    expect(isUnlocked('wood', 0)).toBe(true);
    expect(isUnlocked('candy', 0)).toBe(false);
    expect(isUnlocked('candy', 1000)).toBe(true);
    expect(isUnlocked('neon', 9999)).toBe(false);
    expect(isUnlocked('neon', 10000)).toBe(true);
  });

  it('listUnlockedThemes is incremental with score', () => {
    expect(listUnlockedThemes(0)).toEqual(['wood']);
    expect(listUnlockedThemes(5000)).toEqual(['wood', 'candy', 'ocean', 'space']);
    expect(listUnlockedThemes(99999)).toEqual(['wood', 'candy', 'ocean', 'space', 'neon']);
  });
});
