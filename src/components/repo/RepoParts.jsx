import {
  Star,
  GitFork,
  Eye,
  Scale,
  Link2,
  BookOpen,
  Activity,
  Pin,
  Code2,
  ChevronDown,
  GitBranch,
  Tag,
  Search,
  Folder,
  File as FileGlyph,
  CircleDot,
  GitPullRequest,
  Play,
  LayoutGrid,
  BookMarked,
  ShieldCheck,
  LineChart,
  Settings,
  Bot,
  History,
  Check,
} from "lucide-react";

/**
 * The pieces of a GitHub repository page, matching the real Code tab.
 *
 * Everything here is styled with the --gh-* tokens rather than the editor's,
 * because this is a GitHub page being displayed inside an editor tab — the same
 * relationship VS Code's Simple Browser has with a real site.
 */

const LANG_COLORS = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "Jupyter Notebook": "#DA5B0B",
  Shell: "#89e051",
  C: "#555555",
  "C++": "#f34b7d",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Other: "#ededed",
};

export const langColor = (name) => LANG_COLORS[name] || "#8b949e";

/* ------------------------------------------------------------- repo tabs  */

const TABS = [
  { label: "Code", icon: Code2, active: true },
  { label: "Issues", icon: CircleDot },
  { label: "Pull requests", icon: GitPullRequest },
  { label: "Agents", icon: Bot },
  { label: "Actions", icon: Play },
  { label: "Projects", icon: LayoutGrid },
  { label: "Wiki", icon: BookMarked },
  { label: "Security", icon: ShieldCheck },
  { label: "Insights", icon: LineChart },
  { label: "Settings", icon: Settings },
];

