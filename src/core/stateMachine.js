export const STATES = Object.freeze({
  BOOT: 'boot',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  MODAL: 'modal',
});

const TRANSITIONS = {
  [STATES.BOOT]: [STATES.MENU, STATES.PLAYING],
  [STATES.MENU]: [STATES.PLAYING],
  [STATES.PLAYING]: [STATES.PAUSED, STATES.GAME_OVER, STATES.MODAL],
  [STATES.PAUSED]: [STATES.PLAYING, STATES.MENU],
  [STATES.MODAL]: [STATES.PLAYING, STATES.MENU],
  [STATES.GAME_OVER]: [STATES.PLAYING, STATES.MENU],
};

export function createStateMachine(initial = STATES.BOOT, onChange = () => {}) {
  let current = initial;
  return {
    get state() {
      return current;
    },
    can(next) {
      return TRANSITIONS[current]?.includes(next) ?? false;
    },
    to(next) {
      if (current === next) return false;
      if (!this.can(next)) {
        console.warn(`[sm] illegal transition: ${current} → ${next}`);
        return false;
      }
      const prev = current;
      current = next;
      onChange(next, prev);
      return true;
    },
  };
}
