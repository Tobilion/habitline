// Applies the persisted accent preset to <html> by swapping the
// html.accent-<key> class (values defined in styles/tokens.css).
import { ACCENT_PRESETS } from "./state.js";

export function applyAccent(key) {
  const root = document.documentElement;
  Object.keys(ACCENT_PRESETS).forEach((k) => root.classList.remove("accent-" + k));
  const valid = ACCENT_PRESETS[key] ? key : "default";
  root.classList.add("accent-" + valid);
}
