// Toast system — bottom-right stack, slide-in+fade, success/error/info
// variants with icon + accent left-border, auto-dismiss after 3.5s with a
// shrinking progress line, max 3 stacked. Replaces ALL alert() calls in the app.
import { el } from "../dom.js";

const ICONS = { success: "✅", error: "⚠️", info: "ℹ️" };
const MAX_TOASTS = 3;
const DISMISS_MS = 3500;

let stackEl = null;

function ensureStack() {
  if (stackEl && document.body.contains(stackEl)) return stackEl;
  stackEl = el("div", { class: "toast-stack", "aria-live": "polite" });
  document.body.appendChild(stackEl);
  return stackEl;
}

// type: "success" | "error" | "info"
export function showToast(message, type = "info") {
  const stack = ensureStack();
  const toast = el("div", { class: "toast toast-" + type }, [
    el("span", { class: "toast-icon", text: ICONS[type] || ICONS.info }),
    el("span", { class: "toast-msg", text: message }),
  ]);
  toast.appendChild(el("div", { class: "toast-progress" }));
  stack.appendChild(toast);

  // Enforce max stacked toasts (oldest removed first).
  while (stack.children.length > MAX_TOASTS) {
    stack.removeChild(stack.children[0]);
  }

  const timer = setTimeout(() => dismiss(toast), DISMISS_MS);
  toast.addEventListener("click", () => {
    clearTimeout(timer);
    dismiss(toast);
  });
}

function dismiss(toast) {
  if (!toast.isConnected) return;
  toast.style.transition = "opacity 200ms ease, transform 200ms ease";
  toast.style.opacity = "0";
  toast.style.transform = "translateX(24px)";
  setTimeout(() => toast.remove(), 200);
}