/** Decorative — only Code is real, and it is the page you are already on. */
export function RepoTabs() {
  return (
    <nav
      aria-hidden="true"
      className="flex items-end gap-1 overflow-x-auto border-b border-gh-border px-2"
    >
      {TABS.map(({ label, icon: Icon, active }) => (
        <span
          key={label}
          className={`flex flex-none cursor-default items-center gap-2 border-b-2 px-3 pb-2 pt-1 text-[14px] ${
            active
              ? "border-[#f78166] font-semibold text-gh-fg"
              : "border-transparent text-gh-muted"
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.7} />
          {label}
        </span>
      ))}
    </nav>
  );
}

/* ----------------------------------------------------------------- header */

export function RepoHeader({ repo }) {
  return (
    <header className="flex flex-wrap items-center gap-3 px-4 pb-3 pt-4">
      <h1 className="flex min-w-0 items-center gap-2 text-[20px]">
        <BookMarked className="h-4 w-4 flex-none text-gh-muted" strokeWidth={1.8} />
        <a
          href={`https://github.com/${repo.owner}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gh-accent hover:underline"
        >
          {repo.owner}
        </a>
        <span className="text-gh-muted">/</span>
        {/* The repo name is the primary way out to GitHub. */}
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Open ${repo.repo} on GitHub`}
          className="truncate font-semibold text-gh-accent hover:underline"
        >
          {repo.repo}
        </a>
        <span className="flex-none rounded-full border border-gh-border px-[7px] py-[1px] text-[12px] font-normal text-gh-muted">
          Public
        </span>
      </h1>

      <div className="ml-auto flex flex-none items-center gap-2">
        <GhButton icon={Pin} label="Pin" />
        <GhButton icon={Eye} label="Watch" count={repo.watchers} caret />
        <GhButton icon={GitFork} label="Fork" count={repo.forks} caret />
        <GhButton icon={Star} label="Star" count={repo.stars} caret />
      </div>
    </header>
  );
}

/** GitHub's small button. Decorative — the real way out is the repo name. */
function GhButton({ icon: Icon, label, count, caret }) {
  return (
    <span
      aria-hidden="true"
      className="hidden cursor-default items-center rounded-[6px] border border-gh-btn-border bg-gh-btn text-[12px] text-gh-fg sm:flex"
    >
      <span className="flex items-center gap-1.5 px-3 py-[5px]">
        <Icon className="h-[14px] w-[14px]" strokeWidth={1.8} />
        {label}
        {count !== undefined ? (
          <span className="ml-1 rounded-full bg-gh-btn-hover px-[6px] text-[11px]">{count}</span>
        ) : null}
      </span>
      {caret ? (
        <span className="border-l border-gh-btn-border px-1 py-[5px]">
          <ChevronDown className="h-[14px] w-[14px]" strokeWidth={1.8} />
        </span>
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------- branch bar */

export function BranchBar({ repo }) {
  // Lite builds have no branch/tag counts; default before pluralising so the
  // label never reads "1Branches".
  const branches = repo.branchCount ?? 1;
  const tags = repo.tagCount ?? 0;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <span
        aria-hidden="true"
        className="flex cursor-default items-center gap-2 rounded-[6px] border border-gh-btn-border bg-gh-btn px-3 py-[5px] text-[13px] font-semibold text-gh-fg"
      >
        <GitBranch className="h-4 w-4" strokeWidth={1.8} />
        {repo.defaultBranch}
        <ChevronDown className="h-[14px] w-[14px] text-gh-muted" strokeWidth={1.8} />
      </span>

      <span aria-hidden="true" className="flex items-center gap-1.5 text-[13px] text-gh-muted">
        <GitBranch className="h-4 w-4" strokeWidth={1.8} />
        <span>
          <b className="font-semibold text-gh-fg">{branches}</b>{" "}
          {branches === 1 ? "Branch" : "Branches"}
        </span>
      </span>

      <span aria-hidden="true" className="flex items-center gap-1.5 text-[13px] text-gh-muted">
        <Tag className="h-4 w-4" strokeWidth={1.8} />
        <span>
          <b className="font-semibold text-gh-fg">{tags}</b>{" "}
          {tags === 1 ? "Tag" : "Tags"}
        </span>
      </span>

      <div className="ml-auto flex items-center gap-2">
        <span
          aria-hidden="true"
          className="hidden items-center gap-2 rounded-[6px] border border-gh-border bg-gh-canvas px-3 py-[5px] text-[13px] text-gh-muted md:flex"
        >
          <Search className="h-[14px] w-[14px]" strokeWidth={1.8} />
          Go to file
        </span>
        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-[6px] bg-gh-green px-3 py-[5px] text-[13px] font-semibold text-white transition-colors hover:bg-gh-green-hover"
        >
          <Code2 className="h-4 w-4" strokeWidth={2} />
          Code
          <ChevronDown className="h-[14px] w-[14px]" strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- file table */

export function FileTable({ repo, onOpenFile }) {
  const latest = repo.commits?.[0];

  return (
    <div className="mb-6 overflow-hidden rounded-[6px] border border-gh-border">
      {latest ? (
        <div className="flex items-center gap-2 bg-gh-subtle px-4 py-[10px] text-[13px]">
          {latest.avatar ? (
            <img src={latest.avatar} alt="" loading="lazy" className="h-5 w-5 rounded-full" />
          ) : null}
          <span className="font-semibold text-gh-fg">{latest.author}</span>
          <a
            href={latest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 truncate text-gh-muted hover:text-gh-accent hover:underline"
          >
            {latest.message}
          </a>
          <Check className="h-4 w-4 flex-none text-gh-success" strokeWidth={2.4} />
          <span className="ml-auto flex flex-none items-center gap-3 text-gh-muted">
            <span className="hidden font-mono text-[12px] sm:inline">{latest.sha}</span>
            <span className="hidden sm:inline">· {relativeTime(latest.date)}</span>
            <a
              href={`${repo.htmlUrl}/commits`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gh-accent"
            >
              <History className="h-4 w-4" strokeWidth={1.8} />
              <b className="font-semibold text-gh-fg">{repo.commitCount}</b>{" "}
              {repo.commitCount === 1 ? "Commit" : "Commits"}
            </a>
          </span>
        </div>
      ) : null}

      <ul>
        {repo.files.map((f) => {
          const clickable = f.type === "file" && f.hasSource && onOpenFile;
          return (
            <li
              key={f.name}
              className="flex items-center gap-3 border-t border-gh-border px-4 py-[7px] text-[14px] hover:bg-gh-subtle"
            >
              {f.type === "dir" ? (
                <Folder className="h-4 w-4 flex-none text-[#54aeff]" fill="#54aeff" strokeWidth={0} />
              ) : (
                <FileGlyph className="h-4 w-4 flex-none text-gh-muted" strokeWidth={1.7} />
              )}

              {clickable ? (
                <button
                  type="button"
                  onClick={() => onOpenFile(f.name)}
                  className="min-w-0 flex-none truncate text-gh-fg hover:text-gh-accent hover:underline"
                >
                  {f.name}
                </button>
              ) : (
                <a
                  href={`${repo.htmlUrl}/tree/${repo.defaultBranch}/${f.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-none truncate text-gh-fg hover:text-gh-accent hover:underline"
                >
                  {f.name}
                </a>
              )}

              {f.lastCommit ? (
                <a
                  href={`${repo.htmlUrl}/commit/${f.lastCommit.sha}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-6 min-w-0 flex-1 truncate text-[13px] text-gh-muted hover:text-gh-accent hover:underline"
                >
                  {f.lastCommit.message}
                </a>
              ) : (
                <span className="ml-6 min-w-0 flex-1" />
              )}

              <span className="flex-none text-[13px] text-gh-muted">
                {f.lastCommit ? relativeTime(f.lastCommit.date) : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------- side panel */

export function AboutPanel({ repo }) {
  return (
    <aside className="flex flex-col gap-6 text-[14px]">
      <section>
        <h2 className="mb-3 font-semibold text-gh-fg">About</h2>

        {repo.description ? (
          <p className="mb-3 leading-[1.5] text-gh-fg/90">{repo.description}</p>
        ) : (
          <p className="mb-3 italic text-gh-muted">No description provided.</p>
        )}

        {repo.homepage ? (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex items-center gap-2 font-semibold text-gh-accent hover:underline"
          >
            <Link2 className="h-4 w-4 flex-none" strokeWidth={1.8} />
            <span className="truncate">{repo.homepage.replace(/^https?:\/\//, "")}</span>
          </a>
        ) : null}

        {repo.topics?.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {repo.topics.map((t) => (
              <a
                key={t}
                href={`https://github.com/topics/${t}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#121d2f] px-[10px] py-[2px] text-[12px] text-gh-accent hover:bg-gh-accent hover:text-white"
              >
                {t}
              </a>
            ))}
          </div>
        ) : null}

        <ul className="flex flex-col gap-2 text-gh-muted">
          <SideLink icon={BookOpen} href={`${repo.htmlUrl}#readme`} label="Readme" />
          {repo.license ? (
            <SideLink icon={Scale} href={`${repo.htmlUrl}#license`} label={`${repo.license} license`} />
          ) : null}
          <SideLink icon={Activity} href={`${repo.htmlUrl}/activity`} label="Activity" />
          <SideLink
            icon={Star}
            href={`${repo.htmlUrl}/stargazers`}
            label={`${repo.stars} star${repo.stars === 1 ? "" : "s"}`}
          />
          <SideLink
            icon={Eye}
            href={`${repo.htmlUrl}/watchers`}
            label={`${repo.watchers} watching`}
          />
          <SideLink
            icon={GitFork}
            href={`${repo.htmlUrl}/forks`}
            label={`${repo.forks} fork${repo.forks === 1 ? "" : "s"}`}
          />
        </ul>
      </section>

      <section className="border-t border-gh-border pt-5">
        <h2 className="mb-2 font-semibold text-gh-fg">Releases</h2>
        <p className="text-gh-muted">No releases published</p>
      </section>

      <section className="border-t border-gh-border pt-5">
        <h2 className="mb-2 font-semibold text-gh-fg">Packages</h2>
        <p className="text-gh-muted">No packages published</p>
      </section>

      {repo.contributors?.length ? (
        <section className="border-t border-gh-border pt-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-gh-fg">
            Contributors
            <span className="rounded-full bg-gh-btn px-[7px] text-[12px] font-normal text-gh-fg">
              {repo.contributors.length}
            </span>
          </h2>
          <ul className="flex flex-col gap-2">
            {repo.contributors.map((c) => (
              <li key={c.login}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                >
                  <img src={c.avatar} alt="" loading="lazy" className="h-8 w-8 rounded-full" />
                  <span className="font-semibold text-gh-fg">{c.login}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {repo.languageBar?.length ? (
        <section className="border-t border-gh-border pt-5">
          <h2 className="mb-3 font-semibold text-gh-fg">Languages</h2>
          <div className="mb-3 flex h-[10px] w-full overflow-hidden rounded-full">
            {repo.languageBar.map((l) => (
              <span
                key={l.name}
                title={`${l.name} ${l.percent}%`}
                style={{ width: `${l.percent}%`, backgroundColor: langColor(l.name) }}
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {repo.languageBar.map((l) => (
              <li key={l.name} className="flex items-center gap-[6px] text-[12px]">
                <span
                  aria-hidden="true"
                  className="block h-[10px] w-[10px] flex-none rounded-full"
                  style={{ backgroundColor: langColor(l.name) }}
                />
                <span className="font-semibold text-gh-fg">{l.name}</span>
                <span className="text-gh-muted">{l.percent}%</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}

function SideLink({ icon: Icon, href, label }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-gh-accent"
      >
        <Icon className="h-4 w-4 flex-none" strokeWidth={1.8} />
        <span className="truncate">{label}</span>
      </a>
    </li>
  );
}

/* ------------------------------------------------------------------ utils */

export function relativeTime(iso) {
  if (!iso) return "";
  const secs = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));

  // GitHub's own phrasing. Note the asymmetry: a single day is "yesterday",
  // but a single week/month/year is "last week/month/year" — "last day" is
  // not something GitHub ever prints.
  const units = [
    ["year", 31536000, "last year"],
    ["month", 2592000, "last month"],
    ["week", 604800, "last week"],
    ["day", 86400, "yesterday"],
    ["hour", 3600, "1 hour ago"],
    ["minute", 60, "1 minute ago"],
  ];

  for (const [name, size, singular] of units) {
    const n = Math.floor(secs / size);
    if (n >= 1) return n === 1 ? singular : `${n} ${name}s ago`;
  }
  return "just now";
}

export function formatBytes(n) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
