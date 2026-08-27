import { useEffect, useRef } from "react";

import { useMotion } from "@/hooks/useMotion";

/**
 * AmbientField
 *
 * The site's one signature interactive element: a spectrogram-shaped field,
 * chosen because Vedant's research is spectrogram-based audio ML.
 *
 * A row of thin vertical bars is anchored to the bottom of the canvas. Their
 * amplitudes are a 1-D wave simulation: pointer movement injects energy scaled
 * by pointer VELOCITY, the wave equation propagates that energy outward as a
 * travelling ripple, and damping settles everything back to a slow idle drift
 * driven by summed incommensurate sines (never Math.random, which flickers).
 *
 * Two variants, one engine:
 *   "backdrop" — fixed behind the editor content (§5c). Texture, not subject.
 *   "plot"     — absolute, fills its parent; the serial monitor's trace plot.
 *                A foreground instrument: bright, crisp, and self-driving, so
 *                it reads as a live signal even with the pointer parked.
 *
 * Pointer energy is injected globally for BOTH variants — a cursor sweep
 * anywhere on the page disturbs the backdrop and the panel plot together.
 */

/* ---- per-variant tuning -------------------------------------------------- */

const VARIANTS = {
  backdrop: {
    barPitch: 4,
    barWidth: 2.4,
    maxHeightRatio: 0.34,
    idleAmp: 0.085,
    idleRate: 1,
    velocityGain: 0.62,
    injectFloor: 0.03,
    accentThreshold: 0.34,
    accentSpan: 0.4,
    neutralAlphas: [0.16, 0.22, 0.28, 0.34],
    accentAlphas: [0.4, 0.55, 0.7],
  },
  plot: {
    barPitch: 5,
    barWidth: 2.6,
    maxHeightRatio: 0.8,
    // A live instrument: the idle trace has to move on its own, visibly.
    idleAmp: 0.34,
    idleRate: 2.1,
    velocityGain: 0.95,
    injectFloor: 0.05,
    accentThreshold: 0.52,
    accentSpan: 0.34,
    neutralAlphas: [0.45, 0.55, 0.65, 0.75],
    accentAlphas: [0.85, 0.93, 1],
  },
};

/* ---- shared simulation constants ---------------------------------------- */

const STEP_MS = 1000 / 60; // fixed simulation timestep
const MAX_STEPS_PER_FRAME = 3; // catch-up cap after a stall

const TENSION = 0.032; // wave stiffness -> lateral propagation speed
const VELOCITY_DAMPING = 0.962; // per-step velocity bleed
const RETURN_TO_BASE = 0.009; // spring pull back toward the idle baseline
const DIFFUSION = 0.14; // extra neighbour smoothing, keeps the ripple soft

const INJECT_RADIUS = 26; // bars either side of the cursor that receive energy
const INJECT_CEILING = 1.2; // clamp so a flick can't blow up the sim
const MAX_AMPLITUDE = 1.5;
const VALUE_CEILING = 1.4;

const RESIZE_DEBOUNCE_MS = 150;

/* ---- helpers ------------------------------------------------------------- */

function readTriplet(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return raw || fallback;
}

/** Summed sines with incommensurate frequencies: smooth, non-repeating, cheap. */
function idleBaseline(index, time, idleAmp, rate) {
  const t = time * rate;
  const n =
    0.55 * Math.sin(index * 0.052 + t * 0.00045) +
    0.3 * Math.sin(index * 0.0191 - t * 0.00031) +
    0.15 * Math.sin(index * 0.0075 + t * 0.00062);
  return idleAmp * (0.6 + 0.4 * n);
}

