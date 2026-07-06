// Stats screen: ScrollProgressBar, 26-week heatmap with tooltips, stat cards
// (AnimatedCounter + SpotlightCard), per-habit completion bars (animate on
// scroll into view), milestone timeline + newly-earned milestone takeover.
import { el } from "../dom.js";
import { todayStr, addDaysStr, formatFriendly } from "../dates.js";
import {
  activeHabits,
  dayCompletionPct,
  heatmapLevel,
  habitCompletionPctOverDays,
  perfectDaysCount,
  currentStreak,
  bestStreak,
  getNote,
} from "../streaks.js";
import { MILESTONE_THRESHOLDS } from "../state.js";
import { mountScrollProgressBar, removeScrollProgressBar } from "../components/scrollProgressBar.js";
import { attachAnimatedCounter } from "../components/animatedCounter.js";
import { attachSpotlight } from "../components/spotlightCard.js";
import { attachTilt } from "../components/tiltCard.js";
import { makeEmptyState } from "../components/emptyState.js";
import { fireConfetti } from "../confetti.js";

// Module-level flag: heatmap cells only get the diagonal-stagger entrance
// animation on the FIRST Stats view per session, not every re-render.
let heatmapAnimatedThisSession = false;

let tooltipEl = null;
function showTooltip(e, dateStr, info, note) {
  hideTooltip();
  let text = info ? `${formatFriendly(dateStr)} — ${info.done}/${info.total} done` : `${formatFriendly(dateStr)} — nothing scheduled`;
  if (note) text += ` · "${note}"`;
  tooltipEl = el("div", { class: "tooltip", text });
  document.body.appendChild(tooltipEl);
  const rect = e.currentTarget.getBoundingClientRect();
  tooltipEl.style.left = rect.left + rect.width / 2 + "px";
  tooltipEl.style.top = rect.top + "px";
}
function hideTooltip() {
  if (tooltipEl) {
    tooltipEl.remove();
    tooltipEl = null;
  }
}

function totalBox(num, label, id) {
  const numEl = el("div", { class: "num", id });
  return el("div", { class: "total-box" }, [numEl, el("div", { class: "lbl", text: label })]);
}

function computeAllMilestones(state) {
  // Scan every habit's current + best streak against thresholds. A milestone
  // is "earned" if best streak ever reached >= threshold.
  const earned = [];
  activeHabits(state).forEach((h) => {
    const best = bestStreak(h);
    MILESTONE_THRESHOLDS.forEach((th) => {
      if (best >= th) earned.push({ habitId: h.id, habitName: h.name, emoji: h.emoji, threshold: th, key: `${h.id}:${th}` });
    });
  });
  return earned;
}

// callbacks: {onSave, onRerender}
export function renderStats(state, callbacks) {
  const frag = document.createDocumentFragment();
  const habits = activeHabits(state);

  mountScrollProgressBar();

  if (habits.length === 0) {
    removeScrollProgressBar();
    frag.appendChild(makeEmptyState({ headline: "Nothing to show yet", sub: "Add a habit to start tracking your progress." }));
    return frag;
  }

  frag.appendChild(sectionHeading("Activity", "Last 26 weeks"));
  frag.appendChild(renderHeatmapCard(state));

  frag.appendChild(sectionHeading("Totals", ""));
  const totals = el("div", { class: "totals-grid fade-up" }, [
    totalBox(0, "Best current streak", "stat-current"),
    totalBox(0, "Best streak ever", "stat-best"),
    totalBox(0, "Perfect days", "stat-perfect"),
    totalBox(0, "Total check-ins", "stat-checkins"),
  ]);
  frag.appendChild(totals);

  requestAnimationFrame(() => {
    const bestCurrent = habits.reduce((m, h) => Math.max(m, currentStreak(h)), 0);
    const bestEver = habits.reduce((m, h) => Math.max(m, bestStreak(h)), 0);
    const perfectDays = perfectDaysCount(state, 3650);
    const totalCheckins = habits.reduce((sum, h) => sum + Object.keys(h.log).length, 0);
    attachAnimatedCounter(document.getElementById("stat-current"), bestCurrent);
    attachAnimatedCounter(document.getElementById("stat-best"), bestEver);
    attachAnimatedCounter(document.getElementById("stat-perfect"), perfectDays);
    attachAnimatedCounter(document.getElementById("stat-checkins"), totalCheckins);
  });

  frag.appendChild(sectionHeading("Completion", "Last 30 days"));
  const barsCard = el("div", { class: "card spotlight-card fade-up" });
  attachSpotlight(barsCard);
  attachTilt(barsCard);
  habits.forEach((h) => {
    const pct = habitCompletionPctOverDays(h, 30);
    const fill = el("div", { class: "bar-fill", style: `background:linear-gradient(90deg, ${h.color}, var(--accent-2));` });
    const row = el("div", { class: "bar-row" }, [
      el("div", { class: "bar-label" }, [document.createTextNode(h.emoji + " " + h.name)]),
      el("div", { class: "bar-track" }, [fill]),
      el("div", { class: "bar-pct", text: Math.round(pct * 100) + "%" }),
    ]);
    barsCard.appendChild(row);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          requestAnimationFrame(() => (fill.style.width = Math.round(pct * 100) + "%"));
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(row);
  });
  frag.appendChild(barsCard);

  frag.appendChild(sectionHeading("Milestones", "7 / 30 / 100-day streaks"));
  frag.appendChild(renderMilestoneTimeline(state, callbacks));

  return frag;
}

