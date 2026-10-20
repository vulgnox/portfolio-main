// Generates work/<slug>.html from scripts/cases-data.mjs + index.html's row art.
// Run: node scripts/build-cases.mjs   (then: npx prettier --write work/*.html)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { SITE, cases } from "./cases-data.mjs";

const src = readFileSync(new URL("../index.html", import.meta.url), "utf8");

// pull the seven row-art SVGs in order so case art never drifts from the index
const art = [
  ...src.matchAll(
    /<div class="row-art" aria-hidden="true">\s*(<svg[\s\S]*?<\/svg>)\s*<\/div>/g,
  ),
].map((m) => m[1]);
if (art.length !== cases.length) {
  throw new Error(`expected ${cases.length} row-art svgs, found ${art.length}`);
}

const pad = (n) => String(n).padStart(2, "0");

// escape plain-text slots; HTML-authored strings (lede/overview/quote[0]) stay raw
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");

const ARROW =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" stroke="currentColor" stroke-width="1.6" fill="none" /></svg>';

function head(c, i) {
  const url = `${SITE}/work/${c.slug}.html`;
  return `<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${esc(c.desc)}" />
    <meta name="author" content="Gaurav Singh Rawat" />
    <meta name="theme-color" content="#0b0b0b" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${esc(c.name)} — Case Study — NOX" />
    <meta property="og:description" content="${esc(c.desc)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(c.name)} — Case Study — NOX" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(c.name)} — Case Study — NOX" />
    <meta name="twitter:description" content="${esc(c.desc)}" />
    <meta name="twitter:image" content="${SITE}/og.png" />
    <link rel="canonical" href="${url}" />
    <title>${esc(c.name)} — Case Study — NOX</title>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": "${c.name} — Case Study",
        "headline": "${c.name}",
        "url": "${url}",
        "image": "${SITE}/og.png",
        "author": {
          "@type": "Person",
          "name": "Gaurav Singh Rawat",
          "alternateName": ["NOX", "vulgnox"],
          "url": "${SITE}/",
          "sameAs": ["https://github.com/vulgnox"]
        },
        "isPartOf": {
          "@type": "WebSite",
          "name": "NOX — Gaurav Singh Rawat",
          "url": "${SITE}/"
        }
      }
    </script>
    <link
      rel="icon"
      href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230b0b0b'/%3E%3Ccircle cx='32' cy='32' r='14' fill='%239e1b22'/%3E%3C/svg%3E"
    />
    <noscript
      ><style>
        .reveal {
          opacity: 1 !important;
          transform: none !important;
        }
        .menu-btn {
          display: none !important;
        }
        .top-nav {
          display: flex !important;
          gap: 0.8rem;
          font-size: 0.55rem;
        }
      </style></noscript
    >
    <link rel="stylesheet" href="case.css" />
    <link rel="stylesheet" href="../fx.css" />
    <script>
      // apply saved theme before first paint — no dark flash for light-mode visitors.
      // ?theme= wins over storage so the preference survives even when storage is
      // partitioned (file viewers, sandboxed previews, file://).
      try {
        var q = new URLSearchParams(location.search).get("theme");
        var t =
          q === "light" || q === "dark"
            ? q
            : localStorage.getItem("nox-theme");
        if (t === "light" || t === "dark") {
          document.documentElement.setAttribute("data-theme", t);
          localStorage.setItem("nox-theme", t);
        }
      } catch (e) {}
    </script>
  </head>
  <body data-case="${i + 1}">
    <!-- background stack: nature photos (CC0) + Faulty Terminal + veil -->
    <div class="bg-stack" aria-hidden="true">
      <div class="bg-photos">
        <div class="bg-photo bg-ridge"></div>
        <div class="bg-photo bg-forest"></div>
        <div class="bg-photo bg-sky"></div>
      </div>
      <div class="ft-wrap">
        <canvas class="ft-canvas" id="ftCanvas"></canvas>
      </div>
      <div class="bg-veil"></div>
    </div>

    <a class="skip" href="#index">Skip to content</a>
    <div class="scroll-progress" id="progress" aria-hidden="true"></div>

    <header class="topbar">
      <a class="logo" href="../index.html#index" aria-label="NOX — home">
        NOX<span class="dot" aria-hidden="true"></span><sup>®</sup>
      </a>

      <span class="top-status">
        <span class="live" aria-hidden="true"></span>
        SIGNAL <b>ONLINE</b> — <b data-clock>00:00:00 UTC</b>
      </span>

      <div class="top-right">
        <nav class="top-nav" aria-label="Primary">
          <a href="../index.html#work">Work</a>
          <a href="../index.html#stack">Stack</a>
          <a href="../index.html#signal">Signal</a>
          <a href="../index.html#contact">Contact</a>
        </nav>
        <button
          class="chrome-btn"
          id="themeToggle"
          type="button"
          aria-label="Switch to light theme"
        >
          <span class="theme-label">LIGHT</span>
        </button>
        <button
          class="chrome-btn"
          id="soundBtn"
          type="button"
          aria-pressed="true"
          aria-label="Mute sound effects"
        >
          <span class="sound-label">SND ON</span>
        </button>
        <button
          class="chrome-btn menu-btn"
          id="menuBtn"
          type="button"
          aria-expanded="false"
          aria-controls="menuPanel"
        >
          MENU
        </button>
      </div>
    </header>

    <div class="menu-panel" id="menuPanel">
      <a href="../index.html#work"><span>01</span>Work</a>
      <a href="../index.html#stack"><span>02</span>Stack</a>
      <a href="../index.html#signal"><span>03</span>Signal</a>
      <a href="../index.html#contact"><span>04</span>Contact</a>
      <div class="menu-meta">
        NOX — GAURAV SINGH RAWAT<br />INDEPENDENT DEVELOPER — OPEN TO WORK
      </div>
    </div>

    <div class="easter" id="easter" aria-hidden="true">
      <div class="easter-inner">
        <span class="easter-tag">NERV OS v2.0 — SEELE COMMITTEE</span>
        <strong>INSTRUMENTALITY<br />INITIATED.</strong>
        <span class="easter-tag"
          >PROJECT EVA // STATUS: TANG — ESC TO ABORT</span
        >
      </div>
    </div>`;
}

