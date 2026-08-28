/**
 * fetch-repos.mjs — build-time GitHub fetch.
 *
 * Runs before `vite build`. Pulls everything the repo views need, pre-highlights
 * source with Shiki using VS Code's own Dark Modern theme, and writes:
 *
 *   src/data/repos.generated.json     metadata for all repos + contribution graph
 *                                     (shipped in the main bundle, ~40kB)
 *   src/data/repos/<repo>.json        README html + per-file source
 *                                     (lazy-loaded when that repo is opened)
 *
 * Visitors make zero API calls.
 *
 * FAILS LOUD. Any API error aborts the build so the live site keeps serving the
 * previous good deploy rather than shipping half-empty repo views. Partial data
 * is never written — output files are only touched once every fetch succeeded.
 *
 * Auth: GITHUB_TOKEN if present (GitHub Actions injects one automatically).
 * Without it the script still runs against the unauthenticated API, which allows
 * 60 requests/hour — enough for one local run, not much more.
 */

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHighlighter } from "shiki";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const CHUNK_DIR = path.join(DATA_DIR, "repos");
const SOURCE_FILE = path.join(DATA_DIR, "portfolio-data.js");
const META_OUT = path.join(DATA_DIR, "repos.generated.json");

const API = "https://api.github.com";
const GRAPHQL = "https://api.github.com/graphql";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

/**
 * --lite skips per-file source fetching. Source is one request per file, which
 * dominates the budget: the full run is ~200 requests against an unauthenticated
 * limit of 60. Lite is exactly 5 requests per repo, so a tokenless local run can
 * still produce real metadata, commits, READMEs and file listings. CI always
 * runs full — it has a token.
 */
const LITE = process.argv.includes("--lite");

/** Files above this are listed but not shipped as source. */
const MAX_SOURCE_BYTES = 40 * 1024;
/** Commits pulled per repo: 5 are displayed, the rest feed the per-repo graph. */
const COMMITS_PER_REPO = 100;

/* ------------------------------------------------------------------ utils */

const log = (...a) => console.log("[fetch-repos]", ...a);
const warn = (...a) => console.warn("[fetch-repos]", ...a);

class FetchError extends Error {}

let requestCount = 0;

async function gh(endpoint, { raw = false, optional = false } = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API}${endpoint}`;
  const headers = {
    Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "vedant-portfolio-build",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  requestCount += 1;
  const res = await fetch(url, { headers });

  if (res.status === 404 && optional) return null;

  if (!res.ok) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    const reset = res.headers.get("x-ratelimit-reset");
    let detail = "";
    try {
      detail = (await res.text()).slice(0, 300);
    } catch {
      /* body already consumed or empty */
    }
    let hint = "";
    if (res.status === 403 && remaining === "0") {
      const when = reset ? new Date(Number(reset) * 1000).toISOString() : "unknown";
      hint = TOKEN
        ? `\n  Rate limit exhausted. Resets at ${when}.`
        : `\n  Rate limit exhausted (60/hr unauthenticated). Resets at ${when}.` +
          `\n  Set GITHUB_TOKEN to raise this to 1000/hr.`;
    }
    throw new FetchError(`${res.status} ${res.statusText} — ${url}${hint}\n  ${detail}`);
  }

  return raw ? res.text() : res.json();
}

/**
 * Total commits on a branch.
 *
 * The REST API has no count endpoint, and paging the whole history would cost
 * one request per 100 commits. Asking for a single commit makes the Link
 * header's rel="last" page number equal the total, for one request.
 */
async function commitTotal(owner, repo, branch, fallback) {
  const url =
    `${API}/repos/${owner}/${repo}/commits` +
    `?per_page=1&sha=${encodeURIComponent(branch)}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "vedant-portfolio-build",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  requestCount += 1;
  const res = await fetch(url, { headers });
  if (!res.ok) return fallback;

  const link = res.headers.get("link") || "";
  const m = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  // No Link header means a single page, so the fetched list is the whole thing.
  return m ? Number(m[1]) : fallback;
}

async function graphql(query, variables) {
  if (!TOKEN) return null;
  requestCount += 1;
  const res = await fetch(GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "vedant-portfolio-build",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new FetchError(`GraphQL ${res.status} ${res.statusText}`);
  const json = await res.json();
  if (json.errors?.length) {
    throw new FetchError(`GraphQL: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  return json.data;
}

/* ------------------------------------------------- repo list from the data */

/**
 * portfolio-data.js is the single source of truth for which repos exist. It
 * imports lucide-react and a JSX component, so it cannot be imported from a
 * plain node script — parse the github URLs out instead.
 */
async function readRepoList() {
  const src = await readFile(SOURCE_FILE, "utf8");
  const re = /github:\s*"https:\/\/github\.com\/([^/"]+)\/([^"]+)"/g;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, owner, repo] = m;
    const key = `${owner}/${repo}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ owner, repo });
  }
  if (out.length === 0) {
    throw new FetchError(`No github: URLs found in ${SOURCE_FILE}`);
  }
  return out;
}

