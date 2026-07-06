// ScrollProgressBar — 3px gradient bar fixed to top of viewport, driven by
// scroll position. Only used on the Stats view (the only scrollable one).
import { el } from "../dom.js";

let barEl = null;
let scrollHandler = null;

export function mountScrollProgressBar() {
  removeScrollProgressBar();
  barEl = el("div", {
    style:
      "position:fixed;top:0;left:0;height:3px;width:0%;z-index:250;background:var(--grad);transition:width 100ms linear;",
  });
  document.body.appendChild(barEl);

  scrollHandler = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    barEl.style.width = pct + "%";
  };
  window.addEventListener("scroll", scrollHandler, { passive: true });
  scrollHandler();
}

export function removeScrollProgressBar() {
  if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
  scrollHandler = null;
  if (barEl) barEl.remove();
  barEl = null;
}
