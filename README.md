# Habitline

A polished habit tracker built as modular ES modules. No build step, no backend, no dependencies — just static files (`index.html`, `styles/*.css`, `js/**/*.js`). All data lives in your browser's `localStorage`.

## Features

- Add habits with an emoji icon, color, and frequency (daily, weekdays, or custom days)
- Today view with large tappable check cards, a day-progress ring, and a per-habit 7-day strip
- Streaks (current + best) that only count scheduled days — skipping an unscheduled day never breaks a streak
- Flame badges at 7, 30, and 100+ day streaks
- Stats view: a 26-week GitHub-style activity heatmap, 30-day completion bars per habit, and lifetime totals
- Tap any past day cell to correct your history (future days are locked)
- Export/import your data as JSON, plus a double-confirmed full reset
- Keyboard accessible, respects `prefers-reduced-motion`, works down to 360px screens

## Running it

**Important: this app uses native ES modules (`<script type="module">` + `import`/`export`), so it must be served over `http://` — most browsers (Chrome included) block module scripts loaded via `file://`.** Double-clicking `index.html` will not work.

From this folder, run one of:

```
python3 -m http.server 8080
# or
npx serve .
```

Then visit `http://localhost:8080`.

## Deploying as a static site

It's a static site with zero build step, so any static host works — just make sure the whole folder structure (`index.html`, `styles/`, `js/`) is uploaded together, preserving relative paths:

- **GitHub Pages** — push this folder to a repo, enable Pages on the branch/folder, done.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder (or connect the repo); no build command needed, output directory is the repo root.
- **Any web server / S3 bucket / etc.** — upload `index.html` plus the `styles/` and `js/` directories.

## Data & privacy

All habit data is stored only in the browser's `localStorage` under the key `habitline.state.v1`. Nothing is sent anywhere. Clearing browser storage (or using a different browser/device) will lose data unless you've exported a JSON backup from the Settings panel first.

## Notes

- Streak and heatmap math use **local calendar dates**, not UTC, so a habit checked at 11pm always counts for that day regardless of timezone.
- The state schema is versioned (currently `version: 2`) with a migration path built in, so future updates to the data shape can upgrade old exports/localStorage automatically.
- The codebase is split into ES modules under `js/` (state, dates, streak logic, reusable UI components, per-screen assembly) and CSS under `styles/` — see `CLAUDE.md` for the full module map.
