// MagneticButton — CTA attracted toward the cursor at 0.3x offset from its
// center, springs back on mouseleave, press-scale 0.97 on click.
// Used on: "Start your first habit" (landing.js) and "+ Add Habit" (today.js).
import { prefersReducedMotion } from "../dom.js";

const PULL = 0.3;

export function attachMagnetic(elNode) {
  if (!elNode) return;
  elNode.classList.add("magnetic-btn");
  if (prefersReducedMotion()) return;

  elNode.addEventListener("mousemove", (e) => {
    const rect = elNode.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    elNode.style.transform = `translate(${(dx * PULL).toFixed(1)}px, ${(dy * PULL).toFixed(1)}px)`;
  });
  elNode.addEventListener("mouseleave", () => {
    elNode.style.transform = "translate(0, 0)";
  });
  elNode.addEventListener("mousedown", () => {
    elNode.style.transform += " scale(0.97)";
  });
  elNode.addEventListener("mouseup", () => {
    elNode.style.transform = elNode.style.transform.replace(" scale(0.97)", "");
  });
}
