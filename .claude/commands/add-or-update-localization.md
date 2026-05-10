---
name: add-or-update-localization
description: Workflow command scaffold for add-or-update-localization in blocks-game.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-localization

Use this workflow when working on **add-or-update-localization** in `blocks-game`.

## Goal

Ensures new or changed UI/features are fully localized in all supported languages.

## Common Files

- `src/locales/en.json`
- `src/locales/zh.json`
- `src/ui/*.js`
- `src/main.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Add or update keys in src/locales/en.json and src/locales/zh.json for all new/changed strings
- Verify parity between language files (same keys, no orphans)
- Update UI or logic to use the new localization keys

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.