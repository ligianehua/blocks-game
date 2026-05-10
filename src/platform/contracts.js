/**
 * Platform contract shapes — documented here so future ports (e.g. WeChat
 * mini-program) can swap implementations without touching game/ or ui/.
 *
 * Storage:    { get(key), set(key, value), remove(key), getAllKeys() }
 * Audio:      { play(name), stopAll(), setMuted(category, muted), unlock() }
 * Haptics:    { vibrate(pattern), setEnabled(enabled) }
 * I18n:       { t(key, vars), setLocale(locale), getLocale(), available() }
 * Monetize:   { revive(), rewardedHint(), skipAd() } — all return Promise<bool>
 * Analytics:  { track(event, props), identify(userId) }
 */