function sectionHeading(label, title) {
  const wrap = el("div", { class: "section-heading fade-up" });
  wrap.appendChild(el("div", { class: "section-title", text: label }));
  if (title) wrap.appendChild(el("h2", { text: title }));
  return wrap;
}

function renderHeatmapCard(state) {
  const card = el("div", { class: "card fade-up" });
  const scroll = el("div", { class: "heatmap-scroll" });
  const grid = el("div", { class: "heatmap" });
  const t = todayStr();
  const totalDays = 26 * 7;
  const startOffset = totalDays - 1;
  const cells = [];
  for (let i = startOffset; i >= 0; i--) {
    const d = addDaysStr(t, -i);
    const info = dayCompletionPct(state, d);
    const lvl = info ? heatmapLevel(info.pct) : 0;
    const cell = el("div", { class: "hcell", "data-lvl": String(lvl), tabindex: "0", "aria-label": d });
    const note = findAnyNoteForDate(state, d);
    cell.addEventListener("mouseenter", (e) => showTooltip(e, d, info, note));
    cell.addEventListener("focus", (e) => showTooltip(e, d, info, note));
    cell.addEventListener("mouseleave", hideTooltip);
    cell.addEventListener("blur", hideTooltip);
    cell.addEventListener("click", (e) => showTooltip(e, d, info, note));
    grid.appendChild(cell);
    cells.push(cell);
  }
  scroll.appendChild(grid);
  card.appendChild(scroll);

  const legend = el("div", { class: "heatmap-legend" }, [
    el("span", { text: "Less" }),
    el("div", { class: "hcell", "data-lvl": "0" }),
    el("div", { class: "hcell", "data-lvl": "1" }),
    el("div", { class: "hcell", "data-lvl": "2" }),
    el("div", { class: "hcell", "data-lvl": "3" }),
    el("div", { class: "hcell", "data-lvl": "4" }),
    el("span", { text: "More" }),
  ]);
  card.appendChild(legend);

  requestAnimationFrame(() => {
    scroll.scrollLeft = scroll.scrollWidth;
    if (!heatmapAnimatedThisSession) {
      heatmapAnimatedThisSession = true;
      cells.forEach((cell, i) => {
        const col = Math.floor(i / 7);
        const row = i % 7;
        const delay = (col + row) * 6;
        setTimeout(() => cell.classList.add("hcell-in"), delay);
      });
    } else {
      cells.forEach((cell) => cell.classList.add("hcell-in"));
    }
  });

  return card;
}

function findAnyNoteForDate(state, dateStr) {
  for (const h of activeHabits(state)) {
    const note = getNote(h, dateStr);
    if (note) return note;
  }
  return "";
}

function renderMilestoneTimeline(state, callbacks) {
  const earned = computeAllMilestones(state);
  const timeline = el("div", { class: "milestone-timeline fade-up" });

  if (earned.length === 0) {
    timeline.appendChild(el("p", { class: "hint", text: "No milestones unlocked yet — keep your streaks alive to earn 7/30/100-day badges." }));
    return timeline;
  }

  earned.forEach((m) => {
    timeline.appendChild(
      el("div", { class: "badge", title: `${m.habitName}: ${m.threshold}-day streak` }, [
        document.createTextNode(`${m.emoji} ${m.threshold}d`),
      ])
    );
  });

  // Detect newly-earned milestones (not yet in state.milestonesSeen) and show
  // a full-screen takeover celebration the first time Stats is viewed after
  // being earned.
  const newOnes = earned.filter((m) => !state.milestonesSeen.includes(m.key));
  if (newOnes.length > 0) {
    requestAnimationFrame(() => showMilestoneTakeover(state, newOnes[0], callbacks));
  }

  return timeline;
}

function showMilestoneTakeover(state, milestone, callbacks) {
  const takeover = el("div", { class: "takeover" });
  const panel = el("div", { class: "panel" }, [
    el("div", { class: "badge-big", text: milestone.emoji }),
    el("h2", { text: "Milestone unlocked!" }),
    el("p", { text: `${milestone.habitName} reached a ${milestone.threshold}-day streak.` }),
    el("button", {
      class: "btn btn-primary",
      text: "Nice!",
      onclick: () => {
        state.milestonesSeen.push(milestone.key);
        callbacks.onSave();
        takeover.remove();
      },
    }),
  ]);
  takeover.appendChild(panel);
  document.body.appendChild(takeover);
  fireConfetti();
}
                        