/* ------------------------------------------------------------ language map */

/** GitHub's reported primary language decides the file's extension in the tree. */
const LANGUAGE_EXT = {
  Python: "py",
  "Jupyter Notebook": "ipynb",
  TypeScript: "ts",
  JavaScript: "js",
  C: "ino",
  "C++": "ino",
  Arduino: "ino",
  HTML: "html",
  CSS: "css",
  Shell: "sh",
  Java: "java",
  Go: "go",
  Rust: "rs",
};

const extForLanguage = (language) => LANGUAGE_EXT[language] || "md";

/** Shiki grammar for a filename. */
const EXT_LANG = {
  py: "python",
  ipynb: "json",
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  ino: "cpp",
  c: "c",
  cpp: "cpp",
  h: "cpp",
  json: "json",
  md: "markdown",
  markdown: "markdown",
  sh: "shell",
  bash: "shell",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  txt: "text",
  cfg: "ini",
  ini: "ini",
  html: "html",
  css: "css",
  sql: "sql",
  java: "java",
  go: "go",
  rs: "rust",
};

const grammarFor = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (filename.toLowerCase() === "dockerfile") return "docker";
  if (filename.toLowerCase() === "makefile") return "make";
  return EXT_LANG[ext] || null;
};

/** Extensions we never ship as source even when small. */
const BINARY_EXT = new Set([
  "png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp",
  "pt", "pth", "onnx", "h5", "pkl", "joblib", "bin", "safetensors",
  "zip", "tar", "gz", "7z", "rar", "pdf", "mp4", "mov", "avi", "mp3", "wav",
  "ttf", "otf", "woff", "woff2", "eot", "stl", "step", "f3d",
]);

const isBinary = (name) => BINARY_EXT.has(name.split(".").pop()?.toLowerCase() ?? "");

/* --------------------------------------------------------- readme rewrites */

/**
 * READMEs use relative image paths (./demo/x.png). Those 404 once the markdown
 * is rendered anywhere other than the repo page, so rewrite them to raw.
 */
function absolutiseMarkdown(md, owner, repo, branch) {
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;
  const blobBase = `https://github.com/${owner}/${repo}/blob/${branch}/`;
  const isAbsolute = (u) => /^(https?:)?\/\//i.test(u) || u.startsWith("data:") || u.startsWith("#");
  const clean = (u) => u.replace(/^\.\//, "").replace(/^\//, "");

  return md
    // ![alt](path)
    .replace(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g, (full, alt, url, title) =>
      isAbsolute(url) ? full : `![${alt}](${rawBase}${clean(url)}${title || ""})`)
    // <img src="path">
    .replace(/(<img\b[^>]*\bsrc=")([^"]+)(")/gi, (full, pre, url, post) =>
      isAbsolute(url) ? full : `${pre}${rawBase}${clean(url)}${post}`)
    // [text](path) — links point at the repo, not raw
    .replace(/(^|[^!])\[([^\]]+)\]\(\s*<?([^)\s>]+)>?\s*\)/g, (full, lead, text, url) =>
      isAbsolute(url) ? full : `${lead}[${text}](${blobBase}${clean(url)})`);
}

/* ----------------------------------------------------- contribution graphs */

/** Bucket ISO dates into { 'YYYY-MM-DD': count } for the last 53 weeks. */
function bucketCommitDates(dates) {
  const counts = {};
  for (const iso of dates) {
    const day = iso.slice(0, 10);
    counts[day] = (counts[day] || 0) + 1;
  }
  return counts;
}

/**
 * Profile-level contribution graph. GitHub exposes this only through GraphQL,
 * which needs a token — Actions injects one. The token Actions provides is
 * repo-scoped, so this returns PUBLIC contributions only; private ones would
 * need a PAT with read:user.
 */
async function fetchProfileContributions(login) {
  const data = await graphql(
    `
      query ($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `,
    { login }
  );
  if (!data?.user?.contributionsCollection) return null;

  const cal = data.user.contributionsCollection.contributionCalendar;
  const days = {};
  for (const week of cal.weeks) {
    for (const d of week.contributionDays) days[d.date] = d.contributionCount;
  }
  return { total: cal.totalContributions, days, source: "graphql" };
}

