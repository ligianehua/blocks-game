import zh from '../../locales/zh.json';
import en from '../../locales/en.json';

const DICTS = { zh, en };
const AVAILABLE = ['zh', 'en'];
const DEFAULT_LOCALE = 'zh';

let current = DEFAULT_LOCALE;
const listeners = new Set();

function detect() {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (lang.startsWith('zh')) return 'zh';
  if (lang.startsWith('en')) return 'en';
  return DEFAULT_LOCALE;
}

export function init(stored) {
  current = stored && AVAILABLE.includes(stored) ? stored : detect();
  applyDom();
}

export function getLocale() {
  return current;
}

export function setLocale(locale) {
  if (!AVAILABLE.includes(locale) || locale === current) return;
  current = locale;
  applyDom();
  for (const fn of listeners) fn(current);
}

export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function available() {
  return AVAILABLE.slice();
}

function lookup(key, dict) {
  return key.split('.').reduce((acc, k) => (acc && typeof acc === 'object' ? acc[k] : undefined), dict);
}

export function t(key, vars) {
  let str = lookup(key, DICTS[current]) ?? lookup(key, DICTS[DEFAULT_LOCALE]) ?? key;
  if (vars) {
    str = str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
  }
  return str;
}

export function applyDom(root = document) {
  if (typeof document === 'undefined') return;
  root.documentElement.lang = current === 'zh' ? 'zh-CN' : 'en';
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });
}
