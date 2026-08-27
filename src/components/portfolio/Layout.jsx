import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useMotion } from "@/hooks/useMotion";
import { personal, contactLinks } from "@/data/portfolio-data";

/*
  The Navbar is GONE. The IDE tab strip in IDEChrome.jsx replaces it —
  do not reintroduce a nav bar here.
*/

/** The global :focus-visible rule sits 2px outside; pull it inside the chrome. */
const chromeFocus = "focus-visible:[outline-offset:-2px]";

/* ------------------------------------------------------------------ */
/* ScrollProgress — a 2px accent bar tucked under the title bar        */
/* ------------------------------------------------------------------ */

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[45] h-[2px]"
      style={{ top: "var(--ide-titlebar)", left: "var(--ide-left)", right: 0 }}
      aria-hidden="true"
    >
      <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SocialRail                                                          */
/*                                                                     */
/* Folded into the activity bar's lower section — IDEChrome renders    */
/* this, so it is laid out in flow (a plain icon column), NOT fixed.   */
/* Do not also render it at the page level.                            */
/* ------------------------------------------------------------------ */

export function SocialRail() {
  return (
    <ul className="flex flex-col items-center">
      {contactLinks.map(({ icon: Icon, label, href }) => (
        <li key={label}>
          <a
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={cn(
              "flex h-10 w-10 items-center justify-center text-[hsl(var(--ide-gutter))] transition-colors duration-150 hover:text-foreground",
              chromeFocus
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Footer — a quiet mono line inside the content region                */
/* ------------------------------------------------------------------ */

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--ide-line))]">
      <div className="shell flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[11.5px] text-muted-foreground">
          {"// "}© {new Date().getFullYear()} {personal.firstName}{" "}
          {personal.lastName} — built in the editor
        </span>

        <div className="flex items-center gap-5">
          {/* Reachable on small screens, where the activity bar is gone. */}
          <ul className="flex items-center gap-4 md:hidden">
            {contactLinks.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    "block text-muted-foreground transition-colors duration-150 hover:text-foreground",
                    chromeFocus
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0 })}
            className={cn(
              "font-mono text-[11.5px] text-muted-foreground transition-colors duration-150 hover:text-foreground",
              chromeFocus
            )}
          >
            back to top
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* RevealSection — opacity + 14px rise, 500ms, once (§4)               */
/* ------------------------------------------------------------------ */

export function RevealSection({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  ...rest
}) {
  const animate = useMotion();
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!animate) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.unobserve(entry.target);
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  if (!animate) {
    return (
      <Tag ref={ref} className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={cn("reveal", shown && "reveal-in", className)}
      style={{ transitionDelay: shown ? `${delay}ms` : "0ms" }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
