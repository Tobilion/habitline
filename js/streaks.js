// Pure habit-logic functions — no DOM access, kept testable by reading or
// copy-pasting into node. All log-entry reads/writes go through isDone/
// getNote/setDone/setNote so callers never need to know the log shape
// (see the NOTES-STORAGE DESIGN DECISION comment in state.js).
import { todayStr, addDaysStr, compareDateStr, dowOf } from "./dates.js";
import { DAY_LABELS } from "./state.js";

export function isScheduled(habit, dateStr) {
  return habit.days.includes(dowOf(dateStr));
}

export function activeHabits(state) {
  return state.habits.filter((h) => !h.archived);
}

export function todaysHabits(state) {
  const t = todayStr();
  return activeHabits(state).filter((h) => isScheduled(h, t) && compareDateStr(h.created, t) <= 0);
}

// --- log entry accessors (handle both legacy `true` and `{done,note}` shapes) ---
export function isDone(habit, dateStr) {
  const entry = habit.log[dateStr];
  if (entry === true) return true;
  if (entry && typeof entry === "object") return !!entry.done;
  return false;
}

export function getNote(habit, dateStr) {
  const entry = habit.log[dateStr];
  if (entry && typeof entry === "object") return entry.note || "";
  return "";
}

export function setDone(habit, dateStr, val) {
  if (!val) {
    delete habit.log[dateStr];
    return;
  }
  const existingNote = getNote(habit, dateStr);
  habit.log[dateStr] = existingNote ? { done: true, note: existingNote } : true;
}

export function setNote(habit, dateStr, note) {
  const trimmed = (note || "").trim();
  if (!isDone(habit, dateStr)) return; // notes only make sense on a done day
  habit.log[dateStr] = trimmed ? { done: true, note: trimmed } : true;
}

// Current streak: count backward from today; today's miss doesn't break it
// (still "in progress"), any PRIOR scheduled+missed day stops the count.
// Unscheduled days are skipped entirely.
export function currentStreak(habit, refDateStr) {
  refDateStr = refDateStr || todayStr();
  let streak = 0,
    d = refDateStr,
    isFirstDay = true;
  while (compareDateStr(d, habit.created) >= 0) {
    if (isScheduled(habit, d)) {
      if (isDone(habit, d)) {
        streak++;
      } else if (isFirstDay && d === refDateStr) {
        // today not logged yet — don't break, don't count
      } else {
        break;
      }
    }
    isFirstDay = false;
    d = addDaysStr(d, -1);
  }
  return streak;
}

// Best streak ever: walk forward from creation.
export function bestStreak(habit, refDateStr) {
  refDateStr = refDateStr || todayStr();
  let best = 0,
    running = 0,
    d = habit.created;
  while (compareDateStr(d, refDateStr) <= 0) {
    if (isScheduled(habit, d)) {
      if (isDone(habit, d)) {
        running++;
        if (running > best) best = running;
      } else {
        running = 0;
      }
    }
    d = addDaysStr(d, 1);
  }
  return best;
}

export function flameForStreak(n) {
  if (n >= 100) return "🔥🔥🔥";
  if (n >= 30) return "🔥🔥";
  if (n >= 7) return "🔥";
  return "";
}

// % of scheduled+existing habits completed on a given day (null if none scheduled)
export function dayCompletionPct(state, dateStr) {
  const scheduled = activeHabits(state).filter((h) => isScheduled(h, dateStr) && compareDateStr(h.created, dateStr) <= 0);
  if (scheduled.length === 0) return null;
  const done = scheduled.filter((h) => isDone(h, dateStr)).length;
  return { pct: done / scheduled.length, done, total: scheduled.length };
}

export function heatmapLevel(pct) {
  if (pct === null) return 0;
  if (pct <= 0) return 0;
  if (pct < 0.34) return 1;
  if (pct < 0.67) return 2;
  if (pct < 1) return 3;
  return 4;
}

export function habitCompletionPctOverDays(habit, days) {
  const t = todayStr();
  let scheduled = 0,
    done = 0;
  for (let i = 0; i < days; i++) {
    const d = addDaysStr(t, -i);
    if (compareDateStr(d, habit.created) < 0) continue;
    if (isScheduled(habit, d)) {
      scheduled++;
      if (isDone(habit, d)) done++;
    }
  }
  return scheduled === 0 ? 0 : done / scheduled;
}

export function longestOverallStreak(state, days) {
  const t = todayStr();
  let best = 0,
    running = 0;
  for (let i = days - 1; i >= 0; i--) {
    const d = addDaysStr(t, -i);
    const info = dayCompletionPct(state, d);
    if (info && info.pct === 1) {
      running++;
      if (running > best) best = running;
    } else if (info === null) {
      /* doesn't break streak */
    } else {
      running = 0;
    }
  }
  return best;
}

export function perfectDaysCount(state, days) {
  const t = todayStr();
  let count = 0;
  for (let i = 0; i < days; i++) {
    const d = addDaysStr(t, -i);
    const info = dayCompletionPct(state, d);
    if (info && info.pct === 1) count++;
  }
  return count;
}

export function freqLabel(habit) {
  if (habit.days.length === 7) return "Daily";
  if (habit.days.length === 5 && !habit.days.includes(0) && !habit.days.includes(6)) return "Weekdays";
  return habit.days
    .slice()
    .sort()
    .map((d) => DAY_LABELS[d])
    .join(" ");
}
