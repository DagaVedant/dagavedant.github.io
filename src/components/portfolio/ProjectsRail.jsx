import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { RevealSection } from "./Layout";
import { useMotion } from "@/hooks/useMotion";
import { projects } from "@/data/portfolio-data";

/* =========================================================================
   Projects rail — ALWAYS horizontal.

   Two modes, both horizontal. There is no vertical grid fallback in any
   condition:

     "pinned"  desktop + motion on. The section pins under the IDE chrome and
               window scroll drives a translateX on the rail.
     "swipe"   under 768px, OR motion off. A native horizontal overflow rail
               with x-mandatory scroll snapping.

   ---- the pin math (verified) ----
   The sticky element has top = T (var(--ide-top)) and its own height S.
   The outer section has height H. A sticky child pins while

       T >= outer.top >= T - (H - S)

   so the scroll distance spent pinned is exactly H - S. Setting

       H = S + travel                     (S read from the DOM, not recomputed)

   makes that distance equal `travel`, and

       progress = (T - outer.top) / travel

   is therefore 0 at the instant the section pins (first card flush left,
   translateX 0) and exactly 1 at the instant it unpins (translateX -travel,
   last card flush right). Both ends land on the frame the pin changes state,
   so nothing jumps.
   ========================================================================= */

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** "~/projects/pulseflow-ai" — repo name when we have one, else the title. */
const filePath = (project) => {
  const repo = project.github
    ? project.github.split("/").filter(Boolean).pop()
    : null;
  return `~/projects/${slugify(repo || project.title)}`;
};

const railProjects = [...projects]
  .sort((a, b) => (b.inProgress ? 1 : 0) - (a.inProgress ? 1 : 0))
  .map((project) => ({ ...project, path: filePath(project) }));

const TOTAL = railProjects.length;
const EDGE_PAD = 24;
const GUTTER = "clamp(20px, 5vw, 40px)";

const clamp = (n, min, max) => (n < min ? min : n > max ? max : n);
const pad2 = (n) => String(n).padStart(2, "0");

/* ------------------------------------------------------- viewport width --- */

const MOBILE_QUERY = "(max-width: 767px)";

const mobileMedia =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(MOBILE_QUERY)
    : null;

function subscribeMobile(onChange) {
  // `resize` as well as the media query: the snapshot is a boolean, so
  // useSyncExternalStore only re-renders when the breakpoint actually flips,
  // and the extra listener covers environments that resize the viewport
  // without dispatching a MediaQueryList change event.
  window.addEventListener("resize", onChange, { passive: true });
  if (mobileMedia) mobileMedia.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("resize", onChange);
    if (mobileMedia) mobileMedia.removeEventListener("change", onChange);
  };
}

const readMobile = () => (mobileMedia ? mobileMedia.matches : false);

/** true under 768px. Re-renders on breakpoint crossings. */
function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, readMobile, () => false);
}

/* ---------------------------------------------------------------- card --- */

