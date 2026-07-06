// Modal — backdrop blur(8px)+fade, panel scale 0.96->1 + translateY(8px->0)
// over 200ms, Esc + backdrop-click close, focus trap.
// Replaces the add/edit habit modal AND every confirm() dialog (delete-habit,
// reset-all-data double-confirm) — see js/ui/habitModal.js and
// js/ui/settings.js for call sites.
import { el } from "../dom.js";

let activeBackdrop = null;
let previouslyFocused = null;

function trapFocus(e, panel) {
  if (e.key !== "Tab") return;
  const focusable = panel.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

// opts: {title, bodyNodes: [Node], actions: [Node], onClose, focusSelector}
export function openModal(opts) {
  closeModal(); // only one modal at a time
  previouslyFocused = document.activeElement;

  const panel = el("div", { class: "modal", role: "dialog", "aria-modal": "true" });
  if (opts.title) panel.appendChild(el("h2", { text: opts.title }));
  (opts.bodyNodes || []).forEach((n) => panel.appendChild(n));
  if (opts.actions && opts.actions.length) {
    panel.appendChild(el("div", { class: "modal-actions" }, opts.actions));
  }

  const backdrop = el("div", {
    class: "modal-backdrop",
    onclick: (e) => {
      if (e.target === backdrop) closeModal(opts.onClose);
    },
  });
  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);

  const keyHandler = (e) => {
    if (e.key === "Escape") closeModal(opts.onClose);
    else trapFocus(e, panel);
  };
  backdrop.addEventListener("keydown", keyHandler);

  requestAnimationFrame(() => {
    backdrop.classList.add("open");
    const target = opts.focusSelector ? panel.querySelector(opts.focusSelector) : panel.querySelector("input, button");
    if (target) target.focus();
  });

  activeBackdrop = backdrop;
  return backdrop;
}

export function closeModal(onClose) {
  if (!activeBackdrop) return;
  activeBackdrop.remove();
  activeBackdrop = null;
  if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
  previouslyFocused = null;
  if (onClose) onClose();
}

export function isModalOpen() {
  return !!activeBackdrop;
}

// Convenience: confirmation modal replacing window.confirm(). Supports an
// optional second "really sure" step (double confirm) via `doubleConfirm`.
export function openConfirmModal({ title, message, confirmLabel = "Confirm", danger = true, doubleConfirm = false, onConfirm }) {
  const step1Body = [el("p", { text: message, style: "color:var(--muted);font-size:14px;" })];
  const step1Actions = [
    el("button", { class: "btn", text: "Cancel", onclick: () => closeModal() }),
    el("button", {
      class: "btn " + (danger ? "btn-danger" : "btn-primary"),
      text: confirmLabel,
      onclick: () => {
        if (!doubleConfirm) {
          closeModal();
          onConfirm();
          return;
        }
        openModal({
          title: "Really sure?",
          bodyNodes: [el("p", { text: "There is no undo after this second confirmation.", style: "color:var(--muted);font-size:14px;" })],
          actions: [
            el("button", { class: "btn", text: "Cancel", onclick: () => closeModal() }),
            el("button", {
              class: "btn btn-danger",
              text: "Yes, really",
              onclick: () => {
                closeModal();
                onConfirm();
              },
            }),
          ],
        });
      },
    }),
  ];
  openModal({ title, bodyNodes: step1Body, actions: step1Actions });
}
