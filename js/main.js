// App bootstrap: loads state, mounts a brief skeleton loader, then renders
// through the screen assembly modules. Single re-render entrypoint pattern
// (render() rebuilds #app innerHTML each time — no diffing/vdom), matching
// the original monolith's philosophy but organized across ui/ modules.
import { loadState, saveState } from "./storage.js";
import { activeHabits, todaysHabits, isDone } from "./streaks.js";
import { todayStr } from "./dates.js";
import { applyAccent } from "./accent.js";
import { makeSkeletonLoader } from "./components/skeletonLoader.js";
import { closeModal, isModalOpen } from "./components/modal.js";
import { resizeConfettiCanvas, maybeFireConfetti } from "./confetti.js";
import { renderHeader } from "./ui/header.js";
import { renderLanding } from "./ui/landing.js";
import { renderToday } from "./ui/today.js";
import { renderStats } from "./ui/stats.js";
import { renderSettings } from "./ui/settings.js";
import { openAddHabitModal, openEditHabitModal } from "./ui/habitModal.js";

let state = loadState();
let view = "today"; // 'today' | 'stats' | 'settings'

const app = document.getElementById("app");

function persist() {
  saveState(state);
}

function replaceState(newState) {
  state = newState;
}

function switchView(nextView) {
  view = nextView;
  render();
}

const callbacks = {
  onSave: persist,
  onRerender: render,
  onOpenAddModal: () => openAddHabitModal(state, () => { persist(); render(); }),
  onOpenEditModal: (habitId) => openEditHabitModal(state, habitId, () => { persist(); render(); }),
  onSwitchView: switchView,
  onReplaceState: (s) => { replaceState(s); persist(); render(); },
};

function render() {
  app.innerHTML = "";
  applyAccent(state.accent);

  if (activeHabits(state).length === 0 && state.habits.length === 0) {
    app.appendChild(renderLanding(callbacks.onOpenAddModal));
  } else {
    app.appendChild(renderHeader(view, switchView));
    if (view === "today") app.appendChild(renderToday(state, callbacks));
    else if (view === "stats") app.appendChild(renderStats(state, callbacks));
    else if (view === "settings") app.appendChild(renderSettings(state, callbacks));
  }

  const todays = todaysHabits(state);
  maybeFireConfetti(state, todays, isDone, todayStr, persist);
}

function wireGlobalEvents() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isModalOpen()) closeModal();
  });
  window.addEventListener("resize", resizeConfettiCanvas);
}

function boot() {
  wireGlobalEvents();
  resizeConfettiCanvas();
  app.appendChild(makeSkeletonLoader());
  // Simulate a brief load so the SkeletonLoader is demonstrably present
  // (there is no real network request to wait on in this app).
  setTimeout(() => {
    render();
  }, 150);
}

boot();
