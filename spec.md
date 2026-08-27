# Portfolio — IDE Environment, Phase 2

**Status:** BUILT — all 13 steps complete on branch `ide-rebuild`
**Date:** 2026-08-27

> Built overnight, one commit per step, `main` untouched. Everything below is
> implemented and verified live except where 14 says otherwise. Three things
> still need Vedant: create the `dagavedant.github.io` repo, rewrite `now.md`
> and `uses.md`, and decide about mobile.
**Supersedes:** the long-scroll section layout currently on `main`

---

## 1. What this is

The portfolio becomes a working imitation of VS Code (Dark Modern). Content lives in
files. The reader opens files from an Explorer tree; each renders in the idiom of its own
extension. Projects open as GitHub repository pages built from real data.

Reference: the screenshot supplied 2026-08-27 — a real VS Code window running
`AutomaticTrashCan_CongressionalAppChallenge`. Chrome should match closely enough that a
developer recognises it immediately.

---

## 2. Navigation

**True editor — one document at a time.** No long scroll.

- Exactly one file visible at a time.
- Opening a file adds a **permanent tab**. No preview/italic tabs.
- Tabs close individually; the strip scrolls horizontally on overflow.
- Closing the last tab returns to Welcome.
- **The editor pane scrolls internally.** The window itself never scrolls — chrome stays
  fixed, only file content moves, with its own scrollbar and a line-number gutter that
  tracks it.
- **No URL routing.** The address bar never changes.
- **Tabs restore on reload** via `sessionStorage` — open tabs and the active one come
  back, as the real app does.

### Ctrl+P — fuzzy file switcher

Real overlay. Type `gard`, it fuzzy-matches `gardenbuddy.py`, Enter opens it. Bound to
Ctrl+P / Cmd+P, the command-centre click, and the Search activity-bar icon.

### Welcome screen (default view)

| Element | Content |
|---|---|
| Title block | "Vedant Daga" large + one-line tagline |
| **Start** | `about.md` · `projects` · `resume.pdf` · `contact.sh` |
| **Recent** | Newest repos with real last-commit dates |
| Contribution graph | Profile-level, a year of activity — the screen's centrepiece |
| Shortcut hints | Dimmed hints; also where readers learn the tree is clickable |

> **Recorded risk.** Welcome-as-default + no deep links means a visitor sees a menu
> rather than content on arrival, and no individual project can be linked to. Chosen
> deliberately. Tab restore recovers the refresh case but not the sharing case.

---

## 3. File tree

```
▾ vedant-daga
    about.md
    now.md
  ▾ projects
      pulseflow-ai.py
      ai-portfolio-analyzer.ipynb
      gardenbuddy.py
      frc-chatbot-team-10600.py
      voicegpt.py
      emnist-character-classifier.ipynb
      california-house-price-predictor.ipynb
      spam-message-ai-classifier.py
      leccion-7-de-espanol.py
      python-examples.js
      almanac-slack-bot.py
    stack.json
    education.md
    leadership.md
    credentials.md
    hobbies.md
    uses.md
    contact.sh
    resume.pdf
▸ Outline
▸ Timeline
```

**No `README.md`** — the Welcome screen does that job.

**Extensions are derived, not hand-assigned.** The build fetch returns each repo's
primary language; the tree maps language → extension, so it stays accurate as repos
change and new repos slot in with the right icon automatically.

| GitHub language | Ext | | GitHub language | Ext |
|---|---|---|---|---|
| Python | `.py` | | JavaScript | `.js` |
| Jupyter Notebook | `.ipynb` | | C / C++ / Arduino | `.ino` |
| TypeScript | `.tsx` | | *(none reported)* | `.md` |

`Outline` and `Timeline` render collapsed at the foot of the Explorer. Decorative.

---

## 4. File rendering

**Rule: anything under `projects/` opens the repo view, whatever its extension.** The
suffix exists to give the tree its icon and colour. Per-extension rendering applies only
to top-level files.

| Type | Rendering |
|---|---|
| `.md` | Formatted markdown with a **source / preview toggle** (preview default) |
| `.json` | Syntax-highlighted JSON, line numbers, collapsible braces |
| `.sh` | Terminal-script styling; commands are real links |
| `.pdf` | PDF embedded in the tab, with a download button |

**Content mapping**

| File | Source |
|---|---|
| `about.md` | `aboutBio` + `aboutHighlights` |
| `stack.json` | `techCategories` as a real JSON object |
| `education.md` / `leadership.md` / `hobbies.md` | corresponding arrays |
| `credentials.md` | `certifications`, `certificationsInProgress`, `recognitions` |
| `contact.sh` | `contactLinks` as a command block, each a real anchor |
| `now.md` | **New — needs content.** What you're building this month |
| `uses.md` | **New — needs content.** Editor, languages, boards, local models |

Existing copy in `portfolio-data.js` carries over **verbatim**. No rewrites.
`now.md` and `uses.md` are new — I'll draft a first pass for you to edit.

