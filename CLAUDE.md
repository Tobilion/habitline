# Habitline

Modular ES-module habit tracker: `index.html` is a thin shell (loads CSS + `js/main.js` as `type="module"`), no build step, no dependencies, no bundler. `README.md` covers usage/deployment (note: ES modules require serving over http, not `file://`). Original spec in `HABIT_TRACKER_PROMPT.md` (historical, unmodified).

## Structure

### `styles/` (loaded via `<link>` in index.html, in this order)
- `tokens.css` — CSS custom properties (`--bg`, `--surface`, `--accent`, `--accent-2`, radii, shadows, easing). Accent presets are applied via `html.accent-default|sunset|violet` classes (see `js/accent.js`). Never hardcode colors elsewhere.
- `base.css` — resets, body/typography defaults, `.fade-up` entry animation, `prefers-reduced-motion` override.
- `components.css` — reusable component classes (buttons, cards, modal, toast, badges, nav, rings, etc.), paired with behavior in `js/components/*.js`.
- `screens.css` — layout specifics per screen (header, today hero, stats, settings, landing).

### `js/` (ES modules, native `import`/`export`, each file <400 lines)
- `state.js` — state shape, `defaultState()`, `migrate()` (now **VERSION 2**), `uid()`, `EMOJI_CHOICES`/`COLOR_CHOICES`/`DAY_LABELS(_FULL)`, `ACCENT_PRESETS`, `MILESTONE_THRESHOLDS`.
- `storage.js` — `loadState()`/`saveState()` against `localStorage` key `habitline.state.v1` (key unchanged across the version bump — see state.js header comment).
- `dates.js` — all local-date utilities (`parseDateStr`/`toDateStr` avoid UTC shift). Never use `new Date("YYYY-MM-DD")` directly anywhere else.
- `streaks.js` — pure, DOM-free habit-logic functions: `isScheduled`, `currentStreak`, `bestStreak`, `dayCompletionPct`, `heatmapLevel`, `habitCompletionPctOverDays`, `longestOverallStreak`, `perfectDaysCount`, `flameForStreak`, `freqLabel`, plus log-entry accessors `isDone`/`setDone`/`getNote`/`setNote` (see notes-storage decision below). Streak rule unchanged: unscheduled days are skipped (never break a streak); today's not-yet-done doesn't break current streak, only a scheduled-and-missed *past* day does.
- `dom.js` — shared `el()` DOM-builder helper (rebuild-innerHTML-each-time, no vdom) + `prefersReducedMotion()`.
- `accent.js` — applies the persisted accent preset to `<html>` by toggling `accent-*` classes.
- `confetti.js` — full-screen canvas confetti (`fireConfetti`, fires once per calendar day via `state.confettiShownDate`, resets if the day stops being "all done") **plus** `fireLocalBurst()`, a 12-particle burst confined to a DOM element's position, used by the per-habit check button.
- `components/` — one file per reusable UI primitive, each documented with what it does and where it's used: `spotlightCard.js`, `tiltCard.js`, `magneticButton.js`, `glowOrb.js`, `tubelightNav.js`, `textScramble.js`, `scrollProgressBar.js`, `animatedCounter.js`, `progressRing.js`, `skeletonLoader.js`, `toast.js`, `emptyState.js`, `modal.js`.
- `ui/` — screen assembly, one file per screen/concern: `landing.js` (zero-habits hero screen), `header.js` (sticky nav), `today.js` (hero ring + habit cards + week strips), `stats.js` (heatmap + stat cards + completion bars + milestones), `settings.js` (export/import, accent picker, manage habits, reset), `habitModal.js` (add/edit habit modal).
- `main.js` — app bootstrap: loads state, mounts `SkeletonLoader` for ~150ms (simulated boot delay), then calls the single `render()` re-render entrypoint (rebuilds `#app` innerHTML each time, routes to the active screen module), wires global Esc-to-close-modal and window resize (confetti canvas).

## Notes-storage design decision (state.js)

Rather than a separate `state.notes` map, habit log entries were upgraded in place. `habit.log[dateStr]` can be either:
- `true` — legacy v1 shape, means "done, no note" (kept for entries without a note, to minimize storage size)
- `{ done: true, note: "..." }` — v2 shape, used whenever a note is attached

All reads/writes go through `isDone()`, `getNote()`, `setDone()`, `setNote()` in `streaks.js` — no other code should touch `habit.log[dateStr]` directly. `migrate()` normalizes any legacy entries on load.

## State v2 additions

- `state.accent: "default" | "sunset" | "violet"` — persisted accent preset, applied on load via `js/accent.js`.
- `state.milestonesSeen: string[]` — keys like `"<habitId>:7"` already celebrated, so the Stats-view milestone takeover only fires once per (habit, threshold) pair. Milestone detection scans all habits' `bestStreak()` against `MILESTONE_THRESHOLDS = [7, 30, 100]` on every Stats view load.
- `state.confettiShownDate` — unchanged from v1.
- `VERSION` bumped to `2`; `STORAGE_KEY` stays `"habitline.state.v1"` (the key names the localStorage slot, not the schema version).

## Conventions

- Split by concern across files — CSS in `styles/`, pure logic in `state.js`/`dates.js`/`streaks.js`, DOM behavior in `components/`, screen composition in `ui/`. Every file must stay under 400 lines; split further if a screen's render logic grows too long.
- Keep pure logic functions (date/streak/heatmap math in `dates.js`/`streaks.js`) free of DOM access so they stay testable by reading/copy-pasting into node.
- Any new feature should extend the existing state shape additively and bump `VERSION` + add a `migrate()` branch rather than breaking old exports.
- No `alert()`/`confirm()` anywhere — use `components/toast.js` and `components/modal.js` (`openConfirmModal` for single or double-confirm flows) instead.
- ES modules require serving over `http://`, not opening `index.html` via `file://` (browsers block module scripts on `file://`).
