---
name: add-unit-tests-for-feature
description: Workflow command scaffold for add-unit-tests-for-feature in blocks-game.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-unit-tests-for-feature

Use this workflow when working on **add-unit-tests-for-feature** in `blocks-game`.

## Goal

Adds or updates unit tests to cover new or changed logic for features or modules.

## Common Files

- `tests/unit/*.test.js`
- `src/game/*.js`
- `src/core/*.js`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update tests in tests/unit/ for the relevant logic (e.g., achievements, stats, theme, modes, etc.)
- Ensure all new logic branches are covered
- Run tests locally and verify CI passes

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.