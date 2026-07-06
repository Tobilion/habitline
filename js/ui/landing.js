// Landing screen — shown when zero habits exist at all. Replaces the old
// bare renderEmptyState() for this specific case with a full hero treatment.
import { el } from "../dom.js";
import { makeGlowOrb } from "../components/glowOrb.js";
import { runTextScramble } from "../components/textScramble.js";
import { attachMagnetic } from "../components/magneticButton.js";
import { attachAnimatedCounter } from "../components/animatedCounter.js";

const HERO_PLAIN = "Build habits that stick.";
const HERO_HTML = 'Build habits that <span class="accent-text">stick.</span>';

// Fabricated ~10x7 demo heatmap — purely illustrative, not real data.
function makeDemoHeatmap() {
  const grid = el("div", { class: "demo-heatmap" });
  const cells = [];
  for (let i = 0; i < 70; i++) {
    // Deterministic pseudo-random fill pattern so it looks organic but is stable across renders.
    const seed = (i * 37 + 11) % 100;
    const lvl = seed < 25 ? 0 : seed < 45 ? 1 : seed < 65 ? 2 : seed < 85 ? 3 : 4;
    const cell = el("div", { class: "demo-cell", "data-lvl": String(lvl) });
    if (lvl > 0) {
      const colors = ["", "#0a3d2e", "#0f6b4d", "#10a06e", "var(--grad)"];
      cell.style.background = lvl === 4 ? "var(--grad)" : colors[lvl];
    }
    cells.push(cell);
    grid.appendChild(cell);
  }
  // Wave-animate cells filling on load, staggered diagonally-ish by index.
  requestAnimationFrame(() => {
    cells.forEach((cell, i) => {
      setTimeout(() => cell.classList.add("demo-in"), i * 12);
    });
  });
  return grid;
}

// onStartHabit: () => void — opens the add-habit modal
export function renderLanding(onStartHabit) {
  const wrap = el("div", { class: "landing" }, [
    makeGlowOrb({ size: 420, top: "-120px", left: "-140px", opacity: 0.16 }),
    makeGlowOrb({ size: 380, bottom: "-100px", right: "-120px", opacity: 0.14, colorA: "var(--accent-2)", colorB: "var(--accent)" }),
  ]);

  const hero = el("h1", {});
  wrap.appendChild(hero);
  requestAnimationFrame(() => runTextScramble(hero, HERO_PLAIN, HERO_HTML));

  wrap.appendChild(
    el("p", { class: "sub fade-up", text: "Check in daily. Watch your streaks grow. Never break the chain." })
  );

  const cta = el("button", { class: "btn btn-primary", text: "Start your first habit", onclick: onStartHabit, style: "font-size:15px;padding:14px 26px;" });
  attachMagnetic(cta);
  wrap.appendChild(el("div", {}, [cta]));

  const demoRow = el("div", { class: "demo-row fade-up" });
  demoRow.appendChild(makeDemoHeatmap());
  const streakLabel = el("div", { class: "demo-streak" }, [el("strong", {}), document.createTextNode("day streak")]);
  demoRow.appendChild(streakLabel);
  wrap.appendChild(demoRow);

  requestAnimationFrame(() => attachAnimatedCounter(streakLabel.querySelector("strong"), 23, { duration: 1000 }));

  return wrap;
}
