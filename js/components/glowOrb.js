// GlowOrb — fixed ambient blurred orb, purely decorative background chrome.
// Use 2-3 per screen (landing.js uses 2: top-left, bottom-right).
import { el } from "../dom.js";

// opts: {size:number, top/left/right/bottom: css strings, colorA, colorB, opacity}
export function makeGlowOrb(opts) {
  const { size = 400, top, left, right, bottom, colorA = "var(--accent)", colorB = "var(--accent-2)", opacity = 0.15 } = opts || {};
  const style = [
    `width:${size}px`,
    `height:${size}px`,
    top != null ? `top:${top}` : "",
    left != null ? `left:${left}` : "",
    right != null ? `right:${right}` : "",
    bottom != null ? `bottom:${bottom}` : "",
    `background:linear-gradient(135deg, ${colorA}, ${colorB})`,
    `opacity:${opacity}`,
  ]
    .filter(Boolean)
    .join(";");
  return el("div", { class: "glow-orb", style, "aria-hidden": "true" });
}
