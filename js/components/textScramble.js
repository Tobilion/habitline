// TextScramble — scrambles random glyphs into the final text over ~800ms.
// Used once: landing hero headline "Build habits that stick." (landing.js).
// Respects prefers-reduced-motion by just setting the final HTML immediately.
import { prefersReducedMotion } from "../dom.js";

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

// targetEl: element to fill. finalHTML: the real innerHTML to land on
// (may contain markup, e.g. a <span class="accent-text"> word).
// plainText: same content but as plain text, used to drive the scramble.
export function runTextScramble(targetEl, plainText, finalHTML, durationMs = 800) {
  if (!targetEl) return;
  if (prefersReducedMotion()) {
    targetEl.innerHTML = finalHTML;
    return;
  }
  const len = plainText.length;
  const startTime = performance.now();

  function frame(now) {
    const t = Math.min(1, (now - startTime) / durationMs);
    let out = "";
    for (let i = 0; i < len; i++) {
      const charRevealT = i / len;
      if (t > charRevealT + 0.15) {
        out += plainText[i];
      } else if (plainText[i] === " ") {
        out += " ";
      } else {
        out += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
    }
    targetEl.textContent = out;
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      targetEl.innerHTML = finalHTML;
    }
  }
  requestAnimationFrame(frame);
}
