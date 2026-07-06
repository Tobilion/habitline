// EmptyState — inline SVG illustration (~120px), headline, one-line
// explanation, CTA button. Two treatments:
//   - full "no habits at all" state (feeds Landing screen, landing.js)
//   - smaller "nothing scheduled today" treatment (today.js)
import { el } from "../dom.js";

const ILLUSTRATION_SVG = `
  <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="30" width="140" height="90" rx="14" stroke="var(--border-hover)" stroke-width="3"/>
    <circle cx="70" cy="75" r="16" stroke="var(--accent)" stroke-width="3"/>
    <path d="M63 75l5 6 10-12" stroke="var(--accent-2)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="100" y1="65" x2="150" y2="65" stroke="var(--border-hover)" stroke-width="3" stroke-linecap="round"/>
    <line x1="100" y1="85" x2="140" y2="85" stroke="var(--border-hover)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="150" cy="30" r="10" fill="var(--accent)" opacity=".25"/>
    <circle cx="34" cy="115" r="6" fill="var(--accent-2)" opacity=".3"/>
  </svg>`;

// opts: {headline, sub, ctaLabel, onCta}
export function makeEmptyState(opts) {
  const { headline, sub, ctaLabel, onCta } = opts;
  const children = [
    el("div", { html: ILLUSTRATION_SVG }),
    el("p", { class: "headline", text: headline }),
  ];
  if (sub) children.push(el("p", { class: "sub", text: sub }));
  if (ctaLabel && onCta) children.push(el("button", { class: "btn btn-primary", text: ctaLabel, onclick: onCta }));
  return el("div", { class: "empty fade-up" }, children);
}
