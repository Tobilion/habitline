// Header: sticky logo/wordmark + TubelightNav (Today/Stats/Settings) + date chip.
// Only shown once at least one habit exists (Landing screen has no header).
import { el } from "../dom.js";
import { makeTubelightNav } from "../components/tubelightNav.js";
import { formatFriendly, todayStr } from "../dates.js";

// onNavigate: (viewKey) => void
export function renderHeader(currentView, onNavigate) {
  const nav = makeTubelightNav(
    [
      { key: "today", label: "Today" },
      { key: "stats", label: "Stats" },
      { key: "settings", label: "Settings" },
    ],
    currentView,
    onNavigate
  );

  return el("header", { class: "top" }, [
    el("div", { class: "brand" }, [document.createTextNode("🌿 "), el("span", { class: "accent-text", text: "Habitline" })]),
    nav,
    el("div", { class: "date-chip", text: formatFriendly(todayStr()) }),
  ]);
}