export default function AmbientField({ variant = "backdrop" }) {
  const canvasRef = useRef(null);
  const animate = useMotion();

  // Every piece of loop state lives in refs so the rAF loop is created exactly
  // once and never re-subscribes on render.
  const ampRef = useRef(new Float32Array(0));
  const velRef = useRef(new Float32Array(0));
  const sizeRef = useRef({ width: 0, height: 0, bars: 0 });
  const colorsRef = useRef({ primary: "217 100% 65%", neutral: "215 12% 58%" });
  const pointerRef = useRef({ x: 0, y: 0, time: 0, seen: false });
  const frameRef = useRef(0);
  const clockRef = useRef({ last: 0, accumulator: 0, elapsed: 0 });

  const isPlot = variant === "plot";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const tune = VARIANTS[variant] || VARIANTS.backdrop;
    const {
      barPitch,
      barWidth,
      maxHeightRatio,
      idleAmp,
      idleRate,
      velocityGain,
      injectFloor,
      accentThreshold,
      accentSpan,
      neutralAlphas,
      accentAlphas,
    } = tune;

    /* -- theme -------------------------------------------------------------
       Single dark palette: read the two tokens once, and refresh cheaply on
       resize. No MutationObserver — there is no theme to swap to. */

    const syncColors = () => {
      colorsRef.current = {
        primary: readTriplet("--primary", "217 100% 65%"),
        neutral: readTriplet("--muted-foreground", "215 12% 58%"),
      };
    };
    syncColors();

    /* -- sizing ------------------------------------------------------------
       Both variants size from their OWN client box. The backdrop is fixed to
       the viewport, so that box is the viewport; the plot fills whatever the
       panel gives it, which can be as short as ~150px. */

    const resize = () => {
      const node = canvasRef.current;
      if (!node) return;

      const width = node.clientWidth || (isPlot ? 0 : window.innerWidth);
      const height = node.clientHeight || (isPlot ? 0 : window.innerHeight);
      // A plot whose parent has not been laid out yet: bail, the
      // ResizeObserver fires again once it has a box.
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      node.width = Math.round(width * dpr);
      node.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const bars = Math.max(8, Math.ceil(width / barPitch) + 1);
      const prevAmp = ampRef.current;
      const prevVel = velRef.current;
      const nextAmp = new Float32Array(bars);
      const nextVel = new Float32Array(bars);

      // Resample the existing wave so a resize does not wipe the field.
      if (prevAmp.length > 1) {
        for (let i = 0; i < bars; i += 1) {
          const source = Math.round((i / (bars - 1)) * (prevAmp.length - 1));
          nextAmp[i] = prevAmp[source];
          nextVel[i] = prevVel[source];
        }
      }

      ampRef.current = nextAmp;
      velRef.current = nextVel;
      sizeRef.current = { width, height, bars };
      syncColors();
    };

    let resizeTimer = 0;
    const scheduleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (!animate) draw();
      }, RESIZE_DEBOUNCE_MS);
    };

    resize();

    let resizeObserver = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleResize);
      resizeObserver.observe(canvas);
    }
    window.addEventListener("resize", scheduleResize);

    /* -- simulation -------------------------------------------------------- */

    const inject = (fraction, strength) => {
      const { bars } = sizeRef.current;
      const vel = velRef.current;
      if (!bars) return;

      const center = Math.round(
        Math.min(Math.max(fraction, 0), 1) * (bars - 1)
      );
      const from = Math.max(0, center - INJECT_RADIUS);
      const to = Math.min(bars - 1, center + INJECT_RADIUS);

      for (let i = from; i <= to; i += 1) {
        const distance = (i - center) / INJECT_RADIUS;
        const falloff = Math.exp(-distance * distance * 2.4);
        vel[i] += strength * falloff * 0.9;
      }
    };

    const onPointerMove = (event) => {
      const pointer = pointerRef.current;
      const now = event.timeStamp || performance.now();

      if (!pointer.seen) {
        pointerRef.current = {
          x: event.clientX,
          y: event.clientY,
          time: now,
          seen: true,
        };
        return;
      }

      const dt = Math.max(now - pointer.time, 8);
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const speed = Math.hypot(dx, dy) / dt; // px per ms

      pointerRef.current = {
        x: event.clientX,
        y: event.clientY,
        time: now,
        seen: true,
      };

      const strength = Math.min(
        speed * velocityGain + injectFloor,
        INJECT_CEILING
      );

      // The backdrop maps the cursor onto its OWN box, so the ripple breaks
      // directly under the pointer rather than ~22% to its left (the canvas
      // starts at --ide-left, not at 0). The plot stays viewport-relative on
      // purpose: it is a narrow strip, and a sweep anywhere on the page
      // should still travel across it left-to-right.
      const node = canvasRef.current;
      let fraction;
      if (isPlot || !node) {
        fraction = event.clientX / (window.innerWidth || 1);
      } else {
        const rect = node.getBoundingClientRect();
        fraction = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
      }
      inject(fraction, strength);
    };

    const step = (elapsed) => {
      const { bars } = sizeRef.current;
      const amp = ampRef.current;
      const vel = velRef.current;
      if (bars < 3) return;

      const last = bars - 1;
      for (let i = 0; i < bars; i += 1) {
        const left = amp[i === 0 ? 1 : i - 1];
        const right = amp[i === last ? last - 1 : i + 1];
        const base = idleBaseline(i, elapsed, idleAmp, idleRate);

        // Wave equation term propagates energy sideways; the spring term pulls
        // the bar back toward its idle baseline.
        vel[i] += (left + right - 2 * amp[i]) * TENSION;
        vel[i] += (base - amp[i]) * RETURN_TO_BASE;
        vel[i] *= VELOCITY_DAMPING;
      }

      for (let i = 0; i < bars; i += 1) {
        let next = amp[i] + vel[i];
        if (next > MAX_AMPLITUDE) {
          next = MAX_AMPLITUDE;
          vel[i] *= 0.5;
        } else if (next < -MAX_AMPLITUDE) {
          next = -MAX_AMPLITUDE;
          vel[i] *= 0.5;
        }
        amp[i] = next;
      }

      // Light neighbour diffusion keeps the crest soft instead of spiky.
      let previous = amp[0];
      for (let i = 1; i < last; i += 1) {
        const current = amp[i];
        amp[i] = current + (previous + amp[i + 1] - 2 * current) * DIFFUSION;
        previous = current;
      }
    };

    /* -- drawing ----------------------------------------------------------- */

    const draw = () => {
      const node = canvasRef.current;
      if (!node) return;
      const { width, height, bars } = sizeRef.current;
      if (!bars || width <= 0 || height <= 0) return;

      const amp = ampRef.current;
      const elapsed = clockRef.current.elapsed;
      const maxHeight = height * maxHeightRatio;
      const { primary, neutral } = colorsRef.current;

      ctx.clearRect(0, 0, width, height);

      // Batch bars into a handful of alpha buckets so we set fillStyle ~7 times
      // per frame instead of once per bar.
      const neutralPaths = neutralAlphas.map(() => new Path2D());
      const accentPaths = accentAlphas.map(() => new Path2D());

      for (let i = 0; i < bars; i += 1) {
        // |displacement| above the idle floor: crests and troughs both read as
        // energy, which is what a spectrum readout looks like.
        const displacement =
          idleBaseline(i, elapsed, idleAmp, idleRate) + Math.abs(amp[i]);
        const value = Math.min(displacement, VALUE_CEILING);
        const barHeight = Math.max(1, value * maxHeight);
        const x = i * barPitch;

        if (value >= accentThreshold) {
          const t = (value - accentThreshold) / accentSpan;
          const bucket = Math.min(
            accentAlphas.length - 1,
            Math.max(0, Math.floor(t * accentAlphas.length))
          );
          accentPaths[bucket].rect(x, height - barHeight, barWidth, barHeight);
        } else {
          const t = value / accentThreshold;
          const bucket = Math.min(
            neutralAlphas.length - 1,
            Math.max(0, Math.floor(t * neutralAlphas.length))
          );
          neutralPaths[bucket].rect(x, height - barHeight, barWidth, barHeight);
        }
      }

      for (let i = 0; i < neutralPaths.length; i += 1) {
        ctx.fillStyle = `hsl(${neutral} / ${neutralAlphas[i]})`;
        ctx.fill(neutralPaths[i]);
      }
      for (let i = 0; i < accentPaths.length; i += 1) {
        ctx.fillStyle = `hsl(${primary} / ${accentAlphas[i]})`;
        ctx.fill(accentPaths[i]);
      }
    };

    /* -- motion off: one static frame, no loop, no pointer listener -------- */

    if (!animate) {
      const { bars } = sizeRef.current;
      const amp = ampRef.current;
      for (let i = 0; i < bars; i += 1) amp[i] = 0;
      // A fixed elapsed value gives a still frame with shape in it rather than
      // a flat line — the plot in particular should still look like a trace.
      clockRef.current.elapsed = 2400;
      draw();

      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", scheduleResize);
        if (resizeObserver) resizeObserver.disconnect();
      };
    }

    /* -- animation loop ---------------------------------------------------- */

    const tick = (now) => {
      const clock = clockRef.current;
      if (!clock.last) clock.last = now;

      const delta = Math.min(now - clock.last, 100);
      clock.last = now;
      clock.elapsed += delta;
      clock.accumulator += delta;

      let steps = 0;
      while (clock.accumulator >= STEP_MS && steps < MAX_STEPS_PER_FRAME) {
        step(clock.elapsed);
        clock.accumulator -= STEP_MS;
        steps += 1;
      }
      if (clock.accumulator > STEP_MS * MAX_STEPS_PER_FRAME) {
        clock.accumulator = 0;
      }

      draw();
      frameRef.current = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frameRef.current) return;
      clockRef.current.last = 0;
      clockRef.current.accumulator = 0;
      frameRef.current = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!frameRef.current) return;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (!document.hidden) start();

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", scheduleResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [variant, isPlot, animate]);

  /*
    The plot fills whatever box the panel hands it.

    The backdrop is pinned to the EDITOR CONTENT REGION, not the viewport:
    its bars are anchored to the bottom of its own box, and the bottom
    var(--ide-bottom) of the viewport is the opaque docked panel plus the
    status bar, so a full-viewport canvas draws the entire field underneath
    them where nobody can see it. The inset box puts the field exactly where
    §5c wants it — behind the editor text, resting on the panel's top edge.

    It needs a WRAPPER: <canvas> is a replaced element, and an absolutely
    positioned replaced element with `width: auto` resolves to its intrinsic
    (attribute) width and then drops the over-constrained `right`. Sizing the
    inset box on a plain div and letting the canvas fill it at 100% is what
    makes left/right/top/bottom actually size the thing.
  */
  if (isPlot) {
    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block h-full w-full"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed -z-10"
      style={{
        left: "var(--ide-left)",
        right: 0,
        top: "var(--ide-top)",
        bottom: "var(--ide-bottom)",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none block h-full w-full"
      />
    </div>
  );
}
