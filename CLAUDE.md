# Habitline

Single-file habit tracker: `index.html` only (vanilla JS, no deps, no build). `README.md` covers usage/deployment. Original spec in `HABIT_TRACKER_PROMPT.md`.

## Structure of index.html

- `<style>`: dark theme, CSS variables for colors (`--bg`, `--surface`, `--accent-a/b`), all components.
- `<script>`, sectioned top to bottom:
  - **State**: `state = {habits, version, confettiShownDate}` in `localStorage` key `habitline.state.v1`. Each habit: `{id, name, emoji, color, days:[0-6], created, archived, log:{"YYYY-MM-DD":true}}`. `migrate()` handles version upgrades.
  - **Date utils**: all local-date based (`parseDateStr`/`toDateStr` avoid UTC shift). Never use `new Date("YYYY-MM-DD")` directly elsewhere in this file.
  - **Habit logic** (pure functions): `isScheduled`, `currentStreak`, `bestStreak`, `dayCompletionPct`, `heatmapLevel`, `habitCompletionPctOverDays`, `longestOverallStreak`. Streak rule: unscheduled days are skipped (never break a streak); today's not-yet-done doesn't break current streak, only a scheduled-and-missed *past* day does.
  - **Render**: `render()` is the single re-render entrypoint, called after every state mutation (no diffing — rebuilds `#app` innerHTML each time via the `el()` helper). Views: `today`, `stats`, `settings`, plus a modal for add/edit habit.
  - **Confetti**: canvas-based, fires once per calendar day via `state.confettiShownDate` guard; resets if the day stops being "all done" so it can refire.

## Conventions

- Everything is one file by design — do not split into separate JS/CSS files.
- Keep pure logic functions (date/streak/heatmap math) free of DOM access so they stay testable by reading/copy-pasting into node.
- Any new feature should extend the existing state shape additively and bump `version` + add a `migrate()` branch rather than breaking old exports.