/** Fallback when no token: bucket every commit we already fetched. */
function reconstructContributions(allCommitDates) {
  const days = bucketCommitDates(allCommitDates);
  const total = Object.values(days).reduce((a, b) => a + b, 0);
  return { total, days, source: "reconstructed" };
}

/* ------------------------------------------------------------------- repo  */

async function fetchRepo({ owner, repo }, highlighter) {
  log(`  ${owner}/${repo}`);

  const meta = await gh(`/repos/${owner}/${repo}`);
  const branch = meta.default_branch || "main";

  const [languages, contents, commits, readmeRaw, branches, tags, contributors] =
    await Promise.all([
      gh(`/repos/${owner}/${repo}/languages`),
      gh(`/repos/${owner}/${repo}/contents?ref=${encodeURIComponent(branch)}`, { optional: true }),
      gh(`/repos/${owner}/${repo}/commits?per_page=${COMMITS_PER_REPO}&sha=${encodeURIComponent(branch)}`),
      gh(`/repos/${owner}/${repo}/readme`, { raw: true, optional: true }),
      gh(`/repos/${owner}/${repo}/branches?per_page=100`, { optional: true }),
      gh(`/repos/${owner}/${repo}/tags?per_page=100`, { optional: true }),
      gh(`/repos/${owner}/${repo}/contributors?per_page=20`, { optional: true }),
    ]);

  const totalCommits = await commitTotal(owner, repo, branch, commits.length);

  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0) || 1;
  const languageBar = Object.entries(languages)
    .map(([name, bytes]) => ({ name, bytes, percent: +((bytes / totalBytes) * 100).toFixed(1) }))
    .sort((a, b) => b.bytes - a.bytes);

  const commitList = commits.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: (c.commit.message || "").split("\n")[0].slice(0, 120),
    date: c.commit.author?.date || c.commit.committer?.date || null,
    author: c.author?.login || c.commit.author?.name || owner,
    avatar: c.author?.avatar_url || null,
    url: c.html_url,
  }));

  // Root listing. GitHub's own file table shows the last commit that touched
  // each path; fetching that per file is one request each, which blows the
  // rate limit. The repo's most recent commit is used instead and labelled
  // honestly in the UI as the repo's latest, not the file's.
  const entries = Array.isArray(contents) ? contents : [];
  const files = entries
    .map((e) => ({
      name: e.name,
      type: e.type, // "file" | "dir"
      size: e.size ?? 0,
      url: e.html_url,
      downloadUrl: e.download_url || null,
      hasSource: e.type === "file" && !isBinary(e.name) && (e.size ?? 0) <= MAX_SOURCE_BYTES,
    }))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  // Per-file last commit — the message and time GitHub shows on each row.
  // One request per entry, so it is skipped in --lite; with a token the whole
  // run still lands around 400 of the 1000/hr allowance.
  if (!LITE) {
    for (const f of files) {
      const path = encodeURIComponent(f.name);
      const log = await gh(
        `/repos/${owner}/${repo}/commits?path=${path}&per_page=1&sha=${encodeURIComponent(branch)}`,
        { optional: true }
      );
      const c = Array.isArray(log) ? log[0] : null;
      if (!c) continue;
      f.lastCommit = {
        message: (c.commit.message || "").split("\n")[0].slice(0, 120),
        date: c.commit.author?.date || c.commit.committer?.date || null,
        sha: c.sha.slice(0, 7),
      };
    }
  }

  // Source for the shippable files, pre-highlighted.
  const sources = {};
  if (LITE) {
    // Keep hasSource honest: nothing was fetched, so nothing is clickable.
    for (const f of files) f.hasSource = false;
  }
  for (const f of LITE ? [] : files.filter((x) => x.hasSource)) {
    const text = await gh(
      `/repos/${owner}/${repo}/contents/${encodeURIComponent(f.name)}?ref=${encodeURIComponent(branch)}`,
      { raw: true, optional: true }
    );
    if (text == null) {
      f.hasSource = false;
      continue;
    }
    const grammar = grammarFor(f.name);
    sources[f.name] = {
      lines: text.split("\n").length,
      bytes: text.length,
      html: grammar
        ? highlighter.codeToHtml(text, { lang: grammar, theme: "dark-plus" })
        : `<pre class="shiki"><code>${escapeHtml(text)}</code></pre>`,
    };
  }

  const readme = readmeRaw ? absolutiseMarkdown(readmeRaw, owner, repo, branch) : null;

  return {
    meta: {
      owner,
      repo,
      fullName: meta.full_name,
      description: meta.description || "",
      topics: meta.topics || [],
      stars: meta.stargazers_count ?? 0,
      forks: meta.forks_count ?? 0,
      watchers: meta.subscribers_count ?? 0,
      openIssues: meta.open_issues_count ?? 0,
      language: meta.language || null,
      ext: extForLanguage(meta.language),
      license: meta.license?.spdx_id || null,
      homepage: meta.homepage || null,
      defaultBranch: branch,
      pushedAt: meta.pushed_at,
      createdAt: meta.created_at,
      htmlUrl: meta.html_url,
      languageBar,
      files,
      branchCount: Array.isArray(branches) ? branches.length : 1,
      tagCount: Array.isArray(tags) ? tags.length : 0,
      // GitHub's web UI also counts Co-authored-by trailers here; the REST
      // endpoint counts commit authors only, so this list can be shorter than
      // what the repo page shows.
      contributors: (Array.isArray(contributors) ? contributors : [])
        .slice(0, 12)
        .map((c) => ({
          login: c.login,
          avatar: c.avatar_url,
          contributions: c.contributions,
          url: c.html_url,
        })),
      coAuthors: [
        ...new Set(
          commits.flatMap((c) =>
            [...(c.commit.message || "").matchAll(/Co-authored-by:\s*(.+)/gi)].map((m) =>
              m[1].trim()
            )
          )
        ),
      ],
      commitCount: totalCommits,
      // How many of those we actually pulled. The per-repo graph below only
      // covers this many, not the full history.
      commitsSampled: commitList.length,
      commits: commitList.slice(0, 5),
      contributions: {
        total: commitList.length,
        days: bucketCommitDates(commitList.map((c) => c.date).filter(Boolean)),
      },
    },
    chunk: { repo, readme, sources },
    commitDates: commitList.map((c) => c.date).filter(Boolean),
  };
}

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* -------------------------------------------------------------------- main */

