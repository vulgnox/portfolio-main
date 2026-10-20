// Case-study content — sourced from each repo's README / PROJECT_PROGRESS.
// Rendered by scripts/build-cases.mjs; edit here, then rerun `node scripts/build-cases.mjs`.

export const SITE = "https://portfolio-nox07.vercel.app";
export const cases = [
  {
    slug: "psyche-analyze",
    name: "Psyche_analyze",
    title: ["PSYCHE", "ANALYZE"],
    desc: "How Psyche_analyze pairs a 70B conversational model with an 8B analyzer to type personalities from live transcripts — Flask, dual-model NIM, live on Render.",
    tags: [
      ["Flask", 0],
      ["NVIDIA NIM", 0],
      ["Groq", 0],
      ["SQLite → Postgres", 0],
      ["AI / Personality", 1],
    ],
    lede: "A personality engine for friend groups — profiles, head-to-head compatibility and AI-written group dynamics. <em>One system that talks and reads at the same time.</em>",
    status: [
      ["Project", "Personality engine"],
      ["Status", "Live on Render", 1],
      ["Source", "Public"],
      ["Year", "2025 → 2026"],
    ],
    primary: {
      href: "https://psyche-analyze-10sz.onrender.com/",
      label: "Live site",
      solid: true,
    },
    secondary: {
      href: "https://github.com/vulgnox/Psyche_analyze",
      label: "GitHub",
    },
    figcap: "FIG. 01 — DUAL-MODEL PIPELINE: TRANSCRIPT IN, VERDICT OUT",
    overview: `
      <p>
        PSYCHE maps a friend group's personalities, scores compatibility trait
        by trait, and writes the analysis nobody in the group wants to write
        themselves. Add anyone with their MBTI type, A/T variant and
        five-dimension trait scores — the app takes it from there.
      </p>
      <h3>Four surfaces</h3>
      <p>
        <b>Profile builder</b> for everyone in the group.
        <b>Head-to-head compare</b> — compatibility per trait, plus AI analysis
        in four parts: synergy, clash, dynamic, verdict.
        <b>Group analysis</b> — a pairwise grid across everyone, then the group
        dynamic written out. <b>Role suggestions</b> — pick a subset and a
        context (startup, study group, project) and the model assigns ideal
        roles.
      </p>
      <h3>Two models, one protocol</h3>
      <p>
        A <b>70B conversational model</b> conducts the typing session; an
        <b>8B analyzer</b> reads the transcript across a four-phase protocol and
        returns the verdict. NVIDIA NIM runs both heavy ends, Groq handles the
        instant passes. One schema serves SQLite and Postgres alike — swap
        <b>DATABASE_URL</b> and the schema creates itself on boot.
      </p>
      <p>
        Profiles are private by default; two users who connect by username can
        see each other. <em>Deployed from render.yaml as a Blueprint</em> — the
        repo's /api/health reports which storage backend is live.
      </p>`,
    spec: [
      ["Status", "Live", 1],
      ["Stack", "Flask · vanilla JS"],
      ["Models", "NIM 70B + 8B"],
      ["Fast pass", "Groq llama-3.1-8b"],
      ["Data", "SQLite → Postgres"],
      ["Deploy", "Render blueprint"],
    ],
    quote: [
      "One model talks.<br />One model reads the transcript.",
      "Dual-model protocol — 70B / 8B",
    ],
    steps: [
      [
        "Capture",
        "MBTI type, A/T variant and five trait percentages — entered straight from the 16personalities result page.",
      ],
      [
        "Score",
        "Pairwise compatibility computed per trait — a grid for the whole group, never a single vague number.",
      ],
      [
        "Analyze",
        "The conversational model talks; the analyzer reads the transcript across four phases and returns synergy, clash, dynamic and verdict.",
      ],
      [
        "Assign",
        "Pick any subset plus a context — startup, study group, project — and the model proposes who does what.",
      ],
      [
        "Ship",
        "render.yaml deploys it free; DATABASE_URL turns Render's ephemeral disk into persistent Postgres.",
      ],
    ],
    log: [
      [
        "Flask core",
        "Flask + vanilla JS front end, SQLite file, no frameworks — one schema shared by both storage backends.",
      ],
      [
        "Dual-model split",
        "Conversational and analyzer keys separated: a 70B model conducts, an 8B model reads. Two keys, one protocol.",
      ],
      [
        "Render blueprint",
        "render.yaml checked in — New → Blueprint and the service exists, keys stay in the dashboard.",
      ],
      [
        "Six months live",
        "Running on Render's free tier since launch — spinning down after idle minutes, waking on the first request, as free tiers do.",
      ],
    ],
  },
  {
    slug: "eva-shell",
    name: "eva-shell",
    title: ["EVA", "SHELL"],
    desc: "eva-shell: a full i3wm desktop environment built around NERV's MAGI — three HUD panels, live telemetry from /proc, and a local LLM standing in for MELCHIOR.",
    tags: [
      ["i3-gaps", 0],
      ["eww", 0],
      ["Ollama", 0],
      ["Shell", 0],
      ["Linux / Desktop", 1],
    ],
    lede: "A working i3 environment built around NERV's MAGI supercomputer. <em>Three panels stand in for MELCHIOR, BALTHASAR and CASPAR — one runs a local LLM for live system analysis. A daily driver, not a wallpaper.</em>",
    status: [
      ["Project", "Desktop environment"],
      ["Status", "Daily driver", 1],
      ["Source", "Public"],
      ["Host", "Ubuntu 24.04"],
    ],
    primary: {
      href: "https://github.com/vulgnox/eva-shell",
      label: "GitHub",
      solid: true,
    },
    secondary: null,
    figcap: "FIG. 02 — MAGI: THREE UNITS, LIVE TELEMETRY",
    overview: `
      <p>
        eva-shell is a complete desktop replacement, not a rice. A three-column
        HUD — 280px flanks around a dynamic center — a 96px four-cell bottom
        panel, and a 16px NERV top bar carrying a live timestamp.
      </p>
      <h3>MAGI, rendered</h3>
      <p>
        Three hexagon units — <b>MELCHIOR, BALTHASAR, CASPAR</b> — carry live
        system metrics as progress bars and consensus indicators. Logs, process
        trees and network intercept (RX/TX) stream from
        <b>/proc, /sys and journalctl</b> through ten-plus bash helpers.
      </p>
      <h3>Melchior speaks</h3>
      <p>
        The workspace switcher doubles as an analysis console: Ollama runs
        <b>llama3.2:1b</b> locally and answers with tactical system assessments.
        <em>No cloud, no telemetry — the machine interrogating itself.</em>
      </p>
      <h3>One file, one mood</h3>
      <p>
        <b>themes/eva-01/colors.conf</b> controls the entire visual identity.
        GTK3-compatible SCSS, flat CSS, exact color match to the HTML reference
        — and the full stack settles at ~250MB on an i5.
      </p>`,
    spec: [
      ["Status", "Daily driver", 1],
      ["Layout", "3 columns + bottom panel"],
      ["Widgets", "eww (built from source)"],
      ["LLM", "Ollama llama3.2:1b"],
      ["Load", "~250MB full stack"],
      ["Host", "Ubuntu 24.04 · i5"],
    ],
    quote: [
      "The interaction between complementary opposites generates all phenomena.",
      "MAGI consensus — Melchior / Balthasar / Caspar",
    ],
    steps: [
      [
        "Install",
        "install.sh takes the apt dependencies, builds eww from source and symlinks ~/.config/eva-shell from the repo.",
      ],
      [
        "Compose",
        "i3-gaps + picom: sharp windows, desaturated blur and shadow, a custom animation curve.",
      ],
      [
        "Stream",
        "Ten-plus bash helpers pull from /proc, /sys and journalctl into the panels — logs, process tree, network bars.",
      ],
      [
        "Consult",
        "MELCHIOR's box runs llama3.2:1b through Ollama for local system analysis on demand.",
      ],
      [
        "Re-skin",
        "One colors.conf re-themes the whole desktop; GTK3-compatible SCSS keeps it flat and fast.",
      ],
    ],
    log: [
      [
        "Phase 1–3 — layout",
        "Three-column HUD, MAGI progress bars, bottom four-cell panel. Palette locked to the HTML reference, byte for byte.",
      ],
      [
        "Phase 4 — top bar",
        "eww header: NERV branding, live timestamp, orange border, three sections — working now.",
      ],
      [
        "In progress",
        "MAGI ring SVG in the center canvas, workspace indicator on i3 events, MELCHIOR prompt tuning — phases 5 through 10 tracked in the phase plan.",
      ],
    ],
  },
  {
    slug: "eva-bots",
    name: "Evangelion Bots",
    title: ["EVANGELION", "BOTS"],
    desc: "Three Discord bots — Shinji, Asuka and Rei — powered by NVIDIA NIM, with cross-pilot conversation guarded by a three-hop chain limit.",
    tags: [
      ["Python", 0],
      ["NVIDIA NIM", 0],
      ["Discord", 0],
      ["Test suite", 0],
      ["AI / Discord", 1],
    ],
    lede: "Shinji, Asuka and Rei, sitting in-server and staying in character. <em>The companion project that makes eva-shell feel inhabited rather than themed.</em>",
    status: [
      ["Project", "In-server pilots"],
      ["Status", "Three bots", 1],
      ["Source", "Public"],
      ["Year", "2026"],
    ],
    primary: {
      href: "https://github.com/vulgnox/discord-evangelion-themed-bots",
      label: "GitHub",
      solid: true,
    },
    secondary: null,
    figcap: "FIG. 03 — THREE PILOTS, ONE RUNTIME",
    overview: `
      <p>
        Three bots, three personalities. <b>Shinji</b> is insecure and passive
        — ellipses, lowercase, faintly depressed. <b>Asuka</b> is arrogant,
        fiery, competitive, and calls everyone baka. <b>Rei</b> is enigmatic,
        emotionless, philosophical — and the only one holding admin tools.
      </p>
      <h3>One runtime, three personas</h3>
      <p>
        <b>base_bot.py</b> is the shared class; <b>bot_runtime.py</b> owns the
        LLM calls with retry logic; <b>eva_context.py</b> holds pilot profiles
        so each bot never forgets who it is. Shinji, Asuka and Rei are thin
        character files on top.
      </p>
      <h3>Pilots talk to each other</h3>
      <p>
        Mention several pilots in one message and they reference each other
        with real Discord mentions. Bot-to-bot replies carry invisible chain
        markers — <b>three hops maximum</b>, then the thread is cut.
        <em>No runaway conversations, no surprise API bill.</em>
      </p>
      <h3>Rei has the keys</h3>
      <p>
        Rei executes owner-only administrative actions from natural language.
        A test suite covers context, runtime and the base bot;
        <b>run_all_bots.py</b> staggers startup to dodge rate limits, restarts
        on crash, and shuts down gracefully on SIGTERM.
      </p>`,
    spec: [
      ["Bots", "3 pilots", 1],
      ["Model", "NIM llama2-70b"],
      ["Runtime", "shared base + retry"],
      ["Launch", "staggered, auto-restart"],
      ["Deploy", "Railway"],
      ["Tests", "context · runtime · base"],
    ],
    quote: [
      "Invisible chain markers — three hops, then the conversation ends.",
      "Anti-runaway protocol",
    ],
    steps: [
      [
        "Configure",
        "Three Discord tokens plus one NVIDIA NIM key land in .env; check.py verifies the API before anything runs.",
      ],
      [
        "Personate",
        "Character files set the voice — Shinji's lowercase ellipses, Asuka's baka, Rei's flat philosophy.",
      ],
      [
        "Converse",
        "Cross-pilot mentions chain through bot_runtime with invisible markers — capped at three hops.",
      ],
      [
        "Operate",
        "Rei answers the owner with admin actions; the other two just talk.",
      ],
      [
        "Deploy",
        "Railway runs run_all_bots.py: staggered startup, restart on crash, graceful SIGTERM.",
      ],
    ],
    log: [
      [
        "Single pilot",
        "One bot, one persona — shinji.py against NVIDIA NIM, retry logic living in the runtime.",
      ],
      [
        "Three-pilot runtime",
        "base_bot shared class, eva_context pilot profiles, run_all_bots launcher with staggered startup.",
      ],
      [
        "Test suite",
        "Context, runtime and base bot each covered — characters regress, tests catch it.",
      ],
    ],
  },
  {
    slug: "local-agent",
    name: "local-agent",
    title: ["LOCAL", "AGENT"],
    desc: "NOX: a local desktop AI agent — Mistral 7B via Ollama, SQLite memory that survives restarts, a pattern-match fast path and voice input.",
    tags: [
      ["Python", 0],
      ["Ollama", 0],
      ["SQLite", 0],
      ["Voice", 0],
      ["AI / Local", 1],
    ],
    lede: "A desktop AI agent that runs entirely on the machine and remembers across sessions. <em>Local architecture, no cloud dependency, no forgetting.</em>",
    status: [
      ["Project", "Desktop agent"],
      ["Status", "Local-only", 1],
      ["Source", "Public"],
      ["Year", "2026"],
    ],
    primary: {
      href: "https://github.com/vulgnox/local-agent",
      label: "GitHub",
      solid: true,
    },
    secondary: null,
    figcap: "FIG. 04 — PATTERN MATCH → EXECUTE / ASK MISTRAL → VALIDATE",
    overview: `
      <p>
        NOX is a free local agent for desktop automation. <b>Mistral 7B</b> runs
        through Ollama on localhost:11434 — no cloud, no API costs, all
        on-device, inside a Python event loop you can read in one sitting.
      </p>
      <h3>Fast path first</h3>
      <p>
        Pattern matching answers instantly: <b>list files</b> becomes ls -la,
        <b>check disk space</b> becomes df -h, plus memory usage, system info,
        processes — without waking the model at all. Only what the patterns
        miss goes to Mistral, and what comes back is
        <b>validated strictly</b> before anything executes. Dangerous commands
        never auto-run.
      </p>
      <h3>It remembers</h3>
      <p>
        “Remember that I like Python” writes to a SQLite database; every later
        answer is built with those facts as context —
        <em>“based on the fact that you prefer Python…”</em>. forget, list
        memories, clear memories — all first-class commands.
      </p>
      <h3>And it listens</h3>
      <p>
        Speech-to-text with wake-word detection — any phrase containing
        <b>“nox”</b> arms voice mode. No voice output: pyttsx3 wasn't good
        enough to ship.
      </p>`,
    spec: [
      ["Brain", "Mistral 7B · Ollama", 1],
      ["Memory", "SQLite memories.db"],
      ["Fast path", "pattern commands"],
      ["Voice", "wake word: nox"],
      ["Safety", "no dangerous auto-exec"],
      ["Deps", "requests · SpeechRecognition"],
    ],
    quote: [
      "Pattern match? Execute instantly. Otherwise ask Mistral — and validate strictly before running anything.",
      "The architecture",
    ],
    steps: [
      [
        "Listen",
        "Text or voice; wake-word detection arms a voice session on any phrase containing nox.",
      ],
      [
        "Match",
        "command_patterns.py recognises system and file operations and executes them instantly — no model involved.",
      ],
      [
        "Consult",
        "Only unmatched input reaches Mistral through Ollama, with saved memories injected as context.",
      ],
      [
        "Validate",
        "executor.py runs model-suggested commands through a safety gate — nothing dangerous executes on its own.",
      ],
      [
        "Remember",
        "Anything prefaced “remember that” lands in SQLite and shapes every future answer.",
      ],
    ],
    log: [
      [
        "Core loop",
        "agent.py + main.py: pattern fast path, Mistral fallback, memory context injected before every response.",
      ],
      [
        "Memory system",
        "SQLite remembers explicit facts — remember that / forget / list / clear — and recalls them into context.",
      ],
      [
        "Voice",
        "Wake-word detection on “nox”, speech-to-text input. No voice output — the quality wasn't there.",
      ],
    ],
  },
  {
    slug: "outgrow",
    name: "Outgrow",
    title: ["OUT", "GROW"],
    desc: "Outgrow: a multiplayer discipline engine for exam season — Python stdlib, SQLite, invite-only crews, chat, XP and a Discord webhook.",
    tags: [
      ["Python stdlib", 0],
      ["SQLite", 0],
      ["Mobile-first web", 0],
      ["~80 API checks", 0],
      ["Data / Systems", 1],
    ],
    lede: "Growth tracking turned into something measurable — and then multiplayer. <em>A discipline engine for exam season: crews, streaks, XP, and a day that rolls over at 3 AM.</em>",
    status: [
      ["Project", "Discipline engine"],
      ["Status", "Self-hosted", 1],
      ["Source", "Public"],
      ["Year", "2026"],
    ],
    primary: {
      href: "https://github.com/vulgnox/Outgrow",
      label: "GitHub",
      solid: true,
    },
    secondary: null,
    figcap: "FIG. 05 — STREAK CURVE: SEASON 0 → NOW",
    overview: `
      <p>
        Outgrow is what growth_tracker grew into: a <b>multiplayer discipline
        engine</b> for exam season. Python standard library only, SQLite on
        disk, mobile-first web UI — ./run.sh and it's on localhost:8765 with
        the LAN address printed.
      </p>
      <h3>Crews, not accounts</h3>
      <p>
        First boot creates the crew <b>NervHQ</b> and prints an invite code.
        Friends open the ./share.sh public HTTPS link, enter the code, add the
        app to their home screen. Crew room chat plus private DMs — text only,
        1000 chars, because files are a rabbit hole.
      </p>
      <h3>A day that ends at 3 AM</h3>
      <p>
        The day rolls over at <b>3 AM in the server's timezone</b> — late
        sessions still count. Badges, level-ups, streaks and comebacks echo to
        Discord through an optional webhook. Admins get a dashboard: stats, DB
        backup download, PIN reset.
      </p>
      <h3>Season 0</h3>
      <p>
        The original growth_tracker CSV imports as <b>Season 0</b> — old
        usernames keep their history and gain a veteran badge. Around
        <em>~80 API checks</em> run against a temp database on their own port
        before anything ships. Data lives in one file: copy outgrow.db to back
        up.
      </p>`,
    spec: [
      ["Stack", "Python stdlib", 1],
      ["Data", "SQLite outgrow.db"],
      ["UI", "mobile-first"],
      ["Tests", "~80 API checks"],
      ["Day rolls", "3 AM local"],
      ["Deploy", "run.sh · share.sh · VPS"],
    ],
    quote: [
      "Anyone who registers with their old username gets XP and a veteran badge.",
      "Season 0 continuity",
    ],
    steps: [
      [
        "Run",
        "./run.sh starts the server and prints the LAN address; first boot creates the crew and its invite code.",
      ],
      [
        "Invite",
        "./share.sh prints a public HTTPS link for friends off your Wi-Fi — add to home screen, install as an app.",
      ],
      [
        "Compete",
        "Log sessions, keep streaks, climb XP — badges and level-ups post to Discord via webhook.",
      ],
      [
        "Administer",
        "OUTGROW_ADMINS grants a dashboard: server stats, database backup download, PIN reset.",
      ],
      [
        "Verify",
        "python3 test_api.py runs ~80 checks against a temporary database on its own port.",
      ],
    ],
    log: [
      [
        "Season 0",
        "growth_tracker's CSV imported as Season 0 — veterans keep their names, gain XP and a badge.",
      ],
      [
        "Multiplayer",
        "Crews, invites, chat room and DMs — stdlib HTTP, one SQLite file, zero framework.",
      ],
      [
        "Share link",
        "./share.sh opens the crew to friends off the LAN; DEPLOY.md covers 24/7 on a VPS.",
      ],
    ],
  },
  {
    slug: "blood-and-coin",
    name: "Blood & Coin",
    title: ["BLOOD &", "COIN"],
    desc: "Blood & Coin: an AI-powered Discord RPG economy — Llama 3.3 70B narrates duels and daily decrees over a persistent city of Valdris.",
    tags: [
      ["Python", 0],
      ["OpenRouter", 0],
      ["Llama 3.3 70B", 0],
      ["Discord", 0],
      ["Game / Systems", 1],
    ],
    lede: "Duels, bounties, faction war and a full economy inside the city of Valdris. <em>A persistent world nobody sane would maintain by hand — so a 70B model maintains it.</em>",
    status: [
      ["Project", "Fantasy economy"],
      ["Status", "Shipped", 1],
      ["Source", "Public"],
      ["Year", "2026"],
    ],
    primary: {
      href: "https://github.com/vulgnox/discord-bot-blood-and-coin-",
      label: "GitHub",
      solid: true,
    },
    secondary: null,
    figcap: "FIG. 06 — DUEL PROTOCOL: CHALLENGE, NARRATE, PAY",
    overview: `
      <p>
        Blood &amp; Coin runs a living fantasy RP economy inside a Discord server —
        <b>Coin and Blood</b> as currencies, factions at war, and a city of
        Valdris that issues edicts whether or not anyone is watching.
      </p>
      <h3>The daily decree</h3>
      <p>
        Every morning at <b>9 AM IST</b> an AI-generated event posts to
        #daily-decree. React with /decree respond, earn 50 Coin. The
        leaderboard in #leaderboard updates live after every action.
      </p>
      <h3>AI-narrated violence</h3>
      <p>
        /duel @user — a <b>Llama 3.3 70B</b> model narrates the fight, the
        winner takes 50 Coin. /legend turns a player's submitted moment into
        Hall of Legends lore. <em>The model isn't a chatbot here; it's the
        dungeon master writing the server's history.</em>
      </p>
      <h3>Economy guardrails</h3>
      <p>
        /give moves Coin between players; admin-only /forcepost and /addcoin
        work the levers. Three channels — daily-decree, leaderboard,
        hall-of-legends — and a Railway deployment with every token in
        environment variables.
      </p>`,
    spec: [
      ["Model", "Llama 3.3 70B", 1],
      ["Via", "OpenRouter"],
      ["Rhythm", "decree 9 AM IST"],
      ["Currencies", "Coin + Blood"],
      ["Lore", "/legend → Hall of Legends"],
      ["Deploy", "Railway (free)"],
    ],
    quote: [
      "A persistent world nobody sane would maintain by hand.",
      "The city of Valdris",
    ],
    steps: [
      [
        "Create",
        "Discord application with Server Members and Message Content intents; invite with embed permissions.",
      ],
      [
        "Channel",
        "daily-decree, leaderboard, hall-of-legends — names must match, or override them in env.",
      ],
      [
        "Deploy",
        "Railway: deploy from GitHub, pour tokens into variables, set the start command.",
      ],
      [
        "Loop",
        "9 AM IST decree → /decree respond pays 50 → duels narrate → legends write lore → leaderboard updates live.",
      ],
      [
        "Govern",
        "Admin commands /forcepost and /addcoin steer the economy without touching code.",
      ],
    ],
    log: [
      [
        "OpenRouter wiring",
        "Llama 3.3 70B through OpenRouter — one key, one model, narrating every decree and duel.",
      ],
      [
        "Live leaderboard",
        "#leaderboard reposts after every action — the economy is visible or it isn't real.",
      ],
      [
        "Deployment",
        "Railway free tier, environment variables only — no token ever touches the repo.",
      ],
    ],
  },
  {
    slug: "personal-tracker",
    name: "personal-tracker",
    title: ["PERSONAL", "TRACKER"],
    desc: "JEE Mains Journey Tracker: subject-wise study log, streaks, 45/10 pomodoro and focus mode — vanilla JS, offline, localStorage only.",
    tags: [
      ["Vanilla JS", 0],
      ["Chart.js", 0],
      ["Vite", 0],
      ["localStorage", 0],
      ["Web / Productivity", 1],
    ],
    lede: "The JEE Mains journey, tracked. <em>Subject-wise study log, streaks, a 45/10 pomodoro loop and a distraction-free focus mode — offline, mobile-first, no backend.</em>",
    status: [
      ["Project", "Study tracker"],
      ["Status", "Complete", 1],
      ["Source", "Public"],
      ["Year", "2026"],
    ],
    primary: {
      href: "https://github.com/vulgnox/personal-tracker",
      label: "GitHub",
      solid: true,
    },
    secondary: null,
    figcap: "FIG. 07 — POMODORO RING + WEEK BARS",
    overview: `
      <p>
        A mobile-first tracker for JEE Mains aspirants: log study hours per
        subject — <b>Physics, Chemistry, Maths</b> — against a daily goal, watch
        the streak count, keep going.
      </p>
      <h3>The pomodoro is the product</h3>
      <p>
        <b>45-minute focus blocks, 10-minute breaks</b>, an animated circular
        countdown that switches phases by itself. Focus mode strips the screen
        to the timer and your current task, rotates JEE-specific motivational
        quotes, and warns before you navigate away.
      </p>
      <h3>Guarded time</h3>
      <p>
        A screen-time controller tracks time spent in the app and enforces a
        configurable daily limit. Notifications-API reminders — custom label,
        time, day-of-week — plus a daily check-in nudge if no session has been
        logged.
      </p>
      <h3>Everything local</h3>
      <p>
        One index.html holds the app — HTML, CSS, JS, no framework. Chart.js
        draws the weekly bars; every byte lives in localStorage.
        <em>Nothing is sent to any server.</em>
      </p>`,
    spec: [
      ["Storage", "localStorage", 1],
      ["Backend", "none"],
      ["Charts", "Chart.js 4.4"],
      ["Mode", "pomodoro 45 / 10"],
      ["Build", "vanilla + Vite"],
      ["Privacy", "fully offline"],
    ],
    quote: [
      "All data is stored locally in the browser. Nothing is sent to any server.",
      "Data & privacy — README",
    ],
    steps: [
      [
        "Log",
        "Subject-wise hours against a daily goal; a 7-day history and a streak counter keep the pressure honest.",
      ],
      [
        "Focus",
        "45/10 pomodoro with auto phase switching; focus mode hides everything but the timer and the task.",
      ],
      [
        "Guard",
        "Screen-time limit with warning alerts; reminders through the browser Notifications API.",
      ],
      [
        "Review",
        "Dashboard: today's hours, streak, weekly total, goal progress, per-subject bars, weekly Chart.js chart.",
      ],
      [
        "Ship",
        "Vite for dev and deploy — pnpm --filter @workspace/jee-tracker run dev.",
      ],
    ],
    log: [
      [
        "Single file",
        "The whole app — HTML, CSS, JS — lives in index.html. No framework, no runtime build step.",
      ],
      [
        "Offline by design",
        "localStorage only: streaks, sessions, settings. Clear the browser and it resets — by design.",
      ],
      [
        "Vite wrapper",
        "A minimal Vite entry point gives dev server and deployment without touching the app itself.",
      ],
    ],
  },
];
