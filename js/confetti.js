// Confetti: full-screen canvas burst (perfect-day celebration) PLUS a small
// local/contained particle burst variant for the per-habit check button.
// Both respect prefers-reduced-motion (skip entirely if reduced).
import { prefersReducedMotion } from "./dom.js";

const PALETTE = ["#10b981", "#2dd4bf", "#60a5fa", "#facc15", "#f472b6"];

let canvas = null;

function getCanvas() {
  if (!canvas) canvas = document.getElementById("confetti");
  return canvas;
}

export function resizeConfettiCanvas() {
  const c = getCanvas();
  if (!c) return;
  c.width = window.innerWidth;
  c.height = window.innerHeight;
}

// Full-screen celebration — fired when all of today's habits are done.
export function fireConfetti() {
  if (prefersReducedMotion()) return;
  const c = getCanvas();
  if (!c) return;
  const ctx = c.getContext("2d");
  c.width = window.innerWidth;
  c.height = window.innerHeight;

  const particles = [];
  const n = 90;
  for (let i = 0; i < n; i++) {
    particles.push({
      x: c.width / 2 + (Math.random() - 0.5) * 80,
      y: c.height * 0.35,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 10 - 4,
      size: Math.random() * 6 + 4,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
    });
  }
  runParticleSim(ctx, c, particles, 110);
}

// Local burst — 12 particles radiating from a DOM element's center, drawn on
// the same full-screen canvas but confined visually by short travel distance
// and a quick fade. Used by the per-habit check button on Today.
export function fireLocalBurst(originEl) {
  if (prefersReducedMotion() || !originEl) return;
  const c = getCanvas();
  if (!c) return;
  const ctx = c.getContext("2d");
  c.width = window.innerWidth;
  c.height = window.innerHeight;

  const rect = originEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const particles = [];
  const n = 12;
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const speed = Math.random() * 4 + 2;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: Math.random() * 4 + 3,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
    });
  }
  runParticleSim(ctx, c, particles, 50);
}

function runParticleSim(ctx, c, particles, maxFrames) {
  let frame = 0;
  function step() {
    frame++;
    ctx.clearRect(0, 0, c.width, c.height);
    particles.forEach((p) => {
      p.vy += 0.35; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame / maxFrames);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    if (frame < maxFrames) {
      requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, c.width, c.height);
    }
  }
  requestAnimationFrame(step);
}

// Fires full-screen confetti once per calendar day (state.confettiShownDate
// guard); resets the guard if the day stops being "all done" so it can refire.
export function maybeFireConfetti(state, todaysHabitsList, isDoneFn, todayStr, saveStateFn) {
  if (todaysHabitsList.length === 0) return;
  const t = todayStr();
  const allDone = todaysHabitsList.every((h) => isDoneFn(h, t));
  if (allDone && state.confettiShownDate !== t) {
    state.confettiShownDate = t;
    saveStateFn();
    fireConfetti();
  } else if (!allDone && state.confettiShownDate === t) {
    state.confettiShownDate = null;
    saveStateFn();
  }
}
