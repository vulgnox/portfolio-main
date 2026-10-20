/* NOX case-study pages — shared behavior (mirrors the index IIFE, minus canvas/ticker) */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Clock + year ---------- */
  var clocks = document.querySelectorAll("[data-clock]");
  var yearEls = document.querySelectorAll("[data-year]");
  var lastYear = -1;

  function updateYear(now) {
    var year = now.getFullYear();
    if (year !== lastYear) {
      lastYear = year;
      for (var y = 0; y < yearEls.length; y++) yearEls[y].textContent = year;
    }
  }

  function tick() {
    var now = new Date();
    var t = now.toISOString().slice(11, 19) + " UTC";
    for (var i = 0; i < clocks.length; i++) clocks[i].textContent = t;
    updateYear(now);
  }
  var clockTimer = null;
  function startClock() {
    if (clockTimer === null) clockTimer = setInterval(tick, 1000);
  }
  function stopClock() {
    clearInterval(clockTimer);
    clockTimer = null;
  }
  tick();
  startClock();
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopClock();
    } else {
      tick();
      startClock();
    }
  });

  /* ---------- Theme ---------- */
  // Storage can be partitioned or blocked outright (file://, sandboxed
  // previews, in-app viewers), so the choice also travels in the URL: light
  // stamps ?theme=light onto every internal link (prev/next, logo, nav) and
  // the address bar, dark drops it. The <head> pre-paint script reads it back
  // on the next page — storage or query, whichever survived, wins.
  function stampTheme(theme) {
    var links = document.querySelectorAll("a[href]");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#") continue; // in-page anchor
      if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
      if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(href)) continue; // external
      try {
        var hash = "";
        var hi = href.indexOf("#");
        if (hi >= 0) {
          hash = href.slice(hi);
          href = href.slice(0, hi);
        }
        var qi = href.indexOf("?");
        var base = qi >= 0 ? href.slice(0, qi) : href;
        var qs = new URLSearchParams(qi >= 0 ? href.slice(qi + 1) : "");
        if (theme === "light") qs.set("theme", "light");
        else qs.delete("theme");
        var query = qs.toString();
        a.setAttribute("href", base + (query ? "?" + query : "") + hash);
      } catch (e) {}
    }
    try {
      var cur = new URL(location.href);
      if (theme === "light") cur.searchParams.set("theme", "light");
      else cur.searchParams.delete("theme");
      history.replaceState(
        history.state,
        "",
        cur.pathname + cur.search + cur.hash,
      );
    } catch (e) {}
  }

  var themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    var themeLabel = themeBtn.querySelector(".theme-label");

    function applyTheme(theme) {
      root.setAttribute("data-theme", theme);
      themeBtn.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme",
      );
      if (themeLabel)
        themeLabel.textContent = theme === "light" ? "DARK" : "LIGHT";
      try {
        localStorage.setItem("nox-theme", theme);
      } catch (e) {}
      stampTheme(theme);
    }

    // <head> already resolved ?theme= over storage over the default onto
    // <html> — the attribute is the source of truth, so a storage failure
    // must not reset a URL-chosen theme back to dark.
    applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark");

    themeBtn.addEventListener("click", function () {
      applyTheme(
        root.getAttribute("data-theme") === "light" ? "dark" : "light",
      );
    });
  }

  /* ---------- Scroll progress ---------- */
  var progress = document.getElementById("progress");
  if (progress) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY || window.pageYOffset;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    for (var r = 0; r < reveals.length; r++) revealObs.observe(reveals[r]);
  } else {
    for (var r2 = 0; r2 < reveals.length; r2++) reveals[r2].classList.add("in");
  }

  /* ---------- Active nav ---------- */
  var navLinks = document.querySelectorAll(".top-nav a");
  var sections = document.querySelectorAll("main section[id]");
  if ("IntersectionObserver" in window && navLinks.length) {
    var navObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            for (var i = 0; i < navLinks.length; i++) {
              var isCurrent =
                navLinks[i].getAttribute("href") === "#" + entry.target.id;
              navLinks[i].classList.toggle("active", isCurrent);
              if (isCurrent) {
                navLinks[i].setAttribute("aria-current", "location");
              } else {
                navLinks[i].removeAttribute("aria-current");
              }
            }
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (var s = 0; s < sections.length; s++) navObs.observe(sections[s]);
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById("menuBtn");
  var menuPanel = document.getElementById("menuPanel");
  var mainEl = document.getElementById("index");
  if (menuBtn && menuPanel) {
    function setMenu(open) {
      document.body.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (mainEl && "inert" in mainEl) mainEl.inert = open;
      if (open) {
        var first = menuPanel.querySelector("a");
        if (first) first.focus();
      } else if (menuPanel.contains(document.activeElement)) {
        menuBtn.focus();
      }
    }
    menuBtn.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
    var menuLinks = menuPanel.querySelectorAll("a");
    for (var m = 0; m < menuLinks.length; m++) {
      menuLinks[m].addEventListener("click", function () {
        setMenu(false);
      });
    }
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- Decode effect on titles ---------- */
  var DECODE_CHARS = "█▓▒░<>/|_101100ABXZ#*+=";
  function scrambleTextNode(node) {
    if (node.timer) return;
    if (window.__nfx) window.__nfx("zap");
    var original = node.nodeValue;
    var len = original.length;
    var frame = 0;
    var total = 12;
    node.timer = setInterval(function () {
      frame++;
      var settle = (frame / total) * len;
      var out = "";
      for (var i = 0; i < len; i++) {
        var ch = original.charAt(i);
        if (i < settle || ch === " " || ch === "_" || ch === "&") {
          out += ch;
        } else {
          out += DECODE_CHARS.charAt((Math.random() * DECODE_CHARS.length) | 0);
        }
      }
      node.nodeValue = out;
      if (frame >= total) {
        clearInterval(node.timer);
        node.timer = null;
        node.nodeValue = original;
      }
    }, 30);
  }
  var decodeTargets = document.querySelectorAll(".cs-title, .row-name");
  for (var d = 0; d < decodeTargets.length; d++) {
    (function (name) {
      // collect every non-empty text node (titles split across <br>/<span>)
      var nodes = [];
      var walker = document.createTreeWalker(name, NodeFilter.SHOW_TEXT);
      var tn;
      while ((tn = walker.nextNode())) {
        if (tn.nodeValue && tn.nodeValue.trim()) nodes.push(tn);
      }
      if (!nodes.length) return;
      var host = name.closest(".row") || name;
      function fire() {
        if (reduce) return;
        for (var i = 0; i < nodes.length; i++) {
          if (!nodes[i].timer) scrambleTextNode(nodes[i]);
        }
      }
      host.addEventListener("mouseenter", fire);
      host.addEventListener("focusin", fire);
      // the case title decodes itself once on arrival
      if (name.classList.contains("cs-title")) {
        setTimeout(fire, 350);
      }
    })(decodeTargets[d]);
  }

  /* ---------- Type N-O-X anywhere: instrumentality ---------- */
  var easter = document.getElementById("easter");
  if (easter) {
    var easterBuf = "";
    var easterTimer = null;
    function showEaster() {
      easter.classList.add("on");
      if (window.__nfx) window.__nfx("sting");
      clearTimeout(easterTimer);
      easterTimer = setTimeout(hideEaster, 2600);
    }
    function hideEaster() {
      easter.classList.remove("on");
      clearTimeout(easterTimer);
    }
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        hideEaster();
        return;
      }
      if (!e.key || e.key.length !== 1) return;
      easterBuf = (easterBuf + e.key.toLowerCase()).slice(-3);
      if (easterBuf === "nox") {
        easterBuf = "";
        showEaster();
      }
    });
  }
})();
