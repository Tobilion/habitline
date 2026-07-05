# Habitline

A polished, single-file habit tracker. No build step, no backend, no dependencies — just `index.html`. All data lives in your browser's `localStorage`.

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

**Double-click:** just open `index.html` in any modern browser. It works with no server, since everything (state, styles, scripts) lives in the one file and storage is local to the browser.

**Local server (optional):** from this folder, run one of:

```
python3 -m http.server 8080
# or
npx serve .
```

Then visit `http://localhost:8080`.

## Deploying as a static site

Since it's a single static HTML file with zero build step, any static host works:

- **GitHub Pages** — push this folder to a repo, enable Pages on the branch/folder, done.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder (or connect the repo); no build command needed, output directory is the repo root.
- **Any web server / S3 bucket / etc.** — just upload `index.html`.

## Data & privacy

All habit data is stored only in the browser's `localStorage` under the key `habitline.state.v1`. Nothing is sent anywhere. Clearing browser storage (or using a different browser/device) will lose data unless you've exported a JSON backup from the Settings panel first.

## Notes

- Streak and heatmap math use **local calendar dates**, not UTC, so a habit checked at 11pm always counts for that day regardless of timezone.
- The state schema is versioned (`version: 1`) with a migration path built in, so future updates to the data shape can upgrade old exports/localStorage automatically.