function hero(c, i) {
  const idx = pad(i + 1);
  const tags = c.tags
    .map(([t, hot]) => `<span${hot ? ' class="hot"' : ""}>${esc(t)}</span>`)
    .join("");
  const status = c.status
    .map(
      ([k, v, on]) =>
        `<li><span>${esc(k)}</span><b${on ? ' class="on"' : ""}>${esc(v)}</b></li>`,
    )
    .join("\n            ");
  const primary = `<a
              class="link-btn${c.primary.solid ? " solid" : ""}"
              href="${c.primary.href}"
              ${c.primary.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}
            >
              ${c.primary.label}
              ${ARROW}
            </a>`;
  const secondary = c.secondary
    ? `<a
              class="link-btn"
              href="${c.secondary.href}"
              target="_blank"
              rel="noopener"
            >
              ${c.secondary.label}
              ${ARROW}
            </a>`
    : "";
  return `
    <section class="hero wrap" aria-labelledby="csTitle">
      <div class="hero-meta">
        <span>CASE STUDY — <b>${idx}</b> / 07</span>
        <span>SELECTED WORK <b class="red">/</b> NOX</span>
        <span><b data-clock>00:00:00 UTC</b></span>
      </div>

      <div class="cs-head">
        <div class="reveal">
          <div class="sec-kicker">
            <span class="n">${idx}</span
            ><svg class="kicker-mark" viewBox="0 0 36 12" aria-hidden="true">
              <path d="M0 6h10M15 6h21M15 1v10" /></svg
            ><span>CASE STUDY ${idx} / 07</span>
          </div>
          <h1 class="cs-title" id="csTitle">
            ${esc(c.title[0])}<br /><span class="ghost">${esc(c.title[1])}</span>
          </h1>
          <div class="cs-tags">${tags}</div>
        </div>

        <div class="cs-side reveal">
          <p class="cs-lede">${c.lede}</p>
          <ul class="status">
            ${status}
          </ul>
          <div class="cs-actions">
            ${primary}
            ${secondary}
            <a class="link-btn" href="../index.html#work">
              All work
              ${ARROW}
            </a>
          </div>
          <figure class="cs-art">
            ${art[i]}
            <figcaption>${esc(c.figcap)}</figcaption>
          </figure>
        </div>
      </div>
    </section>`;
}

function secHead(num, label, solid, ghost, id) {
  return `<div class="sec-head reveal">
          <div class="sec-kicker">
            <span class="n">${num}</span
            ><svg class="kicker-mark" viewBox="0 0 36 12" aria-hidden="true">
              <path d="M0 6h10M15 6h21M15 1v10" /></svg
            ><span>${label}</span>
          </div>
          <h2 class="sec-title" id="${id}">
            ${solid}<br /><span class="ghost">${ghost}</span>
          </h2>
        </div>`;
}

