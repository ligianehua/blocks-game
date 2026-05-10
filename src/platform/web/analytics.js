let userId = null;

export function identify(id) {
  userId = id;
}

export function track(event, props = {}) {
  if (typeof window === 'undefined') return;
  if (!window.__ANALYTICS_DEBUG__) return;
  console.log('[analytics]', event, { userId, ...props });
}
