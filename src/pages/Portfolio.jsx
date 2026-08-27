import { useCallback, useState } from "react";

import AmbientField from "@/components/portfolio/AmbientField";
import BootSequence, { BOOT_LINES } from "@/components/portfolio/BootSequence";
import HeroSection from "@/components/portfolio/Hero";
import IDEChrome from "@/components/portfolio/IDEChrome";
import { Footer, ScrollProgress } from "@/components/portfolio/Layout";
import ProjectsRail from "@/components/portfolio/ProjectsRail";
import SerialMonitor from "@/components/portfolio/SerialMonitor";
import {
  AboutSection,
  ContactSection,
  CredentialsSection,
  EducationSection,
  HobbiesSection,
  LeadershipSection,
  TechStackSection,
} from "@/components/portfolio/Sections";

/* =========================================================================
   Portfolio — the one page, and the wiring between the six pieces.

   Composition order matters more than it looks:

     AmbientField "backdrop" is `position: fixed; z-index: -10`. A negative
     z-index child paints BELOW its stacking context's background, and the
     body's background propagates to the viewport canvas underneath
     everything — so the canvas is visible only while no ancestor between it
     and the root paints an opaque background of its own. The wrapper below
     therefore has NO background utility and NO `position`/`z-index` pair
     that would trap the canvas in a new stacking context. This exact bug
     (an opaque `bg-background` on a `relative` wrapper) hid the field once
     already; do not add one back.

     IDEChrome owns the fixed chrome AND the in-flow content region, so the
     page content is in the DOM — and at its final geometry — from the first
     frame. `booted` only cross-fades the chrome's opacity, so nothing
     reflows when the boot terminal finishes docking.

     BootSequence is a fixed overlay that unmounts on onDone; SerialMonitor
     is the panel it docks into, and renders the same BOOT_LINES scrollback
     so the hand-off lands on an identical frame.
   ========================================================================= */

const SESSION_KEY = "vd-booted";

/** sessionStorage throws in private mode / when storage is blocked. */
function bootedThisSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export default function Portfolio() {
  // Already booted once this session -> skip straight to the docked IDE.
  const [booted, setBooted] = useState(bootedThisSession);

  // Stable identity: BootSequence stores it in a ref, but a changing prop
  // would still make the overlay re-render on every parent update.
  const handleBootDone = useCallback(() => setBooted(true), []);

  return (
    <div className="min-h-screen font-inter text-foreground antialiased">
      {/* §5c — behind the editor content, above the ground. */}
      <AmbientField variant="backdrop" />

      <IDEChrome booted={booted}>
        <ScrollProgress />

        <main>
          <HeroSection />
          <AboutSection />
          <ProjectsRail />
          <TechStackSection />
          <EducationSection />
          <LeadershipSection />
          <CredentialsSection />
          <HobbiesSection />
          <ContactSection />
        </main>

        <Footer />
      </IDEChrome>

      {/* Fixed bottom panel — the terminal the boot sequence docks into. */}
      <SerialMonitor bootLines={BOOT_LINES} />

      {booted ? null : <BootSequence onDone={handleBootDone} />}
    </div>
  );
}

