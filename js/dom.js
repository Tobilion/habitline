// Tiny DOM-builder helper shared by every screen/component module.
// Rebuild-innerHTML-each-time philosophy is preserved: no diffing, no vdom.
export function el(tag, attrs, children) {
  const e = document.createElement(tag);
  attrs = attrs || {};
  for (const k in attrs) {
    if (k === "class") e.className = attrs[k];
    else if (k === "html") e.innerHTML = attrs[k];
    else if (k === "text") e.textContent = attrs[k];
    else if (k.startsWith("on") && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
    else if (k === "style") e.setAttribute("style", attrs[k]);
    else if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) {
      /* skip: no attribute */
    } else e.setAttribute(k, attrs[k]);
  }
  (children || []).forEach((c) => {
    if (c) e.appendChild(c);
  });
  return e;
}

export function prefersReducedMotion() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}
