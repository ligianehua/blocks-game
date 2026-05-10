/**
 * Monetization stubs. P0 returns no-op falsy values; P3 swaps in ad SDK.
 * Business logic must call these at the right hooks (e.g. game-over screen)
 * so future ad integration is a one-file change.
 */

export function revive() {
  return Promise.resolve(false);
}

export function rewardedHint() {
  return Promise.resolve(false);
}

export function skipAd() {
  return Promise.resolve(true);
}
