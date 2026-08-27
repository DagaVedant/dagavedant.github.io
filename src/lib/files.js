import repoData from "@/data/repos.generated.json";
import { projects as curatedProjects } from "@/data/portfolio-data";

const IN_PROGRESS = new Set(
  curatedProjects
    .filter((p) => p.inProgress)
    .map((p) => p.github.split("/").pop().replace(/\.git$/, ""))
);

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

export const languageLabel = (file) => {
  if (!file) return "Plain Text";
  if (file.kind === "repo") return metaForExt(file.ext).label;
  return metaForExt(file.ext).label;
};

const kebab = (s) =>
  s
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

const repoEntries = Object.values(repoData.repos ?? {});

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

const DOC_FILES = {
  about: { id: "about", name: "about.md", ext: "md", kind: "doc", doc: "about", title: "About" },
  now: { id: "now", name: "now.md", ext: "md", kind: "doc", doc: "now", title: "Now" },
  stack: { id: "stack", name: "stack.json", ext: "json", kind: "doc", doc: "stack", title: "Tech stack" },
  uses: { id: "uses", name: "uses.md", ext: "md", kind: "doc", doc: "uses", title: "Uses" },
  education: { id: "education", name: "education.md", ext: "md", kind: "doc", doc: "education", title: "Education" },
  leadership: { id: "leadership", name: "leadership.md", ext: "md", kind: "doc", doc: "leadership", title: "Leadership" },
  credentials: { id: "credentials", name: "credentials.md", ext: "md", kind: "doc", doc: "credentials", title: "Credentials" },
  hobbies: { id: "hobbies", name: "hobbies.md", ext: "md", kind: "doc", doc: "hobbies", title: "Hobbies" },
  resume: { id: "resume", name: "resume.pdf", ext: "pdf", kind: "pdf", title: "Resume" },
  contact: { id: "contact", name: "contact.sh", ext: "sh", kind: "doc", doc: "contact", title: "Contact" },
};

const PROJECTS_FOLDER = {
  id: "projects",
  name: "projects",
  kind: "folder",
  children: PROJECT_FILES,
};

export const WORKSPACE_NAME = "vedant-daga";

export const TREE = [
  DOC_FILES.about,
  DOC_FILES.now,
  PROJECTS_FOLDER,
  DOC_FILES.stack,
  DOC_FILES.uses,
  DOC_FILES.education,
  DOC_FILES.leadership,
  DOC_FILES.credentials,
  DOC_FILES.hobbies,
  DOC_FILES.resume,
  DOC_FILES.contact,
];

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

export const ALL_FILES = [...FILES.values()];

export const repoFor = (file) =>
  file?.kind === "repo" ? repoData.repos[file.repo] ?? null : null;

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

const CHUNKS = import.meta.glob("@/data/repos/*.json");

export async function loadRepoChunk(repoName) {
  const key = Object.keys(CHUNKS).find((k) => k.endsWith(`/${repoName}.json`));
  if (!key) return null;
  const mod = await CHUNKS[key]();
  return mod.default ?? mod;
}
