// State shape, defaults, and migration. No DOM access — pure data module.
//
// STORAGE_KEY stays "habitline.state.v1" even though VERSION is now 2 — the
// key names the localStorage slot, not the schema version (matches CLAUDE.md).
//
// NOTES-STORAGE DESIGN DECISION (see CLAUDE.md for the canonical writeup too):
// Rather than adding a separate `state.notes` map, log entries were upgraded
// in place: `habit.log[dateStr]` can be either
//   - `true`                        (legacy v1 shape, means "done, no note")
//   - `{ done: true, note: "..." }` (v2 shape, set whenever a note is added)
// This keeps a single source of truth per (habit, date) instead of two
// parallel structures that could drift out of sync. All reads/writes go
// through isDone/getNote/setDone/setNote in streaks.js so callers never
// touch the raw shape directly.

export const STORAGE_KEY = "habitline.state.v1";
export const VERSION = 2;

export const EMOJI_CHOICES = ["💧", "🏃", "📚", "🧘", "🥗", "💤", "🚭", "💊", "✍️", "🎯", "🧹", "🎸", "☀️", "🦷", "🚴", "🙏"];
export const COLOR_CHOICES = ["#10b981", "#2dd4bf", "#60a5fa", "#a78bfa", "#f472b6", "#fb923c", "#facc15", "#f87171"];
export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
export const DAY_LABELS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Accent presets: key -> {name, a, b}. Applied via html.accent-<key> class in tokens.css.
export const ACCENT_PRESETS = {
  default: { label: "Emerald", a: "#10b981", b: "#2dd4bf" },
  sunset: { label: "Sunset", a: "#fb923c", b: "#f472b6" },
  violet: { label: "Violet", a: "#a78bfa", b: "#60a5fa" },
};

export const MILESTONE_THRESHOLDS = [7, 30, 100];

export function defaultState() {
  return {
    habits: [],
    version: VERSION,
    confettiShownDate: null,
    accent: "default",
    milestonesSeen: [],
  };
}

export function uid() {
  return "h_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// Upgrade a raw log entry (habit.log[dateStr]) to the canonical object shape
// without mutating the original; used internally by migrate().
function normalizeLogEntry(entry) {
  if (entry === true) return { done: true };
  if (entry && typeof entry === "object") return { done: !!entry.done, note: entry.note || undefined };
  return null;
}

export function migrate(s) {
  if (!s || typeof s !== "object") return defaultState();
  if (!Array.isArray(s.habits)) s.habits = [];
  if (s.version == null) s.version = 1;

  s.habits.forEach((h) => {
    if (!h.log || typeof h.log !== "object") h.log = {};
    const nextLog = {};
    for (const dateStr in h.log) {
      const norm = normalizeLogEntry(h.log[dateStr]);
      if (norm && norm.done) {
        // Keep the lightweight `true` shape when there's no note, upgrade to
        // object shape only when a note is present — smaller storage footprint.
        nextLog[dateStr] = norm.note ? norm : true;
      }
    }
    h.log = nextLog;
  });

  if (s.confettiShownDate === undefined) s.confettiShownDate = null;
  if (typeof s.accent !== "string" || !ACCENT_PRESETS[s.accent]) s.accent = "default";
  if (!Array.isArray(s.milestonesSeen)) s.milestonesSeen = [];

  s.version = VERSION;
  return s;
}
