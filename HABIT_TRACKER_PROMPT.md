# Habitline — Habit Tracker (one-shot build prompt)

Build a complete, polished habit tracker web app in a **single `index.html` file** — vanilla JavaScript, no libraries, no build step, no backend. All data in localStorage. It must open by double-click AND work served over http. Build it in THIS folder (`habitline/`): just `index.html` and a `README.md` (description + how to run/deploy as a static site). Also create a concise `CLAUDE.md` when done.

## Design (this must look premium, not like a demo)
- Dark theme: background `#0b0f14`, surface cards `#151b23` with subtle 1px borders `#232b36`, rounded-2xl corners, soft shadows
- One accent gradient: emerald `#10b981` → teal `#2dd4bf`, used for fills, rings, and the primary button
- System font stack, generous whitespace, max-width ~720px centered, fully responsive down to 360px
- Micro-interactions: 150ms transitions on everything; checking a habit animates (scale pop + the day's cell filling with the gradient); a tiny canvas confetti burst when ALL habits are done for the day
- Empty state with an inline SVG illustration and a clear call-to-action

## Features
1. **Habits CRUD** — add habit (name, emoji icon picked from a small grid, color choice, frequency: daily or specific weekdays), edit, archive, delete (with confirm). Reorder via up/down buttons.
2. **Today view (home)** — the day's habits as large tappable cards with a check ring; header shows date, overall day progress ring (SVG), and a motivational line that changes with progress (0%, 50%, 100%).
3. **Week strip** — last 7 days per habit as small cells (done/missed/not-scheduled), visible on each card.
4. **Streaks** — current streak and best streak per habit (only scheduled days count; skipping an unscheduled day never breaks a streak). Streak flame badge 🔥 at 7+, 30+, 100+ days.
5. **Stats view** — GitHub-style heatmap of the last 26 weeks (5 intensity levels = % of scheduled habits completed that day, hover/tap tooltip with details); per-habit completion % over last 30 days as horizontal bars; totals (perfect days, longest overall streak).
6. **History editing** — tap any past day cell to toggle it (people forget to log). Future days are locked.
7. **Data safety** — Export/Import JSON buttons in a settings panel; "reset all" behind a double confirm.
8. **Quality details** — keyboard accessible (tab + enter toggles), `prefers-reduced-motion` respected, date logic uses local dates (NOT UTC — a habit checked at 11pm must count for that local day), month boundaries and year rollover handled.

## Architecture rules
- One file, but organized: a `<style>` block, then `<script>` with clear sections (state, storage, date utils, streak logic, render functions, event wiring). No frameworks, no CDN links, no external fonts/images — icons are emoji or inline SVG.
- State shape: `{ habits: [{id, name, emoji, color, days:[0-6], created, archived, log: {"YYYY-MM-DD": true}}], version: 1 }`. Migrate gracefully if version changes later.
- Pure functions for streak/heatmap math so logic is testable by reading.

## Acceptance criteria — verify each before declaring done
1. Add 3 habits (one weekdays-only), check some off across several days by editing history — streaks and heatmap are correct, including the weekdays-only habit not breaking its streak on weekends.
2. Refresh the page — everything persists.
3. Export produces a JSON file; wiping localStorage and importing it restores everything.
4. Completing all of today's habits fires the confetti once (not again on re-render).
5. Works at 360px width and on desktop; no console errors.

Finish by listing what was verified against these criteria. Keep total code under ~1200 lines by avoiding repetition (shared render helpers).
