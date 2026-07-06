// AnimatedCounter — numbers count up from 0 with easeOut over 1s when the
// element enters the viewport (IntersectionObserver).
// Used for: stat totals (stats.js) and the fake landing streak counter (landing.js).
import { prefersReducedMotion } from "../dom.js";

function easeOutQuad(t) {
  return t * (2 - t);
}

// targetEl must already be in the DOM (or about to be appended) — pass the
// final numeric value and optional suffix (e.g. "%", " days").
export function attachAnimatedCounter(targetEl, endValue, { duration = 1000, suffix = "" } = {}) {
  if (!targetEl) return;
  if (prefersReducedMotion()) {
    targetEl.textContent = endValue + suffix;
    return;
  }
  targetEl.textContent = "0" + suffix;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        function frame(now) {
          const t = Math.min(1, (now - start) / duration);
          const val = Math.round(endValue * easeOutQuad(t));
          targetEl.textContent = val + suffix;
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    },
    { threshold: 0.2 }
  );
  observer.observe(targetEl);
}
