// ProgressRing — SVG circle with animated stroke-dashoffset and a gradient
// stroke, round linecap, centered % label. Reusable upgrade of the old
// svgRing() helper. Used for: Today hero ring (today.js), per-habit check
// ring progress (today.js), and stat rings if needed.
export function makeProgressRingSVG(pct, size, strokeWidth, gradId) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  return `<svg class="ring-progress" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="var(--accent)"/>
        <stop offset="100%" stop-color="var(--accent-2)"/>
      </linearGradient>
    </defs>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--border)" stroke-width="${strokeWidth}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#${gradId})" stroke-width="${strokeWidth}"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
      style="transition: stroke-dashoffset 650ms var(--ease);"/>
  </svg>`;
}
