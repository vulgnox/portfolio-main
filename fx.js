/* NOX FX — sound effects, Faulty Terminal background, glitch scheduler.
   Shared by index.html and work/*.html. Degrades silently: no WebGL2 →
   photos remain; no AudioContext → silence. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     1 — SOUND (WebAudio, synthesized: zero audio assets)
     ============================================================ */
  var ctx = null;
  var master = null;
  var noiseBuf = null;
  var enabled = true;
  try {
    enabled = localStorage.getItem("nox-sound") !== "off";
  } catch (e) {}

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
      } catch (e) {
        return null;
      }
      master = ctx.createGain();
      master.gain.value = 0.16;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") {
      // resume() before a gesture may stay pending (or reject) — never let
      // that surface as an unhandled rejection in the console
      var resumed = ctx.resume();
      if (resumed && typeof resumed.catch === "function")
        resumed.catch(function () {});
    }
    return ctx;
  }

  function tone(type, f0, f1, dur, peak, delay) {
    if (!ensureCtx()) return;
    var t0 = ctx.currentTime + (delay || 0);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t0);
    if (f1 && f1 !== f0)
      osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // The 1s noise buffer is built on first use rather than with the context:
  // measured at ~30ms against ~280ms for construction, and only `zap` needs it.
  function ensureNoise() {
    if (!ensureCtx()) return null;
    if (!noiseBuf) {
      var len = ctx.sampleRate;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      var data = noiseBuf.getChannelData(0);
      for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    return noiseBuf;
  }

  function noise(dur, f0, f1, peak, q) {
    var buf = ensureNoise();
    if (!buf) return;
    var t0 = ctx.currentTime;
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = q || 1.4;
    bp.frequency.setValueAtTime(f0, t0);
    bp.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp).connect(g).connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  var sfx = {
    hover: function () {
      tone("square", 1500, 850, 0.045, 0.05);
    },
    press: function () {
      tone("triangle", 720, 380, 0.09, 0.1);
      noise(0.05, 3200, 1400, 0.04, 2.5);
    },
    zap: function () {
      noise(0.13, 2600, 500, 0.055, 1.6);
    },
    open: function () {
      tone("sawtooth", 170, 760, 0.2, 0.05);
    },
    close: function () {
      tone("sawtooth", 700, 150, 0.16, 0.05);
    },
    sting: function () {
      tone("sawtooth", 220, 214, 0.85, 0.05);
      tone("sawtooth", 277, 270, 0.85, 0.04, 0.03);
      tone("sawtooth", 330, 326, 0.85, 0.04, 0.06);
      noise(0.7, 300, 5200, 0.05, 0.9);
    },
  };

  function play(name) {
    if (!enabled || !sfx[name]) return;
    try {
      sfx[name]();
    } catch (e) {}
  }
  window.__nfx = play;

  // create/resume the context on the first real user gesture
  function arm() {
    ensureCtx();
    document.removeEventListener("pointerdown", arm);
    document.removeEventListener("keydown", arm);
  }
  document.addEventListener("pointerdown", arm);
  document.addEventListener("keydown", arm);

  // Build the context on the first pointer move — long before the pointer can
  // reach a project row (whose decode zap needs it) — not at page load.
  // Measured: construction costs ~100–300ms, and inside Lighthouse's FCP+5s
  // window that single call took total-blocking-time from 133ms to 1397ms.
  // Idle-time prewarm on load moved the jank from hover to paint; this parks
  // it in idle time after the user starts moving, where nothing is being read.
  function prewarm() {
    ensureCtx();
  }
  function onFirstMove() {
    document.removeEventListener("pointermove", onFirstMove);
    if ("requestIdleCallback" in window) {
      requestIdleCallback(prewarm, { timeout: 1000 });
    } else {
      setTimeout(prewarm, 0);
    }
  }
  if (enabled) {
    document.addEventListener("pointermove", onFirstMove, { passive: true });
  }

  /* hover/click delegation — ticks on interactive elements only */
  var lastHover = null;
  var lastHoverT = 0;
  document.addEventListener(
    "mouseover",
    function (e) {
      var t =
        e.target && e.target.closest ? e.target.closest("a, button") : null;
      if (!t) return;
      if (t.classList.contains("row-link")) return; // rows announce via decode zap
      var now = performance.now();
      if (t === lastHover || now - lastHoverT < 90) return;
      lastHover = t;
      lastHoverT = now;
      play("hover");
    },
    { passive: true },
  );
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("a, button") : null;
    if (!t) return;
    if (t.id === "menuBtn") {
      play(document.body.classList.contains("menu-open") ? "close" : "open");
      return;
    }
    if (t.id === "soundBtn") return; // handled below
    play("press");
  });

  /* sound toggle */
  var soundBtn = document.getElementById("soundBtn");
  function paintSoundBtn() {
    if (!soundBtn) return;
    var label = soundBtn.querySelector(".sound-label");
    if (label) label.textContent = enabled ? "SND ON" : "SND OFF";
    soundBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
    // aria-label must contain the visible text (axe label-content-name-mismatch)
    soundBtn.setAttribute(
      "aria-label",
      enabled
        ? "SND ON — mute sound effects"
        : "SND OFF — enable sound effects",
    );
  }
  if (soundBtn) {
    paintSoundBtn();
    soundBtn.addEventListener("click", function () {
      enabled = !enabled;
      try {
        localStorage.setItem("nox-sound", enabled ? "on" : "off");
      } catch (e) {}
      paintSoundBtn();
      if (enabled) play("press");
    });
  }

  /* ============================================================
     2 — FAULTY TERMINAL background (reactbits port)
     ============================================================ */
  var ft = null;
  var canvas = document.getElementById("ftCanvas");
  function ftColors() {
    var light = document.documentElement.getAttribute("data-theme") === "light";
    return {
      tint: light ? "#0b0b0b" : "#c9c4b8",
      lightMode: light,
      brightness: light ? 0.85 : 0.95,
    };
  }
  // Software GL (SwiftShader/llvmpipe — headless CI, VMs, no-GPU boxes) cannot
  // afford this shader: it drags the tab under 1 fps. Photos + scanlines +
  // grain stay; the terminal mounts only on real GPUs.
  function softwareRenderer() {
    try {
      var probe = document.createElement("canvas");
      var pgl = probe.getContext("webgl2");
      if (!pgl) return "no-webgl2";
      var pext = pgl.getExtension("WEBGL_debug_renderer_info");
      var r = pext
        ? String(pgl.getParameter(pext.UNMASKED_RENDERER_WEBGL))
        : "";
      var lose = pgl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
      return /swiftshader|llvmpipe|softwar|basic render/i.test(r)
        ? "software-renderer: " + r
        : "";
    } catch (e) {
      return "";
    }
  }
  var swReason = canvas ? softwareRenderer() : "no-canvas";
  // ?ft=on / ?ft=off overrides auto-detection: an escape hatch for GPUs the
  // probe misjudges, and the only way to exercise the shader on machines that
  // only have software GL.
  try {
    var ftParam = new URLSearchParams(location.search).get("ft");
    if (ftParam === "on") swReason = "";
    else if (ftParam === "off" && canvas) swReason = "ft-off: manual override";
  } catch (e) {}

  if (canvas && swReason) {
    window.__ft = { mounted: false, reason: swReason };
  } else if (canvas && typeof window.createFaultyTerminal === "function") {
    try {
      ft = window.createFaultyTerminal(
        canvas,
        Object.assign(
          {
            scale: 1.4,
            gridMul: [2, 1],
            timeScale: 0.3,
            scanlineIntensity: 0.3,
            glitchAmount: 1,
            flickerAmount: 0.7,
            noiseAmp: 0.85,
            chromaticAberration: 0.12,
            curvature: 0.18,
            brightness: 0.95,
            glyphs: "dots",
            glow: 0.5,
            persistence: 0.55,
            scramble: 0.5,
            mouseGlow: 0.7,
            vignette: 0.3,
            clickEffect: "glitch",
            mouseReact: true,
            pageLoadAnimation: true,
            // 1 is deliberate: the field sits at 0.2 opacity behind body copy,
            // and dpr 1.5 costs 2.25x the pixels of a full-screen 2-pass shader
            dpr: 1,
          },
          ftColors(),
        ),
      );
      window.__ft = { mounted: true, w: canvas.width, h: canvas.height };
    } catch (e) {
      window.__ft = { mounted: false, error: String(e) };
    }
  } else {
    window.__ft = { mounted: false, reason: "script missing" };
  }

  // keep the terminal in step with the theme (index + case pages both)
  if (ft) {
    var applyFtTheme = function () {
      ft.update(ftColors());
      ft.wake();
    };
    applyFtTheme();
    try {
      new MutationObserver(applyFtTheme).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    } catch (e) {}
  }

  /* ============================================================
     3 — GLITCH SCHEDULER (random tracking tears + headline splits)
     ============================================================ */
  if (!reduce) {
    var logo = document.querySelector(".logo");
    var headline = document.querySelector(".hero-statement, .cs-title");
    var stack = document.querySelector(".bg-stack");

    var pulse = function (el, ms) {
      if (!el) return;
      el.classList.add("glitch-on");
      setTimeout(function () {
        el.classList.remove("glitch-on");
      }, ms);
    };

    var schedule = function () {
      var wait = 3400 + Math.random() * 3800;
      setTimeout(function () {
        if (!document.hidden) {
          var r = Math.random();
          if (r < 0.42) pulse(headline, 340);
          else if (r < 0.66) pulse(logo, 260);
          else if (r < 0.82) pulse(stack, 300);
          // occasional double-hit: tracking tear + headline at once
          if (r >= 0.82) {
            pulse(stack, 300);
            setTimeout(function () {
              pulse(headline, 340);
            }, 90);
          }
        }
        schedule();
      }, wait);
    };
    schedule();
  }

  /* ============================================================
     4 — decode zap: the scramble in index/case scripts calls us
     ============================================================ */
  // window.__nfx('zap') is invoked by scrambleTextNode on both pages.
})();