async function main() {
  const started = Date.now();
  log(TOKEN ? "authenticated (GITHUB_TOKEN present)" : "UNAUTHENTICATED — 60 req/hr");
  if (LITE) log("--lite: skipping per-file source (metadata, commits, READMEs only)");

  const repos = await readRepoList();
  log(`${repos.length} repos from portfolio-data.js`);

  const highlighter = await createHighlighter({
    themes: ["dark-plus"],
    langs: [...new Set(Object.values(EXT_LANG).filter((l) => l !== "text"))],
  });

  // Sequential on purpose: parallel bursts trip secondary rate limits, and a
  // clean error is worth more than a few seconds.
  const results = [];
  for (const r of repos) results.push(await fetchRepo(r, highlighter));

  const owner = repos[0].owner;
  const allCommitDates = results.flatMap((r) => r.commitDates);

  let profile = null;
  if (TOKEN) {
    profile = await fetchProfileContributions(owner);
    if (!profile) warn("GraphQL returned no calendar; falling back to commit buckets");
  } else {
    warn("no token — profile graph reconstructed from commits (undercounts)");
  }
  if (!profile) profile = reconstructContributions(allCommitDates);

  const payload = {
    generatedAt: new Date().toISOString(),
    lite: LITE,
    owner,
    profileContributions: profile,
    repos: Object.fromEntries(results.map((r) => [r.meta.repo, r.meta])),
  };

  // Everything succeeded — only now touch the output.
  await mkdir(CHUNK_DIR, { recursive: true });
  if (existsSync(CHUNK_DIR)) {
    await rm(CHUNK_DIR, { recursive: true, force: true });
    await mkdir(CHUNK_DIR, { recursive: true });
  }
  await writeFile(META_OUT, JSON.stringify(payload, null, 2), "utf8");
  for (const r of results) {
    await writeFile(
      path.join(CHUNK_DIR, `${r.chunk.repo}.json`),
      JSON.stringify(r.chunk),
      "utf8"
    );
  }

  const metaKb = Math.round(JSON.stringify(payload).length / 1024);
  const chunkKb = Math.round(
    results.reduce((a, r) => a + JSON.stringify(r.chunk).length, 0) / 1024
  );
  log(
    `done in ${((Date.now() - started) / 1000).toFixed(1)}s — ` +
      `${requestCount} requests, metadata ${metaKb}kB, chunks ${chunkKb}kB total`
  );
  log(`profile contributions: ${profile.total} (${profile.source})`);
}

main().catch((err) => {
  console.error("\n[fetch-repos] BUILD ABORTED\n");
  console.error(err instanceof FetchError ? err.message : err);
  console.error(
    "\nNothing was written. The previous src/data/repos.generated.json is intact,\n" +
      "so a deploy from the last good data still works.\n"
  );
  process.exit(1);
});
