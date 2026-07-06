// Settings screen: export/import JSON (via Toast), accent picker (3 presets,
// live-updates --accent/--accent-2 + persists), manage habits list
// (reorder/edit/archive/delete via Modal double-confirm), reset-all-data
// behind Modal double-confirm.
import { el } from "../dom.js";
import { todayStr } from "../dates.js";
import { migrate, ACCENT_PRESETS, defaultState } from "../state.js";
import { showToast } from "../components/toast.js";
import { openConfirmModal } from "../components/modal.js";
import { applyAccent } from "../accent.js";

// callbacks: {onSave, onRerender, onOpenEditModal, onSwitchView, onReplaceState}
export function renderSettings(state, callbacks) {
  const frag = document.createDocumentFragment();

  frag.appendChild(sectionHeading("Appearance", ""));
  frag.appendChild(renderAccentCard(state, callbacks));

  frag.appendChild(sectionHeading("Data", ""));
  frag.appendChild(renderDataCard(state, callbacks));

  frag.appendChild(sectionHeading("Manage habits", ""));
  frag.appendChild(renderManageCard(state, callbacks));

  frag.appendChild(sectionHeading("Danger zone", ""));
  frag.appendChild(renderDangerCard(state, callbacks));

  return frag;
}

function sectionHeading(label, title) {
  const wrap = el("div", { class: "section-heading fade-up" });
  wrap.appendChild(el("div", { class: "section-title", text: label }));
  if (title) wrap.appendChild(el("h2", { text: title }));
  return wrap;
}

function renderAccentCard(state, callbacks) {
  const card = el("div", { class: "card fade-up" });
  const row = el("div", { class: "accent-picker" });
  Object.keys(ACCENT_PRESETS).forEach((key) => {
    const preset = ACCENT_PRESETS[key];
    row.appendChild(
      el("button", {
        class: "accent-swatch" + (state.accent === key ? " sel" : ""),
        style: `background:linear-gradient(135deg, ${preset.a}, ${preset.b})`,
        "aria-label": preset.label,
        "aria-pressed": state.accent === key ? "true" : "false",
        onclick: () => {
          state.accent = key;
          applyAccent(key);
          callbacks.onSave();
          callbacks.onRerender();
        },
      })
    );
  });
  card.appendChild(row);
  card.appendChild(el("p", { class: "hint", text: "Pick an accent color pair used across rings, buttons, and highlights." }));
  return card;
}

function renderDataCard(state, callbacks) {
  const card = el("div", { class: "card fade-up" });
  const row = el("div", { class: "settings-row" }, [
    el("button", { class: "btn", text: "⬇ Export JSON", onclick: () => exportData(state) }),
    el("button", { class: "btn", text: "⬆ Import JSON", onclick: () => document.getElementById("import-file").click() }),
  ]);
  card.appendChild(row);
  card.appendChild(el("p", { class: "hint", text: "Export saves a JSON snapshot of every habit and its history. Import restores from that file (replaces current data)." }));
  card.appendChild(
    el("input", { type: "file", accept: "application/json", id: "import-file", style: "display:none", onchange: (e) => handleImport(e, callbacks) })
  );
  return card;
}

function renderManageCard(state, callbacks) {
  const card = el("div", { class: "card fade-up" });
  if (state.habits.length === 0) {
    card.appendChild(el("p", { class: "hint", text: "No habits yet." }));
  } else {
    state.habits.forEach((h, idx) => card.appendChild(renderManageRow(state, h, idx, callbacks)));
  }
  return card;
}

function renderManageRow(state, habit, idx, callbacks) {
  const row = el("div", { class: "bar-row" });
  row.appendChild(
    el("div", { class: "bar-label", style: "width:auto;flex:1" }, [
      document.createTextNode(habit.emoji + " " + habit.name + (habit.archived ? " (archived)" : "")),
    ])
  );
  const actions = el("div", { style: "display:flex;gap:2px" });
  actions.appendChild(el("button", { class: "btn btn-ghost btn-icon", "aria-label": "Move up", text: "↑", disabled: idx === 0 ? "disabled" : null, onclick: () => moveHabit(state, habit.id, -1, callbacks) }));
  actions.appendChild(el("button", { class: "btn btn-ghost btn-icon", "aria-label": "Move down", text: "↓", disabled: idx === state.habits.length - 1 ? "disabled" : null, onclick: () => moveHabit(state, habit.id, 1, callbacks) }));
  actions.appendChild(el("button", { class: "btn btn-ghost btn-icon", "aria-label": "Edit", text: "✏️", onclick: () => callbacks.onOpenEditModal(habit.id) }));
  actions.appendChild(el("button", { class: "btn btn-ghost btn-icon", "aria-label": habit.archived ? "Unarchive" : "Archive", text: habit.archived ? "📤" : "🗄️", onclick: () => toggleArchive(state, habit.id, callbacks) }));
  actions.appendChild(el("button", { class: "btn btn-ghost btn-icon", "aria-label": "Delete", text: "🗑️", onclick: () => confirmDeleteHabit(state, habit, callbacks) }));
  row.appendChild(actions);
  return row;
}

function moveHabit(state, id, dir, callbacks) {
  const i = state.habits.findIndex((h) => h.id === id);
  const j = i + dir;
  if (j < 0 || j >= state.habits.length) return;
  const tmp = state.habits[i];
  state.habits[i] = state.habits[j];
  state.habits[j] = tmp;
  callbacks.onSave();
  callbacks.onRerender();
}

function toggleArchive(state, id, callbacks) {
  const h = state.habits.find((h) => h.id === id);
  if (!h) return;
  h.archived = !h.archived;
  callbacks.onSave();
  callbacks.onRerender();
}

function confirmDeleteHabit(state, habit, callbacks) {
  openConfirmModal({
    title: "Delete habit?",
    message: `Delete "${habit.name}"? This removes all its history and can't be undone.`,
    confirmLabel: "Delete",
    danger: true,
    doubleConfirm: true,
    onConfirm: () => {
      state.habits = state.habits.filter((x) => x.id !== habit.id);
      callbacks.onSave();
      callbacks.onRerender();
      showToast(`Deleted "${habit.name}".`, "info");
    },
  });
}

function renderDangerCard(state, callbacks) {
  const card = el("div", { class: "card fade-up" });
  card.appendChild(
    el("button", {
      class: "btn btn-danger",
      text: "Reset all data",
      style: "width:100%",
      onclick: () => confirmResetAll(state, callbacks),
    })
  );
  return card;
}

function confirmResetAll(state, callbacks) {
  openConfirmModal({
    title: "Reset all data?",
    message: "This will permanently delete ALL habits and history.",
    confirmLabel: "Reset everything",
    danger: true,
    doubleConfirm: true,
    onConfirm: () => {
      const fresh = defaultState();
      callbacks.onReplaceState(fresh);
      callbacks.onSwitchView("today");
      showToast("All data has been reset.", "info");
    },
  });
}

function exportData(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `habitline-export-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("Export downloaded.", "success");
}

function handleImport(e, callbacks) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !Array.isArray(parsed.habits)) throw new Error("Invalid file format");
      const migrated = migrate(parsed);
      callbacks.onReplaceState(migrated);
      callbacks.onSwitchView("today");
      showToast("Import successful.", "success");
    } catch (err) {
      showToast("Could not import: " + err.message, "error");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}
