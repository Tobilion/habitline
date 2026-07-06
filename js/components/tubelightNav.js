// TubelightNav — nav/tab bar with a sliding pill active-indicator + glow.
// Used for: Today/Stats/Settings header nav (header.js) AND the
// Daily/Weekdays/Custom segmented control in the habit modal (habitModal.js).
import { el } from "../dom.js";

// items: [{key, label}], activeKey: string, onSelect: (key) => void
export function makeTubelightNav(items, activeKey, onSelect) {
  const nav = el("div", { class: "tubelight-nav", role: "tablist" });
  const pill = el("div", { class: "tubelight-pill" });
  nav.appendChild(pill);

  const buttons = items.map((item) =>
    el("button", {
      class: "tubelight-item" + (item.key === activeKey ? " active" : ""),
      role: "tab",
      "aria-selected": item.key === activeKey ? "true" : "false",
      text: item.label,
      onclick: () => onSelect(item.key),
    })
  );
  buttons.forEach((b) => nav.appendChild(b));

  // Position the pill under the active button once mounted in the DOM.
  requestAnimationFrame(() => {
    const activeBtn = buttons.find((b) => b.classList.contains("active"));
    if (!activeBtn) return;
    pill.style.width = activeBtn.offsetWidth + "px";
    pill.style.left = activeBtn.offsetLeft + "px";
  });

  return nav;
}
