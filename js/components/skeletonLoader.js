// SkeletonLoader — shimmer placeholder blocks shown briefly on initial app
// boot (no real network, so main.js simulates a short delay deliberately so
// the loader is demonstrably present rather than flashing invisibly).
import { el } from "../dom.js";

function shimmerBlock(height) {
  return el("div", {
    style: `height:${height}px;border-radius:var(--radius-lg);margin-bottom:12px;` +
      "background:linear-gradient(90deg, var(--surface) 25%, var(--surface-2) 37%, var(--surface) 63%);" +
      "background-size:400% 100%;animation:skeletonShimmer 1.2s ease-in-out infinite;",
  });
}

export function makeSkeletonLoader() {
  if (!document.getElementById("skeleton-keyframes")) {
    const style = document.createElement("style");
    style.id = "skeleton-keyframes";
    style.textContent = "@keyframes skeletonShimmer{0%{background-position:100% 0}100%{background-position:0 0}}";
    document.head.appendChild(style);
  }
  const wrap = el("div", { class: "wrap" }, [shimmerBlock(96), shimmerBlock(140), shimmerBlock(140), shimmerBlock(140)]);
  return wrap;
}