function sections(c) {
  const spec = c.spec
    .map(
      ([k, v, on]) =>
        `<div><dt>${esc(k)}</dt><dd><b${on ? ' class="on"' : ""}>${esc(v)}</b></dd></div>`,
    )
    .join("\n            ");
  const steps = c.steps
    .map(([h, p]) => `<li><div><h3>${esc(h)}</h3><p>${esc(p)}</p></div></li>`)
    .join("\n            ");
  const log = c.log
    .map(
      ([when, p]) =>
        `<li><span class="log-when">${esc(when)}</span><p>${esc(p)}</p></li>`,
    )
    .join("\n            ");

  return `
    <section class="section wrap" id="overview" aria-labelledby="ovTitle">
      ${secHead("01", "OVERVIEW", "THE", "BRIEF", "ovTitle")}
      <div class="cs-cols">
        <div class="cs-body reveal">
          ${c.overview.trim()}
          <blockquote class="cs-quote">
            ${c.quote[0]}<cite>${esc(c.quote[1])}</cite>
          </blockquote>
        </div>
        <aside class="reveal" aria-label="Specifications">
          <dl class="cs-spec">
            ${spec}
          </dl>
        </aside>
      </div>
    </section>

    <section class="section wrap" id="system" aria-labelledby="sysTitle">
      ${secHead("02", "SYSTEM", "HOW IT", "WORKS", "sysTitle")}
      <div class="cs-body reveal">
        <ol class="cs-steps">
          ${steps}
        </ol>
      </div>
    </section>

    <section class="section wrap" id="log" aria-labelledby="logTitle">
      ${secHead("03", "BUILD LOG", "THE", "RECORD", "logTitle")}
      <div class="cs-body reveal">
        <ul class="cs-log">
          ${log}
        </ul>
      </div>
    </section>`;
}

function csNav(i) {
  const prev = cases[(i - 1 + cases.length) % cases.length];
  const next = cases[(i + 1) % cases.length];
  return `
    <section class="wrap" aria-label="Case study navigation">
      <div class="cs-nav">
        <a href="${prev.slug}.html">
          <span class="cs-nav-idx">← PREVIOUS — ${pad(
            ((i - 1 + cases.length) % cases.length) + 1,
          )}</span>
          <span class="cs-nav-name">${esc(prev.name)}</span>
        </a>
        <a href="${next.slug}.html">
          <span class="cs-nav-idx">NEXT — ${pad(((i + 1) % cases.length) + 1)} →</span>
          <span class="cs-nav-name">${esc(next.name)}</span>
        </a>
      </div>
    </section>`;
}

function footer() {
  return `
      <footer class="wrap">
        <div class="foot-grid">
          <span class="foot-brand">
            <svg class="foot-mark" viewBox="0 0 17 23" aria-hidden="true">
              <g fill="currentColor">
                <circle cx="2" cy="2" r="1.2" />
                <circle cx="14" cy="2" r="1.2" />
                <circle cx="2" cy="5" r="1.2" />
                <circle cx="5" cy="5" r="1.2" />
                <circle cx="14" cy="5" r="1.2" />
                <circle cx="2" cy="8" r="1.2" />
                <circle cx="8" cy="8" r="1.2" fill="#e23a2e" />
                <circle cx="14" cy="8" r="1.2" />
                <circle cx="2" cy="11" r="1.2" />
                <circle cx="11" cy="11" r="1.2" />
                <circle cx="14" cy="11" r="1.2" />
                <circle cx="2" cy="14" r="1.2" />
                <circle cx="14" cy="14" r="1.2" />
                <circle cx="2" cy="17" r="1.2" />
                <circle cx="14" cy="17" r="1.2" />
                <circle cx="2" cy="20" r="1.2" />
                <circle cx="14" cy="20" r="1.2" />
              </g>
            </svg>
            © <span data-year>2026</span> NOX — GAURAV SINGH RAWAT
          </span>
          <span
            >BUILT IN THE DARK <span class="foot-dot">●</span>
            <b data-clock>00:00:00 UTC</b></span
          >
          <a href="#index">BACK TO TOP ↑</a>
        </div>
      </footer>
    </main>

    <script src="case.js"></script>
    <script src="../faulty-terminal.js"></script>
    <script src="../fx.js"></script>
  </body>
</html>
`;
}

mkdirSync(new URL("../work", import.meta.url), { recursive: true });
cases.forEach((c, i) => {
  const html =
    head(c, i) +
    '\n\n    <main id="index">\n' +
    hero(c, i) +
    sections(c) +
    csNav(i) +
    footer();
  const out = new URL(`../work/${c.slug}.html`, import.meta.url);
  writeFileSync(out, html);
  console.log(`work/${c.slug}.html — ${html.length} bytes`);
});
console.log(`\n${cases.length} case studies generated.`);