---

## 5. Repo views

Six pieces, in order:

1. **Header** — name, description, topic chips, star / fork / watch counts
2. **Language bar** — multi-colour bar with percentages
3. **File listing** — every root entry with last-commit message and relative time.
   Folders render as rows but don't expand. **Text files under ~40KB are clickable** and
   open their real source, syntax-highlighted, as GitHub's file viewer does.
4. **README** — rendered fully: badges, screenshots, code blocks, tables
5. **Contribution graph** — per-repo, bucketed from that repo's commits
6. **Commits** — 5 most recent: message, short SHA, author, date

**README rendering notes.** READMEs contain arbitrary HTML, so markdown must be
sanitised (`rehype-sanitize`). Relative image paths (`./demo/x.png`) must be rewritten to
`raw.githubusercontent.com` or they 404.

---

## 6. Data pipeline

```
GitHub Actions  (on push to main, plus every 2 days)
  └─ scripts/fetch-repos.mjs        [GITHUB_TOKEN provided by Actions]
       REST  /repos/DagaVedant/{repo}            → meta, stars, language
       REST  /repos/DagaVedant/{repo}/languages  → language bar
       REST  /repos/DagaVedant/{repo}/contents   → file listing
       REST  /repos/DagaVedant/{repo}/commits    → commits + per-repo graph
       REST  /repos/DagaVedant/{repo}/readme     → README markdown
       REST  /repos/.../contents/{file}          → source, text files <40KB
       GQL   user.contributionsCollection        → profile contribution graph
     ↓
     src/data/repos.generated.json     (metadata — in the main bundle)
     src/data/repos/{repo}.json        (source chunks — lazy, per repo)
     ↓
  └─ shiki, dark-modern theme → pre-highlighted HTML, baked in
  └─ vite build → deploy
```

- **Visitors make zero API calls.** No rate limits, spinners, or failure states.
- Initial bundle carries metadata only (~40kB). A repo's source chunk is fetched on
  demand when that repo is opened (~80–200kB).
- `GITHUB_TOKEN` is injected by Actions automatically — nothing to create or store. It
  raises the rate limit from 60/hr to 1000/hr, which matters at ~60+ calls per build.
- **The GraphQL graph covers public contributions only** — all public repos, PRs and
  issues, but not private ones. Private would need a PAT with `read:user`. Public-only
  is a deliberate accepted limitation.
- **On fetch failure the build fails and nothing deploys.** The live site keeps serving
  the last good data and GitHub emails the red X. Never ship partial data.
- Generated files are gitignored, with a last-known-good copy committed as a fallback.

---

## 7. Deployment

**Target: `dagavedant.github.io`** — a user page served from the repo root.

- **Requires moving this project to a repo named `dagavedant.github.io`.** Operational
  task, not a code change.
- A GitHub user page repo **must** be named `<username>.github.io`. The username is
  `DagaVedant`, so the URL is `dagavedant.github.io` — the repo name does not control it.
  A repo named `vedantdaga.github.io` would be an ordinary project repo serving at
  `dagavedant.github.io/vedantdaga.github.io/`.
