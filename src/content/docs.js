/**
 * Content builders — portfolio data rendered into the format each file claims
 * to be.
 *
 * about.md really is markdown, stack.json really is JSON, contact.sh really is
 * a shell script. That is the whole point of the file-tree device: if the source
 * view showed something that was not the format on the tin, the illusion would
 * collapse the first time anyone toggled it.
 *
 * Every string here comes from src/data/portfolio-data.js verbatim. Nothing is
 * rewritten; this only arranges it.
 */

import {
  aboutBio,
  aboutHighlights,
  education,
  leadership,
  leadershipIntro,
  techCategories,
  certifications,
  certificationsInProgress,
  recognitions,
  hobbies,
  contactLinks,
  personal,
} from "@/data/portfolio-data";

/* ------------------------------------------------------------------ about */

export const aboutMd = `# About

${aboutBio}

${aboutHighlights.map((h) => `## ${h.title}\n\n${h.description}`).join("\n\n")}
`;

/* -------------------------------------------------------------- education */

export const educationMd = `# Education

${education
  .map(
    (e) =>
      `## ${e.degree}\n\n**${e.school}** · \`${e.period}\`\n\n${e.details || ""}`.trimEnd()
  )
  .join("\n\n")}
`;

/* ------------------------------------------------------------- leadership */

export const leadershipMd = `# Leadership

${leadershipIntro}

${leadership
  .map((l) => {
    const head = `## ${l.role}\n\n**${l.org}** · \`${l.period}\``;
    const body = l.details ? `\n\n${l.details}` : "";
    const bullets = Array.isArray(l.points) && l.points.length
      ? `\n\n${l.points.map((p) => `- ${p}`).join("\n")}`
      : "";
    return head + body + bullets;
  })
  .join("\n\n")}
`;

/* ------------------------------------------------------------ credentials */

const certSection = (list, heading) =>
  list.length
    ? `## ${heading}\n\n${list
        .map((c) => {
          const title = c.href ? `[${c.title}](${c.href})` : c.title;
          const issuer = c.issuer ? ` — ${c.issuer}` : "";
          const kind = c.kind ? ` (${c.kind})` : "";
          const id = c.credentialId ? ` \`${c.credentialId}\`` : "";
          return `- ${title}${kind}${issuer}${id}`;
        })
        .join("\n")}`
    : "";

export const credentialsMd = [
  "# Credentials",
  "",
  certSection(certifications, "Certifications"),
  certSection(certificationsInProgress, "In progress"),
  recognitions.length
    ? `## Awards & recognition\n\n${recognitions
        .map((r) => `### ${r.title}\n\n\`${r.year}\` — ${r.description}`)
        .join("\n\n")}`
    : "",
]
  .filter(Boolean)
  .join("\n\n");

/* ---------------------------------------------------------------- hobbies */

export const hobbiesMd = `# Hobbies

${hobbies.map((h) => `## ${h.label}\n\n${h.description}`).join("\n\n")}
`;

/* -------------------------------------------------------------------- now */

export const nowMd = `# Now

> Placeholder copy. This file exists so there is somewhere to say what you are
> building *this month* — rewrite it in your own words, it is the file that makes
> a portfolio feel alive rather than archived.

## Building

- **Hydroponic Garden** — a modular 3D-printed tower where the geometry does the
  water distribution, so one pump feeds every level evenly. CAD in progress.
- **StudyBuddy** — upload a worksheet, mark what you got wrong, and get back a
  record of what you actually know. Vision model for extraction, spaced
  repetition for the review queue.
- **PulseFlow-AI** — healthcare ops platform pairing optimisation and simulation
  with forecasting, to catch hospital bottlenecks before they become real problems.

## Learning

- Audio models that survive contact with noisy real-world recordings — Voice_AI
  holds AUC 0.854 on speakers it never saw, and I want to understand where the
  remaining error lives.
- Getting local LLMs small and fast enough to run on a Pi without falling over.

## Looking for

Summer research or internship work in applied ML — especially anything where the
model has to run on hardware that cannot phone home.

_Last updated: rewrite this line when you edit the file._
`;

/* ------------------------------------------------------------------- uses */

export const usesMd = `# Uses

> Placeholder copy — a starting point built from what is visible in the repos.
> Correct anything that is wrong; this list should be yours, not inferred.

## Editor

- **VS Code**, Dark Modern. The theme this whole site is wearing.
- **JetBrains Mono** for code.

## Languages

${techCategories
  .find((c) => c.category === "Languages")
  ?.items.map((i) => `- ${i}`)
  .join("\n") ?? "- Python"}

## Machine learning

${techCategories
  .find((c) => c.category.includes("AI"))
  ?.items.map((i) => `- ${i}`)
  .join("\n") ?? "- PyTorch"}

## Hardware

- **Raspberry Pi** — GardenBuddy runs on one, with two models at once.
- **Arduino** — sensors, and most of what gets taught in the 4-H lab.
- Breadboards, a soldering iron, and a drawer of components that were once
  something else.

## Running locally

- **Ollama** for local LLMs, so a project keeps working without an API key.
`;

/* ------------------------------------------------------------- stack.json */

/** techCategories as a real JSON object — the format the filename promises. */
export const stackJson = JSON.stringify(
  {
    name: `${personal.firstName.toLowerCase()}-${personal.lastName.toLowerCase()}`,
    role: ["AI / ML", "Full-stack", "IoT"],
    ...Object.fromEntries(
      techCategories.map((c) => [
        c.category.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
        c.items,
      ])
    ),
  },
  null,
  2
);

/* ------------------------------------------------------------- contact.sh */

/** contactLinks as a shell script. Each command line carries a real href. */
export const contactSh = {
  shebang: "#!/usr/bin/env bash",
  comment: "# Every line below is a real link. Click one.",
  commands: contactLinks.map((c) => {
    const isMail = c.href.startsWith("mailto:");
    const isTel = c.href.startsWith("tel:");
    const cmd = isMail ? "mail" : isTel ? "call" : "open";
    return {
      cmd,
      arg: c.value,
      href: c.href,
      label: c.label,
      external: !isMail && !isTel,
    };
  }),
};

/* ------------------------------------------------------------------ index */

export const DOCS = {
  about: { kind: "md", source: aboutMd },
  education: { kind: "md", source: educationMd },
  leadership: { kind: "md", source: leadershipMd },
  credentials: { kind: "md", source: credentialsMd },
  hobbies: { kind: "md", source: hobbiesMd },
  now: { kind: "md", source: nowMd },
  uses: { kind: "md", source: usesMd },
  stack: { kind: "json", source: stackJson },
  contact: { kind: "sh", source: contactSh },
};
