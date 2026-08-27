import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMotion } from "@/hooks/useMotion";
import { personal, taglineParts } from "@/data/portfolio-data";

/* The hero is the README.md the editor opens on. Copy is verbatim from
   portfolio-data; the markdown chrome around it is the only new material. */

const tagline = taglineParts
  .map((part) => part.text)
  .join("")
  .trim();

const LOCATION = "Monroe Township, New Jersey";

/* Markdown front-matter — a real convention, so it belongs here rather than
   decorating. Values restate what the page already says. */
const frontMatter = [
  { key: "role", value: "AI/ML - Full-stack - IoT" },
  { key: "location", value: LOCATION },
  { key: "status", value: "building" },
];

const quietLink =
  "font-inter text-[13px] font-medium tracking-[0.01em] text-muted-foreground underline decoration-border decoration-1 underline-offset-4 transition-colors duration-150 hover:text-foreground hover:decoration-current";

export default function HeroSection() {
  const animate = useMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!animate) {
      setShown(true);
      return undefined;
    }
    const timer = setTimeout(() => setShown(true), 80);
    return () => clearTimeout(timer);
  }, [animate]);

  const scrollTo = (id) => (event) => {
    event.preventDefault();
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="section section--major relative">
      <div className="shell">
        <div
          className={cn(
            "max-w-3xl",
            animate && "reveal",
            animate && shown && "reveal-in"
          )}
        >
          {/* file header — this section IS a file */}
          <div className="t-mono flex items-center gap-2 text-muted-foreground">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>README.md</span>
          </div>

          <h1 className="t-display mt-6 text-foreground">
            {personal.firstName} {personal.lastName}
          </h1>

          <p className="t-lead mt-7 max-w-[46ch]">
            {tagline.endsWith(".") ? tagline : `${tagline}.`}
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a
              href="#projects"
              onClick={scrollTo("#projects")}
              className="inline-flex items-center rounded-[var(--radius)] bg-primary px-6 py-3 font-inter text-[15px] font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
            >
              See my projects
            </a>

            <a
              href={`${import.meta.env.BASE_URL}resume.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className={quietLink}
            >
              Resume
            </a>

            <a href="#contact" onClick={scrollTo("#contact")} className={quietLink}>
              Contact
            </a>
          </div>

          <p className="t-caption mt-10">{LOCATION}</p>

          {/* front-matter block */}
          <div className="t-mono mt-12 max-w-md border-l border-border pl-5">
            <p className="term-dim">---</p>
            <dl className="my-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {frontMatter.map(({ key, value }) => (
                <div key={key} className="contents">
                  <dt className="term-path">{key}:</dt>
                  <dd className="term-dim">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="term-dim">---</p>
          </div>
        </div>
      </div>
    </section>
  );
}
