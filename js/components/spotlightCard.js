// SpotlightCard — cursor-follow radial glow.
// Attaches a mousemove listener that updates --mx/--my CSS vars on the
// element, matched by the `.spotlight-card::before` radial-gradient in
// components.css. Toggles `.spotlight-active` while the pointer is over it.
// Used on: habit cards (today.js) and stat cards (stats.js).
export function attachSpotlight(elNode) {
  if (!elNode) return;
  elNode.classList.add("spotlight-card");
  elNode.addEventListener("mousemove", (e) => {
    const rect = elNode.getBoundingClientRect();
    elNode.style.setProperty("--mx", e.clientX - rect.left + "px");
    elNode.style.setProperty("--my", e.clientY - rect.top + "px");
    elNode.classList.add("spotlight-active");
  });
  elNode.addEventListener("mouseleave", () => {
    elNode.classList.remove("spotlight-active");
  });
}
