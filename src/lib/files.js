/**
 * The workspace file registry.
 *
 * Every piece of content in the portfolio is a file. This module is the single
 * source of truth for what exists, what it is called, which icon it gets and
 * which renderer opens it.
 *
 * Project files are DERIVED from src/data/repos.generated.json — the build fetch
 * records each repo's primary language and maps it to an extension, so the tree
 * stays honest as the repos change and a new repo appears with the right icon
 * without anyone editing this file.
 */

import repoData from "@/data/repos.generated.json";
import { projects as curatedProjects } from "@/data/portfolio-data";

/**
 * The one thing GitHub cannot tell us: whether a repo is still being built.
 * Keyed by repo name, taken from the curated list in portfolio-data.
 */
const IN_PROGRESS = new Set(
  curatedProjects
    .filter((p) => p.inProgress)
    .map((p) => p.github.split("/").pop().replace(/\.git$/, ""))
);

/* ------------------------------------------------------------------ icons */

/**
 * Colours approximate the Seti file-icon theme VS Code ships with, so the tree
 * reads the way a developer expects at a glance.
 */
export const EXT_META = {
  md: { color: "#519aba", label: "Markdown" },
  json: { color: "#cbcb41", label: "JSON" },
  py: { color: "#3776ab", label: "Python" },
  ipynb: { color: "#f37726", label: "Jupyter Notebook" },
  tsx: { color: "#61dafb", label: "TypeScript React" },
  ts: { color: "#3178c6", label: "TypeScript" },
  js: { color: "#f7df1e", label: "JavaScript" },
  html: { color: "#e37933", label: "HTML" },
  css: { color: "#519aba", label: "CSS" },
  sh: { color: "#4eaa25", label: "Shell Script" },
  pdf: { color: "#d43a2f", label: "PDF" },
  txt: { color: "#9d9d9d", label: "Plain Text" },
  ino: { color: "#00979c", label: "Arduino" },
};

export const extOf = (name) => name.split(".").pop()?.toLowerCase() ?? "";
export const metaForExt = (ext) => EXT_META[ext] || { color: "#9d9d9d", label: "File" };

/** VS Code's status bar names the open file's language. */
export const languageLabel = (file) => {
  if (!file) return "Plain Text";
  if (file.kind === "repo") return metaForExt(file.ext).label;
  return metaForExt(file.ext).label;
};

/* -------------------------------------------------------------- repo files */

/**
 * PulseFlow-AI -> pulseflow-ai, GardenBuddy -> gardenbuddy, VoiceGPT -> voicegpt.
 * Deliberately does NOT split camelCase: a developer naming a file after
 * GardenBuddy writes gardenbuddy, not garden-buddy.
 */
const kebab = (s) =>
  s
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

const repoEntries = Object.values(repoData.repos ?? {});

/**
 * One file per repo, extension derived from the language GitHub reports.
 * Sorted by most recently pushed so the tree leads with live work.
 */
export const PROJECT_FILES = repoEntries
  .slice()
  .sort((a, b) => new Date(b.pushedAt) - new Date(a.pushedAt))
  .map((r) => ({
    id: `projects/${kebab(r.repo)}`,
    name: `${kebab(r.repo)}.${r.ext}`,
    ext: r.ext,
    kind: "repo",
    repo: r.repo,
    parent: "projects",
    title: r.repo,
    inProgress: IN_PROGRESS.has(r.repo),
  }));

/* ------------------------------------------------------------- doc files  */

const DOC_FILES = [
  { id: "about", name: "about.md", ext: "md", kind: "doc", doc: "about", title: "About" },
  { id: "contact", name: "contact.sh", ext: "sh", kind: "doc", doc: "contact", title: "Contact" },
  { id: "credentials", name: "credentials.md", ext: "md", kind: "doc", doc: "credentials", title: "Credentials" },
  { id: "education", name: "education.md", ext: "md", kind: "doc", doc: "education", title: "Education" },
  { id: "hobbies", name: "hobbies.md", ext: "md", kind: "doc", doc: "hobbies", title: "Hobbies" },
  { id: "leadership", name: "leadership.md", ext: "md", kind: "doc", doc: "leadership", title: "Leadership" },
  { id: "now", name: "now.md", ext: "md", kind: "doc", doc: "now", title: "Now" },
  { id: "resume", name: "resume.pdf", ext: "pdf", kind: "pdf", title: "Resume" },
  { id: "stack", name: "stack.json", ext: "json", kind: "doc", doc: "stack", title: "Tech stack" },
  { id: "uses", name: "uses.md", ext: "md", kind: "doc", doc: "uses", title: "Uses" },
];

/* ----------------------------------------------------------------- tree   */

export const WORKSPACE_NAME = "vedant-daga";

/**
 * Folders before files, each group alphabetical — VS Code's default sort, and
 * what the reference screenshot shows.
 */
export const TREE = [
  {
    id: "projects",
    name: "projects",
    kind: "folder",
    children: PROJECT_FILES,
  },
  ...DOC_FILES,
];

/** Flat id -> file lookup, including files nested in folders. */
export const FILES = (() => {
  const out = new Map();
  const walk = (nodes) => {
    for (const n of nodes) {
      if (n.kind === "folder") walk(n.children);
      else out.set(n.id, n);
    }
  };
  walk(TREE);
  return out;
})();

export const getFile = (id) => FILES.get(id) || null;

/** Every openable file, flattened — the Ctrl+P corpus. */
export const ALL_FILES = [...FILES.values()];

/** Repo metadata for a repo-kind file. */
export const repoFor = (file) =>
  file?.kind === "repo" ? repoData.repos[file.repo] ?? null : null;

/** Breadcrumb segments for the open file, as VS Code renders them. */
export const breadcrumbFor = (file) => {
  if (!file) return [];
  const segs = [WORKSPACE_NAME];
  if (file.parent) segs.push(file.parent);
  segs.push(file.name);
  return segs;
};

export const PROFILE_CONTRIBUTIONS = repoData.profileContributions ?? {
  total: 0,
  days: {},
  source: "none",
};

export const REPO_DATA = repoData;
export const GITHUB_OWNER = repoData.owner ?? "DagaVedant";

/**
 * Per-repo chunk (README html + per-file source). Vite turns this glob into
 * separate chunks, so opening one repo does not pull the other ten.
 */
const CHUNKS = import.meta.glob("@/data/repos/*.json");

export async function loadRepoChunk(repoName) {
  const key = Object.keys(CHUNKS).find((k) => k.endsWith(`/${repoName}.json`));
  if (!key) return null;
  const mod = await CHUNKS[key]();
  return mod.default ?? mod;
}
