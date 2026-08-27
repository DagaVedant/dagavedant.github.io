import { FolderOpen, FileText, Download, Terminal, ArrowRight } from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { PROFILE_CONTRIBUTIONS, PROJECT_FILES, GITHUB_OWNER, REPO_DATA } from "@/lib/files";
import { personal, taglineParts } from "@/data/portfolio-data";
import { relativeTime } from "@/components/repo/RepoParts";
import ContributionGraph from "@/components/repo/ContributionGraph";
import FileIcon from "./FileIcon";

/**
 * The Get Started page, which is what every visitor lands on.
 *
 * VS Code's own layout — product name where the title goes, Start and Recent in
 * two columns, keyboard hints at the foot — carrying portfolio content. The
 * contribution graph sits where the walkthrough cards would, because it is the
 * one thing on this screen that is evidence rather than navigation.
 *
 * Since the default view is a menu rather than content (spec 2), the hint line
 * telling people the Explorer is clickable is load-bearing, not decoration.
 */

const START_ITEMS = [
  { id: "about", icon: FileText, label: "Read about me", sub: "about.md" },
  { id: "projects", icon: FolderOpen, label: "Browse projects", sub: `${PROJECT_FILES.length} repositories` },
  { id: "resume", icon: Download, label: "Open resume", sub: "resume.pdf" },
  { id: "contact", icon: Terminal, label: "Get in touch", sub: "contact.sh" },
];

export default function Welcome() {
  const { open } = useWorkspace();

  const tagline = taglineParts.map((p) => p.text).join("");

  // Newest first — the same ordering the tree uses, so Recent matches it.
  const recent = PROJECT_FILES.slice(0, 6).map((f) => ({
    file: f,
    repo: REPO_DATA.repos[f.repo],
  }));

  return (
    <div className="mx-auto w-full max-w-[1000px] px-10 py-12">
      <header className="mb-12">
        <h1 className="t-display mb-3">
          {personal.firstName} {personal.lastName}
        </h1>
        <p className="t-lead max-w-[60ch]">{tagline}</p>
      </header>

      <div className="mb-14 grid gap-12 md:grid-cols-2">
        <section aria-labelledby="welcome-start">
          <h2 id="welcome-start" className="t-chrome mb-4 text-vs-descr">
            Start
          </h2>
          <ul className="flex flex-col gap-[2px]">
            {START_ITEMS.map(({ id, icon: Icon, label, sub }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => open(id === "projects" ? PROJECT_FILES[0].id : id)}
                  className="group flex w-full items-center gap-3 rounded-[4px] px-2 py-[7px] text-left hover:bg-vs-list-hover focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-vs-accent"
                >
                  <Icon className="h-4 w-4 flex-none text-vs-accent" strokeWidth={1.7} />
                  <span className="text-[13.5px] text-vs-accent">{label}</span>
                  <span className="ml-auto text-[12px] text-vs-descr">{sub}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 flex-none text-vs-descr opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="welcome-recent">
          <h2 id="welcome-recent" className="t-chrome mb-4 text-vs-descr">
            Recent
          </h2>
          <ul className="flex flex-col gap-[2px]">
            {recent.map(({ file, repo }) => (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => open(file.id)}
                  className="flex w-full items-center gap-3 rounded-[4px] px-2 py-[7px] text-left hover:bg-vs-list-hover focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-vs-accent"
                >
                  <FileIcon ext={file.ext} className="h-4 w-4 flex-none" />
                  <span className="truncate text-[13.5px] text-vs-accent">{repo.repo}</span>
                  <span className="ml-auto flex-none text-[12px] text-vs-descr">
                    {relativeTime(repo.pushedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="welcome-activity" className="mb-12">
        <h2 id="welcome-activity" className="t-chrome mb-4 text-vs-descr">
          Activity
        </h2>
        <div className="rounded-[6px] border border-vs-border px-5 py-4">
          <ContributionGraph
            days={PROFILE_CONTRIBUTIONS.days}
            total={PROFILE_CONTRIBUTIONS.total}
            source={PROFILE_CONTRIBUTIONS.source}
          />
        </div>
        <a
          href={`https://github.com/${GITHUB_OWNER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-[12.5px] text-vs-accent hover:underline"
        >
          github.com/{GITHUB_OWNER} →
        </a>
      </section>

      <footer className="border-t border-vs-border pt-5 text-[12.5px] text-vs-descr">
        <p>
          Everything here is a file. Open one from the{" "}
          <span className="text-vs-text">Explorer</span> on the left, or press{" "}
          <Kbd>Ctrl</Kbd> <Kbd>P</Kbd> to search by name.
        </p>
      </footer>
    </div>
  );
}

function Kbd({ children }) {
  return (
    <kbd className="rounded-[3px] border border-vs-border bg-vs-contrast px-[5px] py-[1px] font-mono text-[11px] text-vs-text">
      {children}
    </kbd>
  );
}
