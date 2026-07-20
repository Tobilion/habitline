/* tobi-footer.js — self-injecting "Built by Tobiloba Jagun" footer.
   Usage: <script src="path/to/tobi-footer.js" defer></script> before </body>. No deps. */
(function () {
  "use strict";

  var LINKS = [
    {
      href: "https://github.com/Tobilion",
      label: "GitHub",
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>'
    },
    {
      href: "https://tobiloba-jagun-portfolio.vercel.app/",
      label: "Portfolio",
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>'
    },
    {
      href: "https://www.linkedin.com/in/tobiloba-jagun/",
      label: "LinkedIn",
      svg: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>'
    }
  ];

  var CSS =
    ".tj-footer{width:100%;border-top:1px solid rgba(128,128,128,.25);display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;font:14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#888;background:transparent;box-sizing:border-box}" +
    ".tj-wrap{position:relative;display:inline-flex;justify-content:center;height:32px;width:176px;vertical-align:middle}" +
    ".tj-name{position:relative;height:32px;width:176px;border-radius:24px;padding:0 12px;display:flex;align-items:center;justify-content:center;background:transparent;color:inherit;border:1px solid rgba(128,128,128,.35);font-size:14px;font-weight:600;text-decoration:underline dotted;text-underline-offset:4px;cursor:pointer;transition:opacity .3s}" +
    ".tj-wrap.open .tj-name{opacity:0;pointer-events:none}" +
    ".tj-links{position:absolute;inset:0;display:flex;height:32px;width:176px;overflow:hidden;border-radius:24px}" +
    ".tj-link{flex:1;display:flex;align-items:center;justify-content:center;background:#111;color:#fff;border-right:1px solid rgba(255,255,255,.12);transform:translateX(-100%);opacity:0;pointer-events:none;transition:transform .2s,opacity .2s,background .15s}" +
    ".tj-link:last-child{border-right:0}" +
    ".tj-link:hover{background:#333}" +
    ".tj-link:nth-child(2){transition-delay:.05s}" +
    ".tj-link:nth-child(3){transition-delay:.1s}" +
    ".tj-wrap.open .tj-link{transform:translateX(0);opacity:1;pointer-events:auto}";

  function build() {
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var footer = document.createElement("footer");
    footer.className = "tj-footer";

    var text = document.createElement("span");
    text.textContent = "Built by";
    footer.appendChild(text);

    var wrap = document.createElement("span");
    wrap.className = "tj-wrap";

    var name = document.createElement("button");
    name.type = "button";
    name.className = "tj-name";
    name.textContent = "Tobiloba Jagun";
    name.setAttribute("aria-label", "Tobiloba Jagun — show links");
    wrap.appendChild(name);

    var links = document.createElement("span");
    links.className = "tj-links";
    LINKS.forEach(function (l) {
      var a = document.createElement("a");
      a.className = "tj-link";
      a.href = l.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.title = l.label;
      a.setAttribute("aria-label", l.label);
      a.innerHTML = l.svg;
      links.appendChild(a);
    });
    wrap.appendChild(links);
    footer.appendChild(wrap);

    wrap.addEventListener("mouseenter", function () { wrap.classList.add("open"); });
    wrap.addEventListener("mouseleave", function () { wrap.classList.remove("open"); });
    name.addEventListener("click", function () { wrap.classList.toggle("open"); });

    document.body.appendChild(footer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
