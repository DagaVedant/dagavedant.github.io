import {
  Files,
  Search,
  GitBranch,
  Bug,
  Blocks,
  FlaskConical,
  Bot,
  Settings,
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace";
import { contactLinks } from "@/data/portfolio-data";

/**
 * The 48px rail. Explorer and Search are real; the rest are chrome.
 *
 * Inert icons render as aria-hidden spans, not disabled buttons — they are
 * scenery, and putting eight dead buttons in the tab order would make keyboard
 * navigation worse to gain nothing.
 *
 * The social links live at the bottom, where VS Code puts the account badge.
 * That is the one place in the rail where a real control is expected, so the
 * portfolio's outbound links inherit an affordance instead of inventing one.
 */
const INERT = [
  { icon: GitBranch, label: "Source Control" },
  { icon: Bug, label: "Run and Debug" },
  { icon: Blocks, label: "Extensions" },
  { icon: FlaskConical, label: "Testing" },
  { icon: Bot, label: "Copilot" },
];

export default function ActivityBar() {
  const { setPaletteOpen } = useWorkspace();

  return (
    <nav
      aria-label="Activity Bar"
      className="flex h-full flex-col items-center justify-between border-r border-vs-border bg-vs-chrome py-1"
    >
      <div className="flex flex-col items-center">
        {/* Explorer — always the active view. */}
        <span
          className="relative flex h-12 w-12 items-center justify-center text-vs-text"
          title="Explorer"
        >
          <span className="absolute left-0 top-0 h-full w-[2px] bg-vs-text" aria-hidden="true" />
          <Files className="h-6 w-6" strokeWidth={1.3} />
        </span>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          title="Go to File (Ctrl+P)"
          aria-label="Go to File"
          className="flex h-12 w-12 items-center justify-center text-vs-descr transition-colors hover:text-vs-text focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-vs-accent"
        >
          <Search className="h-6 w-6" strokeWidth={1.3} />
        </button>

        {INERT.map(({ icon: Icon, label }) => (
          <span
            key={label}
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center text-vs-descr/45"
          >
            <Icon className="h-6 w-6" strokeWidth={1.3} />
          </span>
        ))}
      </div>

      <div className="flex flex-col items-center">
        {contactLinks.slice(0, 3).map(({ icon: Icon, label, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            title={label}
            aria-label={label}
            className="flex h-11 w-12 items-center justify-center text-vs-descr transition-colors hover:text-vs-text focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-vs-accent"
          >
            <Icon className="h-[19px] w-[19px]" strokeWidth={1.4} />
          </a>
        ))}
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center text-vs-descr/45"
        >
          <Settings className="h-6 w-6" strokeWidth={1.3} />
        </span>
      </div>
    </nav>
  );
}