function ProjectCard({ project, index, variant, onCardFocus }) {
  const isLink = Boolean(project.github);
  const Tag = isLink ? "a" : "div";

  const sizing =
    variant === "rail"
      ? "w-[86vw] max-w-[420px] md:w-[400px] lg:w-[420px] flex-none self-stretch"
      : "w-[80vw] max-w-[340px] sm:w-[340px] md:w-[380px] lg:w-[400px] flex-none snap-start self-stretch";

  const linkProps = isLink
    ? { href: project.github, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Tag
      {...linkProps}
      data-card-index={index}
      onFocus={onCardFocus ? () => onCardFocus(index) : undefined}
      className={`card ${isLink ? "card-i" : ""} ${sizing} flex flex-col overflow-hidden no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      <div className="w-full aspect-[16/10] max-h-[38%] flex-none overflow-hidden border-b border-border bg-muted">
        {project.image ? (
          <img
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-5">
        <p className="t-mono term-path truncate text-[11px]">{project.path}</p>

        <div className="flex items-start justify-between gap-3">
          <h3 className="t-h3 text-balance">{project.title}</h3>
          {isLink ? (
            <ArrowUpRight
              className="mt-1 h-4 w-4 flex-none text-muted-foreground"
              aria-hidden="true"
            />
          ) : null}
        </div>

        {project.inProgress ? (
          <span className="t-mono w-fit rounded-sm border border-border bg-secondary px-2 py-[3px] text-[11px] text-muted-foreground">
            In progress
          </span>
        ) : null}

        <p className="t-small overflow-hidden">{project.description}</p>

        <div className="mt-auto flex flex-col gap-3 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {project.tags?.map((tag) => (
              <span
                key={tag}
                className="t-mono rounded-sm border border-border px-2 py-[3px] text-[11px] leading-none"
              >
                {tag}
              </span>
            ))}
          </div>

          {isLink ? (
            <div className="flex items-center gap-2 border-t border-border pt-3">
              <Github
                className="h-4 w-4 flex-none text-muted-foreground"
                aria-hidden="true"
              />
              <span className="t-mono text-[11px]">View on GitHub</span>
            </div>
          ) : null}
        </div>
      </div>
    </Tag>
  );
}

/* --------------------------------------------------------------- header --- */

function SectionHead({ barRef, index }) {
  return (
    <div className="shell">
      <h2 className="t-h2 text-balance">Projects</h2>
      <p className="t-lead mt-4 max-w-2xl text-balance">
        AI, education technology, and things that had to work in the real world.
      </p>

      <div className="mt-8 flex items-center gap-4">
        <div className="h-[2px] flex-1 bg-border" aria-hidden="true">
          <div
            ref={barRef}
            className="h-full w-full origin-left bg-primary"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
        <span className="t-mono flex-none tabular-nums" aria-live="off">
          {pad2(index + 1)} / {pad2(TOTAL)}
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- rail --- */

export default function ProjectsRail() {
  const animate = useMotion();
  const isMobile = useIsMobile();
  const mode = animate && !isMobile ? "pinned" : "swipe";

  const [index, setIndex] = useState(0);

  const outerRef = useRef(null);
  const stickyRef = useRef(null);
  const viewportRef = useRef(null);
  const railRef = useRef(null);
  const barRef = useRef(null);
  const swipeRef = useRef(null);

  const travelRef = useRef(0);
  const stickyTopRef = useRef(0);
  const offsetsRef = useRef([]);
  const indexRef = useRef(0);
  const modeRef = useRef(mode);

  modeRef.current = mode;

  /** Shared writer for the bar + counter, given 0..1. */
  const paint = useCallback((progress) => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${progress})`;
    }
    const next = clamp(Math.round(progress * (TOTAL - 1)), 0, TOTAL - 1);
    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
    }
  }, []);

  /* ==================================================== pinned mode ===== */

  /* --- one write per animation frame, driven by window scroll --- */
  const update = useCallback(() => {
    const outer = outerRef.current;
    const rail = railRef.current;
    if (!outer || !rail) return;

    const travel = travelRef.current;
    const stickyTop = stickyTopRef.current;

    // progress = (stickyTop - outer.top) / travel
    // 0 the frame the section pins, 1 the frame it unpins.
    const progress =
      travel > 0
        ? clamp(
            (stickyTop - outer.getBoundingClientRect().top) / travel,
            0,
            1
          )
        : 0;

    rail.style.transform = `translate3d(${-(progress * travel)}px, 0, 0)`;
    paint(travel > 0 ? progress : 1);
  }, [paint]);

  /* --- measure from the DOM: travel, the sticky's own height, its top --- */
  const measure = useCallback(() => {
    const outer = outerRef.current;
    const sticky = stickyRef.current;
    const rail = railRef.current;
    const viewport = viewportRef.current;
    if (!outer || !sticky || !rail || !viewport) return;

    // Resolved pixel value of the sticky element's computed `top`. Read every
    // measure so it survives the --ide-* vars changing across breakpoints.
    const resolvedTop = parseFloat(getComputedStyle(sticky).top);
    stickyTopRef.current = Number.isFinite(resolvedTop) ? resolvedTop : 0;

    const travel = Math.max(0, rail.scrollWidth - viewport.clientWidth);
    travelRef.current = travel;

    // H = S + travel, with S read from the DOM rather than recomputed from
    // the chrome vars. Setting H does not feed back into S (S is viewport
    // derived), so there is no measure loop. `border` compensates for
    // box-sizing: border-box + the 1px fold rule, so the padding box the
    // sticky actually travels inside is exactly S + travel.
    const border = outer.offsetHeight - outer.clientHeight;
    outer.style.height = `${sticky.offsetHeight + travel + border}px`;

    const railLeft = rail.getBoundingClientRect().left;
    offsetsRef.current = Array.from(rail.children).map((el) => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left - railLeft, width: rect.width };
    });

    update();
  }, [update]);

  /* --- pin lifecycle --- */
  useLayoutEffect(() => {
    const outer = outerRef.current;
    const rail = railRef.current;
    const viewport = viewportRef.current;

    if (mode !== "pinned") {
      travelRef.current = 0;
      return undefined;
    }
    if (!outer || !rail || !viewport) return undefined;

    rail.style.willChange = "transform";
    measure();

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    const onResize = () => measure();

    // Focusing an off-screen link makes the browser scroll the hidden
    // container sideways; undo it so the transform stays authoritative.
    const onViewportScroll = () => {
      if (viewport.scrollLeft !== 0) viewport.scrollLeft = 0;
      if (viewport.scrollTop !== 0) viewport.scrollTop = 0;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    viewport.addEventListener("scroll", onViewportScroll);

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (observer) observer.observe(rail);

    const images = Array.from(rail.querySelectorAll("img"));
    const pending = images.filter((img) => !img.complete);
    pending.forEach((img) => {
      img.addEventListener("load", onResize);
      img.addEventListener("error", onResize);
    });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      viewport.removeEventListener("scroll", onViewportScroll);
      if (observer) observer.disconnect();
      pending.forEach((img) => {
        img.removeEventListener("load", onResize);
        img.removeEventListener("error", onResize);
      });
      outer.style.height = "";
      rail.style.transform = "";
      rail.style.willChange = "";
    };
  }, [mode, measure, update]);

  /* --- keyboard: keep the focused card inside the rail viewport --- */
  const handleCardFocus = useCallback((i) => {
    if (modeRef.current !== "pinned") return;
    const outer = outerRef.current;
    const viewport = viewportRef.current;
    const travel = travelRef.current;
    const stickyTop = stickyTopRef.current;
    const off = offsetsRef.current[i];
    if (!outer || !viewport || !off || travel <= 0) return;

    const rectTop = outer.getBoundingClientRect().top;
    const currentX = clamp((stickyTop - rectTop) / travel, 0, 1) * travel;
    const vw = viewport.clientWidth;

    let desired = currentX;
    if (off.left < currentX + EDGE_PAD) {
      desired = off.left - EDGE_PAD;
    } else if (off.left + off.width > currentX + vw - EDGE_PAD) {
      desired = off.left + off.width - vw + EDGE_PAD;
    } else {
      return;
    }

    // We want outer.top === stickyTop - desired. outer's document offset is
    // scrollY + rectTop, so the target scroll is that minus (stickyTop - desired).
    const docTop = window.scrollY + rectTop;
    window.scrollTo({
      top: docTop - stickyTop + clamp(desired, 0, travel),
      behavior: "auto",
    });
  }, []);

  /* ===================================================== swipe mode ===== */

  useEffect(() => {
    if (mode !== "swipe") return undefined;
    const scroller = swipeRef.current;
    if (!scroller) return undefined;

    let frame = 0;
    const read = () => {
      const span = scroller.scrollWidth - scroller.clientWidth;
      paint(span > 0 ? clamp(scroller.scrollLeft / span, 0, 1) : 1);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        read();
      });
    };

    read();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(onScroll) : null;
    if (observer) observer.observe(scroller);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (observer) observer.disconnect();
    };
  }, [mode, paint]);

  /* ======================================================== render ====== */

  /*
    ONE <section id="projects"> for both modes, always in the same slot.

    The IDE chrome's IntersectionObserver resolves this element by id exactly
    once, on mount. Returning two different trees per mode made React unmount
    and remount the section on every breakpoint crossing / motion toggle,
    which left the observer holding a detached node — after which the
    projects.tsx tab and breadcrumb simply stopped lighting up. Same element
    type in the same position means React keeps the DOM node, so the observer
    keeps its target.
  */
  const swipe = mode === "swipe";

  return (
    <section
      id="projects"
      ref={outerRef}
      className={swipe ? "section section--major relative" : "relative"}
    >
      {/* §5d fold rules. Absolute so they add no height and cannot shift the
          sticky containing block — the pin math stays border-free and exact.
          In swipe mode `.section + .section` already draws the top rule. */}
      {swipe ? null : (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[hsl(var(--ide-line))]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[hsl(var(--ide-line))]"
            aria-hidden="true"
          />
        </>
      )}

      {swipe ? (
        <>
          <RevealSection>
            <SectionHead barRef={barRef} index={index} />
          </RevealSection>

          <div
            ref={swipeRef}
            className="mt-10 flex snap-x snap-mandatory items-stretch gap-5 overflow-x-auto overflow-y-hidden pb-5"
            style={{
              paddingInline: GUTTER,
              scrollPaddingInline: GUTTER,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {railProjects.map((project, i) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={i}
                variant="swipe"
              />
            ))}
          </div>
        </>
      ) : (
      <div
        ref={stickyRef}
        className="sticky flex flex-col overflow-hidden"
        style={{
          top: "var(--ide-top)",
          height: "calc(100vh - var(--ide-top) - var(--ide-bottom))",
        }}
      >
        <div className="flex-none pt-[clamp(28px,5vh,64px)]">
          <SectionHead barRef={barRef} index={index} />
        </div>

        <div ref={viewportRef} className="relative min-h-0 flex-1 overflow-hidden">
          <div
            ref={railRef}
            className="flex h-full w-max items-stretch gap-5 py-8"
            style={{ paddingInline: GUTTER }}
          >
            {railProjects.map((project, i) => (
              <ProjectCard
                key={project.title}
                project={project}
                index={i}
                variant="rail"
                onCardFocus={handleCardFocus}
              />
            ))}
          </div>
        </div>
      </div>
      )}
    </section>
  );
}
