/**
 * Verification harness for the NOX portfolio.
 * Runs against a static server (default http://127.0.0.1:4173) using the
 * Playwright Chromium already on this machine. Exercises the real page:
 * fonts, axe (dark + light), decode hover, ticker velocity, rAF pause,
 * NOX easter egg, mobile menu focus management, theme persistence.
 *
 *   node scripts/verify.mjs [baseURL]
 */
import { chromium } from "playwright-core";
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const BASE = process.argv[2] || "http://127.0.0.1:4173";
const CHROME =
  process.env.CHROME_PATH ||
  `${process.env.HOME}/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`;
const AXE = readFileSync("node_modules/axe-core/axe.min.js", "utf8");

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`,
  );
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAxe(page, label) {
  await page.addScriptTag({ content: AXE });
  const v = await page.evaluate(async () => {
    const r = await axe.run(document, { resultTypes: ["violations"] });
    return r.violations.map((x) => ({
      id: x.id,
      impact: x.impact,
      nodes: x.nodes.length,
      targets: x.nodes.map((n) => n.target.join(" ")),
    }));
  });
  check(`axe: no violations (${label})`, v.length === 0, JSON.stringify(v));
  return v;
}

async function countFrames(page, ms) {
  return page.evaluate(
    (dur) =>
      new Promise((res) => {
        let n = 0;
        const orig = window.requestAnimationFrame;
        window.requestAnimationFrame = function (f) {
          n++;
          return orig(f);
        };
        setTimeout(() => {
          window.requestAnimationFrame = orig;
          res(n);
        }, dur);
      }),
    ms,
  );
}

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  // ---- network hygiene: no third-party font requests ----
  const offsite = [];
  page.on("request", (r) => {
    const u = r.url();
    if (/googleapis|gstatic/.test(u)) offsite.push(u);
  });

  await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  await page.waitForSelector(".hero-statement.in");
  check("no google font requests", offsite.length === 0, offsite.join(", "));

  // ---- fonts: 4 self-hosted faces, all loaded ----
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].map(
      (f) => `${f.family} ${f.weight} ${f.status}`,
    );
  });
  check(
    "self-hosted fonts loaded",
    fonts.length === 4 && fonts.every((f) => f.endsWith("loaded")),
    fonts.join(" | "),
  );

  // ---- GitHub stats live update (static fallback intact in markup) ----
  await page.waitForTimeout(1800);
  const gh = await page.evaluate(() => ({
    els: [...document.querySelectorAll("[data-gh]")].map((e) => e.textContent),
    cached: !!localStorage.getItem("nox-gh"),
  }));
  const repoVals = gh.els.slice(0, 3);
  const statsLive =
    gh.cached &&
    repoVals.every((v) => v === repoVals[0]) &&
    /^\d+$/.test(repoVals[0]) &&
    repoVals[0] !== "" &&
    gh.els[3].length === 2;
  check("live GitHub stats applied", statsLive, gh.els.join(","));

  // ---- decode effect on row hover ----
  const firstRow = page.locator(".row").first();
  await firstRow.scrollIntoViewIfNeeded();
  await wait(700); // reveal transition settle
  const rowName = firstRow.locator(".row-name");
  const original = await rowName.evaluate((n) => n.firstChild.nodeValue);
  const box = await firstRow.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await wait(120);
  const mid = await rowName.evaluate((n) => n.firstChild.nodeValue);
  check(
    "decode scrambles on hover",
    mid !== original && mid.length === original.length,
    mid,
  );
  await wait(900);
  const restored = await rowName.evaluate((n) => n.firstChild.nodeValue);
  check("decode restores text", restored === original, restored);

  // ---- ticker reacts to scroll velocity ----
  const readRate = () =>
    page.evaluate(
      () =>
        document
          .getAnimations()
          .find((a) => a.effect?.target?.classList?.contains("ticker-track"))
          ?.playbackRate,
    );
  const rateBefore = await readRate();
  let rateAfter = rateBefore;
  // Chromium can swallow the very first wheel input; retry until it scrolls
  for (let i = 0; i < 3 && Math.abs(rateAfter - 1) < 0.05; i++) {
    await page.mouse.wheel(0, 700);
    await wait(60);
    rateAfter = await readRate();
  }
  check(
    "ticker responds to scroll",
    rateBefore === 1 && Math.abs(rateAfter - 1) > 0.05,
    `${rateBefore} -> ${rateAfter}`,
  );
  await page.waitForTimeout(1500);
  const rateSettled = await page.evaluate(
    () =>
      document
        .getAnimations()
        .find((a) => a.effect?.target?.classList?.contains("ticker-track"))
        ?.playbackRate,
  );
  check(
    "ticker settles back to idle",
    Math.abs(rateSettled - 1) < 0.05,
    String(rateSettled),
  );

  // ---- rAF loop pauses off-screen ----
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await wait(400);
  const framesTop = await countFrames(page, 1200); // long window: headless tabs can be frame-starved
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" }),
  );
  await wait(500);
  const framesBottom = await countFrames(page, 500);
  check("canvas loop runs at top", framesTop > 5, String(framesTop));
  check(
    "canvas loop pauses off-screen",
    framesBottom <= 2,
    String(framesBottom),
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await wait(400);

  // ---- easter egg: type "nox" ----
  await page.keyboard.type("nox");
  await wait(250);
  // force one style recalc so the 0.12s transition gets a start time even when
  // the headless tab is frame-starved, then let wall-clock time elapse
  await page.evaluate(() => document.getElementById("easter").offsetHeight);
  await wait(350);
  const egg = await page.evaluate(() => {
    const e = document.getElementById("easter");
    const cs = getComputedStyle(e);
    return {
      on: e.classList.contains("on"),
      vis: cs.visibility,
      op: cs.opacity,
      aria: e.getAttribute("aria-hidden"),
    };
  });
  check(
    "easter egg opens",
    egg.on && egg.vis === "visible" && egg.op === "1",
    JSON.stringify(egg),
  );
  check("easter egg aria-hidden", egg.aria === "true");
  await page.screenshot({ path: "screenshots/egg.png" });
  await page.keyboard.press("Escape");
  await wait(300);
  const eggClosed = await page.evaluate(
    () => !document.getElementById("easter").classList.contains("on"),
  );
  check("easter egg closes on Escape", eggClosed);

  // ---- a11y + screenshots, dark then light ----
  await runAxe(page, "dark");
  await page.screenshot({ path: "screenshots/dark-hero.png" });

  await page.click("#themeToggle");
  await wait(600);
  const theme = await page.evaluate(() => ({
    t: document.documentElement.dataset.theme,
    label: document.getElementById("themeToggle").getAttribute("aria-label"),
    pressed: document
      .getElementById("themeToggle")
      .hasAttribute("aria-pressed"),
  }));
  check(
    "theme toggle semantics",
    theme.t === "light" &&
      theme.label === "Switch to dark theme" &&
      !theme.pressed,
    JSON.stringify(theme),
  );
  await runAxe(page, "light");
  await page.screenshot({ path: "screenshots/light-hero.png" });

  await page.reload({ waitUntil: "networkidle" });
  await wait(400);
  const persisted = await page.evaluate(
    () => document.documentElement.dataset.theme,
  );
  check("light theme persists across reload", persisted === "light", persisted);

  // ---- mobile menu focus management ----
  await page.setViewportSize({ width: 390, height: 844 });
  await wait(300);
  await page.click("#menuBtn");
  await wait(400);
  const menu = await page.evaluate(() => ({
    expanded: document.getElementById("menuBtn").getAttribute("aria-expanded"),
    focusInPanel: document
      .getElementById("menuPanel")
      .contains(document.activeElement),
    mainInert: document.getElementById("index").inert,
  }));
  check(
    "menu opens: aria + focus moved + background inert",
    menu.expanded === "true" && menu.focusInPanel && menu.mainInert,
    JSON.stringify(menu),
  );
  await page.screenshot({ path: "screenshots/mobile-menu.png" });
  await page.keyboard.press("Escape");
  await wait(300);
  const menuClosed = await page.evaluate(() => ({
    expanded: document.getElementById("menuBtn").getAttribute("aria-expanded"),
    focusOnBtn: document.activeElement === document.getElementById("menuBtn"),
    mainInert: document.getElementById("index").inert,
  }));
  check(
    "menu closes on Escape, focus returns to button",
    menuClosed.expanded === "false" &&
      menuClosed.focusOnBtn &&
      !menuClosed.mainInert,
    JSON.stringify(menuClosed),
  );

  // ---- horizontal overflow at small widths (the small band was enlarged) ----
  for (const w of [390, 320]) {
    await page.setViewportSize({ width: w, height: 844 });
    await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    check(`index: no horizontal overflow at ${w}px`, over <= 0, `${over}px`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + "/work/eva-shell.html", { waitUntil: "networkidle" });
  const overCase = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(
    "case: no horizontal overflow at 390px",
    overCase <= 0,
    `${overCase}px`,
  );

  // ---- case studies: rows link out, pages render in the design system ----
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  const rowHrefs = await page.evaluate(() =>
    [...document.querySelectorAll(".row-link")].map((a) =>
      a.getAttribute("href"),
    ),
  );
  check(
    "all 7 rows link to distinct case studies",
    rowHrefs.length === 7 &&
      new Set(rowHrefs).size === 7 &&
      // light mode stamps ?theme=light onto internal links so the choice
      // survives navigation even where storage is partitioned
      rowHrefs.every((h) => /^work\/[a-z-]+\.html(?:\?theme=light)?$/.test(h)),
    rowHrefs.join(", "),
  );

  const slugs = rowHrefs.map((h) => h.slice("work/".length).split("?")[0]);
  let casesOk = true;
  let caseDetail = "";
  for (const s of slugs) {
    const resp = await page.goto(BASE + "/work/" + s, {
      waitUntil: "networkidle",
    });
    const info = await page.evaluate(async () => {
      await document.fonts.ready;
      const faces = [...document.fonts];
      return {
        title:
          document
            .querySelector(".cs-title")
            ?.textContent.replace(/\s+/g, " ")
            .trim() || "",
        bg: getComputedStyle(document.body).backgroundColor,
        sections: document.querySelectorAll(".sec-title").length,
        prevnext: [...document.querySelectorAll(".cs-nav a")].map((a) =>
          a.getAttribute("href"),
        ),
        cta:
          document.querySelector('.cs-actions .link-btn[target="_blank"]')
            ?.href || "",
        faces: faces.length,
        loaded: faces.filter((f) => f.status === "loaded").length,
        art: document.querySelectorAll(".cs-art svg").length,
      };
    });
    const ok =
      !!resp?.ok() &&
      info.title.length > 0 &&
      /^rgb\(/.test(info.bg) &&
      info.sections === 3 &&
      info.prevnext.length === 2 &&
      /^https:\/\//.test(info.cta) &&
      info.faces === 4 &&
      info.loaded === 4 &&
      info.art === 1;
    if (!ok) {
      casesOk = false;
      caseDetail = `${s}: ${JSON.stringify({ status: resp?.status(), ...info })}`;
    }
  }
  check(
    "7 case pages render (CSS, fonts, 3 sections, prev/next, CTA, art)",
    casesOk,
    caseDetail,
  );
  check(
    "case pages make no google font requests",
    offsite.length === 0,
    offsite.join(", "),
  );

  // ---- case title decodes on hover, then restores ----
  await page.goto(BASE + "/work/eva-shell.html", { waitUntil: "networkidle" });
  await wait(1200); // let the on-arrival decode finish
  const csTitle = page.locator(".cs-title");
  await csTitle.scrollIntoViewIfNeeded();
  const csOriginal = await csTitle.evaluate(
    (n) =>
      [...n.childNodes].find((c) => c.nodeType === 3 && c.nodeValue.trim())
        ?.nodeValue,
  );
  const csBox = await csTitle.boundingBox();
  await page.mouse.move(csBox.x + csBox.width / 2, csBox.y + csBox.height / 2);
  await wait(120);
  const csMid = await csTitle.evaluate(
    (n) =>
      [...n.childNodes].find((c) => c.nodeType === 3 && c.nodeValue.trim())
        ?.nodeValue,
  );
  check(
    "case title decodes on hover",
    csMid !== csOriginal && csMid.length === csOriginal.length,
    csMid,
  );
  await wait(900);
  const csRestored = await csTitle.evaluate(
    (n) =>
      [...n.childNodes].find((c) => c.nodeType === 3 && c.nodeValue.trim())
        ?.nodeValue,
  );
  check("case title restores", csRestored === csOriginal, csRestored);
  await runAxe(page, "case page (light)");
  await page.screenshot({ path: "screenshots/case-eva-shell.png" });

  // ---- FX layer: background stack, faulty terminal, sound, glitch ----
  await page.goto(BASE + "/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const fx = await page.evaluate(() => ({
    ft: window.__ft || null,
    canvas: (() => {
      const c = document.getElementById("ftCanvas");
      return c ? { w: c.width, h: c.height } : null;
    })(),
    photos: [...document.querySelectorAll(".bg-photo")].map((d) => {
      const m = getComputedStyle(d).backgroundImage.match(/url\("([^"]+)"\)/);
      return m ? m[1] : "";
    }),
    remote: performance
      .getEntriesByType("resource")
      .map((r) => r.name)
      .filter(
        (u) =>
          u.startsWith("http") &&
          !u.startsWith(location.origin) &&
          !u.startsWith("https://api.github.com"),
      ),
    imgs: performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes("/img/"))
      .map((r) => ({
        u: r.name.split("/").pop(),
        size: r.transferSize || r.decodedBodySize || 0,
      })),
  }));
  // software GL (SwiftShader in headless) can't afford the shader — fx.js must
  // skip it there; real GPUs must get it. Assert the right branch for this machine.
  const glInfo = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
    const r = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    const lose = gl && gl.getExtension("WEBGL_lose_context");
    if (lose) lose.loseContext();
    return r;
  });
  const swGL = /swiftshader|llvmpipe|softwar|basic render/i.test(glInfo);
  check(
    swGL
      ? "faulty terminal skipped on software renderer (photos remain)"
      : "faulty terminal mounted (real GPU)",
    swGL
      ? !!fx.ft && fx.ft.mounted === false && !!fx.ft.reason
      : !!fx.ft &&
          fx.ft.mounted === true &&
          fx.canvas &&
          fx.canvas.w > 100 &&
          fx.canvas.h > 100,
    JSON.stringify(fx.ft) + " renderer=" + (glInfo || "hidden"),
  );
  check(
    "3 nature photos, all self-hosted",
    fx.photos.length === 3 &&
      fx.photos.every((u) => u.startsWith(BASE + "/img/")),
    fx.photos.join(", "),
  );
  check(
    "nature photos actually loaded",
    fx.imgs.length >= 3 && fx.imgs.every((i) => i.size > 10000),
    JSON.stringify(fx.imgs),
  );
  check(
    "no third-party resources (github API allowed)",
    fx.remote.length === 0,
    fx.remote.join(", "),
  );

  // ---- perf/readability guards: the measured decisions must not regress ----
  // drive to dark first: the weight rule is deliberately contrast-specific
  const onLight = await page.evaluate(
    () => document.documentElement.dataset.theme === "light",
  );
  if (onLight) {
    await page.click("#themeToggle");
    await wait(350);
  }
  const guards = await page.evaluate(() => {
    const grain = getComputedStyle(document.body, "::after");
    const bar = getComputedStyle(document.querySelector(".topbar"));
    const ft = getComputedStyle(document.querySelector(".ft-wrap"));
    return {
      blend: grain.mixBlendMode,
      blur: bar.backdropFilter || bar.webkitBackdropFilter || "none",
      ft: parseFloat(ft.opacity),
      small: getComputedStyle(document.querySelector(".top-status")).fontSize,
      weight: getComputedStyle(document.querySelector(".top-status"))
        .fontWeight,
    };
  });
  check(
    "grain no longer blends the whole page",
    guards.blend === "normal",
    guards.blend,
  );
  check(
    "topbar drops its per-frame backdrop blur",
    !/blur/.test(guards.blur),
    guards.blur,
  );
  check(
    "faulty terminal stays dim behind text (<= 0.2)",
    guards.ft <= 0.2,
    String(guards.ft),
  );
  check(
    "dark small text is enlarged and weighted",
    parseFloat(guards.small) >= 12.5 && Number(guards.weight) >= 600,
    `${guards.small} @ ${guards.weight}`,
  );

  // sound toggle: flips, persists across reload, restores
  await page.click("#soundBtn");
  const soundOff = await page.evaluate(() => ({
    p: document.getElementById("soundBtn").getAttribute("aria-pressed"),
    s: localStorage.getItem("nox-sound"),
    label: document.querySelector(".sound-label").textContent,
  }));
  await page.reload({ waitUntil: "networkidle" });
  const soundAfter = await page.evaluate(() => ({
    p: document.getElementById("soundBtn").getAttribute("aria-pressed"),
    label: document.querySelector(".sound-label").textContent,
  }));
  await page.click("#soundBtn"); // back on for the rest of the run
  check(
    "sound toggle off persists across reload",
    soundOff.p === "false" &&
      soundOff.s === "off" &&
      soundAfter.p === "false" &&
      soundAfter.label === "SND OFF",
    JSON.stringify({ soundOff, soundAfter }),
  );

  // glitch scheduler fires within 8s (max interval is 7.2s)
  const glitched = await page.evaluate(
    () =>
      new Promise((res) => {
        const start = performance.now();
        const watch = setInterval(() => {
          const on = document.querySelector(".glitch-on");
          if (on) {
            clearInterval(watch);
            res(on.className);
          } else if (performance.now() - start > 8000) {
            clearInterval(watch);
            res("");
          }
        }, 100);
      }),
  );
  check("glitch scheduler fires", glitched.length > 0, glitched);

  // ---- theme survives navigation even with storage unavailable ----
  // Reported bug: toggle light inside a case study, open the next project,
  // snap back to dark. Storage can be partitioned or blocked (file://,
  // sandboxed viewers), so the choice must also travel in the URL. Emptied
  // storage between every hop proves the query-string path on its own.
  const dropThemeStorage = () =>
    page.evaluate(() => {
      try {
        localStorage.removeItem("nox-theme");
      } catch (e) {}
    });

  await page.goto(BASE + "/index.html?theme=light", {
    waitUntil: "networkidle",
  });
  await dropThemeStorage();
  const stamped = await page.evaluate(() =>
    [...document.querySelectorAll(".row-link")].map((a) =>
      a.getAttribute("href"),
    ),
  );
  check(
    "index rows carry ?theme=light",
    stamped.length === 7 &&
      stamped.every((h) => /^work\/[a-z-]+\.html\?theme=light$/.test(h)),
    stamped[0] || "",
  );

  await page.locator(".row-link").first().click();
  await page.waitForLoadState("networkidle");
  await dropThemeStorage();
  const hop1 = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    next:
      document.querySelector(".cs-nav a:last-child")?.getAttribute("href") ||
      "",
    logo: document.querySelector(".logo")?.getAttribute("href") || "",
  }));
  check(
    "theme carries index -> case with storage emptied",
    hop1.theme === "light" &&
      /^[\w-]+\.html\?theme=light$/.test(hop1.next) &&
      /\?theme=light/.test(hop1.logo),
    JSON.stringify(hop1),
  );

  await page.locator(".cs-nav a").last().click();
  await page.waitForLoadState("networkidle");
  const hop2 = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    back:
      document.querySelector(".cs-nav a:first-child")?.getAttribute("href") ||
      "",
    next:
      document.querySelector(".cs-nav a:last-child")?.getAttribute("href") ||
      "",
  }));
  check(
    "theme carries case -> case with storage emptied (reported bug)",
    hop2.theme === "light" &&
      /^[\w-]+\.html\?theme=light$/.test(hop2.back) &&
      /^[\w-]+\.html\?theme=light$/.test(hop2.next),
    JSON.stringify(hop2),
  );

  await page.click("#themeToggle");
  await wait(300);
  const backDark = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    next:
      document.querySelector(".cs-nav a:last-child")?.getAttribute("href") ||
      "",
    search: location.search,
  }));
  check(
    "toggling back to dark strips ?theme= from links and URL",
    backDark.theme === "dark" &&
      !/\?theme=/.test(backDark.next) &&
      !/theme=/.test(backDark.search),
    JSON.stringify(backDark),
  );

  // ---- og image sanity ----
  const ogOk =
    existsSync("og.png") &&
    readFileSync("og.png").subarray(0, 8).toString("hex") ===
      "89504e470d0a1a0a";
  let ogDims = "";
  if (ogOk) {
    const buf = readFileSync("og.png");
    ogDims = `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
  }
  check("og.png is a 1200x630 PNG", ogOk && ogDims === "1200x630", ogDims);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed`,
);
process.exit(failed.length ? 1 : 0);