- Considered and rejected 2026-08-27: renaming the account to `VedantDaga` (frees
  `DagaVedant` for anyone to claim; Pages URLs don't redirect) and buying
  `vedantdaga.com` (~$12/yr). Either remains available later — switching is a `base`
  change plus a `CNAME` file.
- `vite.config.js` base becomes `/` (currently `/vedant-portfolio/`).
- `import.meta.env.BASE_URL` usage in the code stays correct and needs no edit.
- Replace the current `gh-pages` npm deploy with an Actions workflow using
  `actions/deploy-pages`.
- Schedule: on push to `main`, plus a cron every two days.

---

## 8. Chrome

```
┌─ title bar ─────────────────────────────────────────────────────────┐
│ ⬛ File Edit Selection View Go Run Terminal Help   ← →  ⌗ command   │
│                                            centre ⌄   ▣▣▣  ─ □ ×   │
├────┬──────────────┬─────────────────────────────────────────────────┤
│ ⬛ │ EXPLORER  … │ ▸ about.md ×  ▸ gardenbuddy.py ×          ▷ ⌗ … │
│ 🔍 │ ▾ vedant-…  ├─────────────────────────────────────────────────┤
│ ⑂  │   about.md  │ vedant-daga > src > about.md > …                │
│ ▷🐞│ ▾ projects  ├──────────────────────────────────────┬──────────┤
│ ⊞  │   …         │  1  # About                          │ ▤ mini   │
│ ⚗  │   stack.json│  2                                   │ ▤ map    │
│ 🐍 │             │  3  I'm always building something…   │ ▤        │
│ 🤖 │ ▸ Outline   │                                      │          │
│ 👤 │ ▸ Timeline  │                                      │          │
│ ⚙  │             │                                      │          │
├────┴─────────────┴──────────────────────────────────────┴──────────┤
│ Problems  Output  Debug Console  [Terminal]  Ports  Playwright   … │
│ (.venv) PS C:\Users\DagaV\Desktop\vedant-portfolio> █              │
├────────────────────────────────────────────────────────────────────┤
│ ⨯ ⊗0 ⚠0 🕐    Ln 1, Col 1  Spaces:4  UTF-8  LF  Python  motion:on │
└────────────────────────────────────────────────────────────────────┘
```

**Interactive:** Explorer tree · tabs · breadcrumb · editor content · Ctrl+P · Terminal ·
status-bar motion toggle · Search icon (opens Ctrl+P).

**Design only — must not look clickable:** menu bar · command centre · back/forward ·
layout toggles · window controls · activity-bar icons other than Explorer and Search ·
avatar · gear · Outline · Timeline · minimap · the five non-Terminal panel tabs.

**Minimap** is a decorative strip — abstract lines, not a real render.

**Branding:** VS Code logo and product name replicated, per explicit decision after the
trademark implication was raised. The mark is **redrawn as inline SVG**, not
redistributed from Microsoft's asset files.

---

## 9. Boot sequence

Retained. Full-screen terminal streams real commands, then **docks** into the panel — one
continuous move, never a cut.

**Motion prompt**, partway through:

```
$ enable motion? (Y/n) █
  → defaulting to Y in 3…
```

- Reader may type `y`/`n` + Enter.
- **Auto-continues after 5 seconds, defaulting to yes.** Never blocks.
- Sets the same state the status-bar toggle controls.
- Plays once per session; replays fast afterwards. Skippable by click, key, or control.
- Motion off → final frame immediately.

---

## 10. Bottom panel

Six tabs: `Problems · Output · Debug Console · Terminal · Ports · Playwright`.
**Terminal is active by default and the only live one** — it holds the docked boot
scrollback plus a blinking prompt. The other five are inert chrome, not placeholders.

**Cut:** the GardenBuddy serial-monitor trace built in phase 1.

---

## 11. Visual system

**Palette — VS Code Dark Modern, matched exactly.**

| Token | Value | | Token | Value |
|---|---|---|---|---|
| chrome | `#181818` | | keyword | `#C586C0` |
| editor bg | `#1F1F1F` | | module / type | `#4EC9B0` |
| text | `#CCCCCC` | | string | `#CE9178` |
| line numbers | `#6E7681` | | function | `#DCDCAA` |
| status bar | `#0078D4` | | | |

Single dark theme. No light mode.

**Typography:** JetBrains Mono for all chrome, code and file content. Archivo / Inter
only for rendered prose in `.md` preview and on Welcome.

**Highlighting:** Shiki at build time, using VS Code's own TextMate grammars and the real
Dark Modern theme. Emits static markup — **0kB of highlighter ships to the browser** and
colours match the reference exactly rather than approximately.

**Motion** — must be visible; "I don't see anything" was the phase-1 failure. Boot stream
and dock · sliding active-tab underline · tab open/close · file-open transition · Ctrl+P
overlay · caret blink. One hover gesture only: border-colour shift. All routed through
`useMotion()`, never a raw media query.

**Cut:** the ambient spectrogram backdrop. The editor ground is flat, with the
line-number gutter and indent guides as its only texture — as in real VS Code.

---

## 12. Out of scope

- **Mobile / responsive.** Explicitly deferred: "don't design around phone for now."
  **Largest known gap** — a full IDE layout does not fit 375px, and phone visitors will
  get a broken experience. Needs a decision before the link is shared widely.
- Deep links / URL routing.
- The horizontal projects rail — **dropped**; repo views replace it.
- Making the five non-Terminal panel tabs functional.
- Expanding folders inside repo file listings.
- Private contribution counts.
- Light theme.

---

## 13. Build order

1. Palette swap to Dark Modern + chrome metrics
2. `scripts/fetch-repos.mjs` — REST + GraphQL, Shiki pass, chunked output, fail-loud
3. Actions workflow — push + 2-day cron, `actions/deploy-pages`, base path `/`
4. Chrome rebuild to match the screenshot
5. Tab state machine — open / close / switch / overflow / sessionStorage restore
6. Explorer tree with derived extensions and real icons
7. Ctrl+P fuzzy switcher
8. Per-extension renderers (`.md`, `.json`, `.sh`, `.pdf`)
9. Repo view — six pieces, plus lazy source chunks
10. Welcome screen + profile contribution graph
11. Boot sequence motion prompt; panel down to six tabs
12. Draft `now.md` and `uses.md`
13. Remove: ambient backdrop, serial monitor content, projects rail, old section layout

---

## 14. Open items needing you

- **Move the repo to `dagavedant.github.io`** — I can't do this; it's a GitHub operation.
- **Content for `now.md` and `uses.md`** — I'll draft, you edit.
- **Mobile** — currently unspecified by choice. Decide before sharing the link.
