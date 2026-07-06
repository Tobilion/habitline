// TiltCard — 3D tilt on cursor move (rotateX/rotateY up to ±10deg).
// Combine with SpotlightCard on the same element for the full effect
// (see today.js habit cards and stats.js stat cards).
// Respects prefers-reduced-motion by no-op'ing the transform updates.
import { prefersReducedMotion } from "../dom.js";

const MAX_DEG = 10;

export function attachTilt(elNode) {
  if (!elNode) return;
  elNode.classList.add("tilt-card");
  if (prefersReducedMotion()) return;

  elNode.addEventListener("mousemove", (e) => {
    const rect = elNode.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0..1
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * 2 * MAX_DEG;
    const rotX = (0.5 - py) * 2 * MAX_DEG;
    elNode.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
  });
  elNode.addEventListener("mouseleave", () => {
    elNode.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
  });
}
