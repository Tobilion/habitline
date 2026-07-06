// Add/edit habit modal — built on the shared Modal component + TubelightNav
// used as the Daily/Weekdays/Custom segmented control. Validation errors go
// through Toast instead of alert().
import { el } from "../dom.js";
import { openModal, closeModal } from "../components/modal.js";
import { makeTubelightNav } from "../components/tubelightNav.js";
import { showToast } from "../components/toast.js";
import { EMOJI_CHOICES, COLOR_CHOICES, DAY_LABELS, DAY_LABELS_FULL, uid } from "../state.js";
import { todayStr } from "../dates.js";

let draft = null;
let editingHabitId = null;

function freqKeyFromDays(days) {
  const isWeekdays = days.length === 5 && !days.includes(0) && !days.includes(6);
  const isDaily = days.length === 7;
  return isDaily ? "daily" : isWeekdays ? "weekdays" : "custom";
}

// onSaved: (state) => void — called after mutating state.habits, caller re-renders + saves.
export function openAddHabitModal(state, onSaved) {
  editingHabitId = null;
  draft = { name: "", emoji: EMOJI_CHOICES[0], color: COLOR_CHOICES[0], freq: "daily", days: [0, 1, 2, 3, 4, 5, 6] };
  renderHabitModal(state, onSaved);
}

export function openEditHabitModal(state, habitId, onSaved) {
  const h = state.habits.find((x) => x.id === habitId);
  if (!h) return;
  editingHabitId = habitId;
  draft = { name: h.name, emoji: h.emoji, color: h.color, freq: freqKeyFromDays(h.days), days: h.days.slice() };
  renderHabitModal(state, onSaved);
}

function renderHabitModal(state, onSaved) {
  const body = [];

  // name
  const nameInput = el("input", {
    type: "text",
    id: "habit-name-input",
    value: draft.name,
    maxlength: "40",
    placeholder: "e.g. Drink water",
    oninput: (e) => {
      draft.name = e.target.value;
    },
  });
  body.push(
    el("div", { class: "field" }, [el("label", { text: "Name", for: "habit-name-input" }), nameInput])
  );

  // emoji grid
  const emojiGrid = el("div", { class: "emoji-grid" });
  EMOJI_CHOICES.forEach((em) => {
    emojiGrid.appendChild(
      el("button", {
        class: "emoji-opt" + (draft.emoji === em ? " sel" : ""),
        text: em,
        "aria-label": "Pick icon " + em,
        "aria-pressed": draft.emoji === em ? "true" : "false",
        onclick: () => {
          draft.emoji = em;
          renderHabitModal(state, onSaved);
        },
      })
    );
  });
  body.push(el("div", { class: "field" }, [el("label", { text: "Icon" }), emojiGrid]));

  // color row
  const colorRow = el("div", { class: "color-row" });
  COLOR_CHOICES.forEach((c) => {
    colorRow.appendChild(
      el("button", {
        class: "color-opt" + (draft.color === c ? " sel" : ""),
        style: `background:${c}`,
        "aria-label": "Pick color " + c,
        "aria-pressed": draft.color === c ? "true" : "false",
        onclick: () => {
          draft.color = c;
          renderHabitModal(state, onSaved);
        },
      })
    );
  });
  body.push(el("div", { class: "field" }, [el("label", { text: "Color" }), colorRow]));

  // frequency segmented control (TubelightNav) + custom day toggles
  const freqField = el("div", { class: "field" });
  freqField.appendChild(el("label", { text: "Frequency" }));
  const freqNav = makeTubelightNav(
    [
      { key: "daily", label: "Daily" },
      { key: "weekdays", label: "Weekdays" },
      { key: "custom", label: "Custom" },
    ],
    draft.freq,
    (key) => {
      draft.freq = key;
      if (key === "daily") draft.days = [0, 1, 2, 3, 4, 5, 6];
      else if (key === "weekdays") draft.days = [1, 2, 3, 4, 5];
      renderHabitModal(state, onSaved);
    }
  );
  freqField.appendChild(freqNav);

  if (draft.freq === "custom") {
    const dayRow = el("div", { class: "day-row", style: "margin-top:10px;" });
    DAY_LABELS.forEach((lbl, idx) => {
      const sel = draft.days.includes(idx);
      dayRow.appendChild(
        el("button", {
          class: "day-btn" + (sel ? " sel" : ""),
          text: lbl,
          "aria-label": DAY_LABELS_FULL[idx],
          "aria-pressed": sel ? "true" : "false",
          onclick: () => {
            draft.days = sel ? draft.days.filter((d) => d !== idx) : draft.days.concat(idx);
            renderHabitModal(state, onSaved);
          },
        })
      );
    });
    freqField.appendChild(dayRow);
  }
  body.push(freqField);

  const actions = [
    el("button", { class: "btn", text: "Cancel", onclick: () => closeModal() }),
    el("button", {
      class: "btn btn-primary",
      text: editingHabitId ? "Save" : "Add Habit",
      onclick: () => saveHabit(state, onSaved),
    }),
  ];

  openModal({
    title: editingHabitId ? "Edit Habit" : "New Habit",
    bodyNodes: body,
    actions,
    focusSelector: "#habit-name-input",
  });
}

function saveHabit(state, onSaved) {
  const name = draft.name.trim();
  if (!name) {
    showToast("Please enter a name.", "error");
    return;
  }
  if (draft.days.length === 0) {
    showToast("Please pick at least one day.", "error");
    return;
  }

  if (editingHabitId) {
    const h = state.habits.find((x) => x.id === editingHabitId);
    h.name = name;
    h.emoji = draft.emoji;
    h.color = draft.color;
    h.days = draft.days.slice().sort();
  } else {
    state.habits.push({
      id: uid(),
      name,
      emoji: draft.emoji,
      color: draft.color,
      days: draft.days.slice().sort(),
      created: todayStr(),
      archived: false,
      log: {},
    });
  }
  closeModal();
  editingHabitId = null;
  draft = null;
  onSaved(state);
}
