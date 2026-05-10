```markdown
# blocks-game Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you how to contribute to the `blocks-game` repository, a JavaScript game project built with Vite. You'll learn the project's coding conventions, how to add features, UI components, localization, and tests, as well as the standard workflows for maintaining and extending the codebase.

## Coding Conventions

- **Language:** JavaScript (ES Modules)
- **Framework:** Vite
- **File Naming:** Use `camelCase` for file names.
  - Example: `gameLogic.js`, `themePicker.js`
- **Import Style:** Use relative imports.
  - Example:
    ```js
    import { getStats } from '../core/stats.js';
    ```
- **Export Style:** Use named exports.
  - Example:
    ```js
    // src/game/leaderboard.js
    export function getLeaderboard() { ... }
    ```
- **Commit Messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/) with the `feat` prefix for features.
  - Example: `feat: add dark mode toggle to settings panel`

## Workflows

### Add New Feature Module
**Trigger:** When adding a new core feature or game mode (e.g., achievements, stats, new gameplay mode).
**Command:** `/new-feature-module`

1. Create or update logic in `src/game/` or `src/core/` (e.g., `src/game/newMode.js`).
2. Integrate the feature in `src/main.js`.
3. Update or create UI components in `src/ui/` as needed (e.g., `src/ui/theme.js`).
4. Update localization files: `src/locales/en.json` and `src/locales/zh.json` for new UI strings.
5. Update or create styles in `src/styles/` (`base.css`, `components.css`, `themes.css`) if the feature affects appearance.
6. Add or update unit tests in `tests/unit/` for the new logic.
7. Update `index.html` if the feature affects the main structure or metadata.

**Example:**
```js
// src/game/achievements.js
export function unlockAchievement(name) { ... }
```
```js
// src/ui/achievementToast.js
export function showAchievementToast(msg) { ... }
```

### Add or Update Localization
**Trigger:** When adding new UI/features or changing text that needs localization.
**Command:** `/update-localization`

1. Add or update keys in `src/locales/en.json` and `src/locales/zh.json` for all new/changed strings.
2. Ensure both language files have the same keys (no orphans).
3. Update UI or logic to use the new localization keys.

**Example:**
```json
// src/locales/en.json
{
  "newFeature.title": "New Feature"
}
```
```js
import { t } from '../core/i18n.js';
element.textContent = t('newFeature.title');
```

### Add Unit Tests for Feature
**Trigger:** When implementing or modifying a feature/module and needing test coverage.
**Command:** `/add-unit-tests`

1. Create or update tests in `tests/unit/` for the relevant logic.
2. Ensure all new logic branches are covered.
3. Run tests locally and verify CI passes.

**Example:**
```js
// tests/unit/achievements.test.js
import { unlockAchievement } from '../../src/game/achievements.js';
import { describe, it, expect } from 'vitest';

describe('unlockAchievement', () => {
  it('unlocks a new achievement', () => {
    expect(unlockAchievement('firstWin')).toBe(true);
  });
});
```

### Add New UI Component
**Trigger:** When a new UI component (e.g., tutorial, toast, share, theme picker) is needed.
**Command:** `/new-ui-component`

1. Create a new component in `src/ui/` (e.g., `src/ui/toast.js`).
2. Update or add styles in `src/styles/components.css` or `themes.css` as needed.
3. Integrate the component in `src/main.js` or relevant feature logic.
4. Update localization files for any new UI strings.

**Example:**
```js
// src/ui/toast.js
export function showToast(message) { ... }
```
```css
/* src/styles/components.css */
.toast {
  background: #333;
  color: #fff;
  border-radius: 4px;
}
```

## Testing Patterns

- **Framework:** [Vitest](https://vitest.dev/)
- **Test File Pattern:** `*.test.js` (e.g., `achievements.test.js`)
- **Location:** `tests/unit/`
- **Style:** Use `describe`, `it`, and `expect` for test cases.
- **Coverage:** Ensure all logic branches are tested for new/modified features.

**Example:**
```js
// tests/unit/theme.test.js
import { setTheme } from '../../src/ui/theme.js';
import { describe, it, expect } from 'vitest';

describe('setTheme', () => {
  it('applies the dark theme', () => {
    setTheme('dark');
    expect(document.body.classList.contains('dark')).toBe(true);
  });
});
```

## Commands

| Command               | Purpose                                                      |
|-----------------------|--------------------------------------------------------------|
| /new-feature-module   | Start a new core feature or game mode                        |
| /update-localization  | Add or update localization for new/changed UI/features       |
| /add-unit-tests       | Add or update unit tests for new or modified logic           |
| /new-ui-component     | Create and integrate a new UI component                      |
```