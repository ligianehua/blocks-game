---
name: add-new-feature-module
description: Workflow command scaffold for add-new-feature-module in blocks-game.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-new-feature-module

Use this workflow when working on **add-new-feature-module** in `blocks-game`.

## Goal

Implements a new core feature or game mode, including logic, UI, localization, and tests.

## Common Files

- `src/game/*.js`
- `src/core/*.js`
- `src/ui/*.js`
- `src/locales/en.json`
- `src/locales/zh.json`
- `src/styles/*.css`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update logic in src/game/ or src/core/ (e.g., new mode, achievement, leaderboard, stats, etc.)
- Update src/main.js to integrate the new feature into the app flow
- Update or create UI components in src/ui/ as needed (e.g., theme.js, toast.js, tutorial.js, share.js)
- Update localization files src/locales/en.json and src/locales/zh.json for new UI strings
- Update or create styles in src/styles/ (base.css, components.css, themes.css) if the feature affects appearance

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.