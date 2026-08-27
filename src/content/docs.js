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

const bullets = (category, fallback) =>
  techCategories
    .find((c) => c.category === category || c.category.includes(category))
    ?.items.map((i) => `- ${i}`)
    .join("\n") ?? fallback;

export const aboutMd = `# About

${aboutBio}

${aboutHighlights.map((h) => `## ${h.title}\n\n${h.description}`).join("\n\n")}
`;

export const educationMd = `# Education

${education
  .map(
    (e) => `## ${e.degree}\n\n**${e.school}** · \`${e.period}\`\n\n${e.details || ""}`.trimEnd()
  )
  .join("\n\n")}
`;

export const leadershipMd = `# Leadership

${leadershipIntro}

${leadership
  .map((l) => {
    const head = `## ${l.role}\n\n**${l.org}** · \`${l.period}\``;
    const body = l.details ? `\n\n${l.details}` : "";
    const points =
      Array.isArray(l.points) && l.points.length
        ? `\n\n${l.points.map((p) => `- ${p}`).join("\n")}`
        : "";
    return head + body + points;
  })
  .join("\n\n")}
`;

const certSection = (list, heading) =>
  list.length
    ? `## ${heading}\n\n${list
        .map((c) => {
          const title = c.href ? `[${c.title}](${c.href})` : c.title;
          const issuer = c.issuer ? `, ${c.issuer}` : "";
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
        .map((r) => `### ${r.title}\n\n\`${r.year}\`. ${r.description}`)
        .join("\n\n")}`
    : "",
]
  .filter(Boolean)
  .join("\n\n");

export const hobbiesMd = `# Hobbies

${hobbies.map((h) => `## ${h.label}\n\n${h.description}`).join("\n\n")}
`;

export const nowMd = `# Now

What I'm actually working on, as of August 2026. Starting sophomore year at
Edison Academy in a couple of weeks.

## Building

**Hydroponic Garden.** A vertical tower where the geometry does the work instead
of the plumbing. Every commercial tower I looked at either runs tubing to each
level or lets the bottom plants go thirsty, so I'm trying to build one where a
single pump lifts water to the top and the shape of the part distributes it the
rest of the way down. Jet splitter, spreader, four spouts, sloped floor, drip
holes, and the same module repeated all the way down. CAD is still in progress and
I'm fairly sure the spout angles are wrong.

**StudyBuddy.** You upload a worksheet you have already done, mark the questions
you got wrong, and it gives you back a record of what you actually know rather
than what you think you know. A vision model pulls the questions out, you confirm
what it read, and a review queue schedules the ones you missed. After the first
few worksheets it runs on your own API key or a local Ollama instance.

**PulseFlow-AI.** Hospital operations: patient flow, department capacity and
staff load, running live over WebSocket with optimisation and simulation
underneath. Built it with a team for HackJPS, where it won Best in AI/ML, and
I have kept working on it since.

## Figuring out

- Where the remaining error lives in the voice model. It sits at 0.854 AUC on
  224 speakers it never saw, which is decent, and I want to know whether the
  misses are a data problem or a feature problem before I touch the architecture.
- How small a local model can get before it stops being useful on a Pi. The
  garden monitor runs two at once and I am still not sure that was wise.

## Looking for

Summer research or an internship in applied ML. I am most interested in the
version of the problem where the model has to run on real hardware and cannot
phone home for help.

## Elsewhere

Teaching IoT at the Robbinsville 4-H Innovation Club, and playing JV tennis.

_Updated August 2026._
`;

export const usesMd = `# Uses

The tools I actually reach for. Everything here shows up somewhere in the
projects on this site.

## Editor and shell

- **VS Code**, Dark Modern. It is the theme this whole site is wearing.
- **Windows and PowerShell**, usually with a \`.venv\` already activated.
- **ruff** for linting Python, and \`pyproject.toml\` over loose config files.

## Languages

${bullets("Languages", "- Python")}

Python for anything with a model in it, TypeScript for anything with a screen.

## Machine learning

${bullets("AI", "- PyTorch")}

**PyTorch** for models I train myself: the LSTMs and Transformers in the
portfolio analyser, the CNN work. **scikit-learn** when the honest answer is that
the problem does not need a neural network, which is more often than I would
like. **Weights & Biases** so I can tell which run was which a week later.

## Local models

**Ollama**, on almost everything. The chatbot, the garden monitor and StudyBuddy
all run against a local model, partly on principle and partly because an API
key is one more thing that can expire in the middle of a demo.

## Web and backend

- **Next.js** and **React**, with **Tailwind**.
- **FastAPI** when there is a model behind the endpoint, **Flask** when the thing
  is small enough that FastAPI would be showing off.
- **Postgres** with **pgvector** for anything that needs embeddings.
- **InfluxDB** for sensor readings, since they are time series and nothing else.

## Solvers

**OR-Tools** and **SimPy**. Scheduling and queueing problems have real answers,
and it took me embarrassingly long to learn that you can go and compute them
instead of guessing.

## Hardware

- **Raspberry Pi**. The garden monitor lives on one, running two models at once.
- **Arduino**. Sensors, and most of what I teach at the 4-H lab.
- **Onshape** and a 3D printer, for the hydroponic tower.
- A breadboard, a soldering iron, and a drawer of parts that used to be something
  else. There is an inventory system on this site specifically because I lost
  track of that drawer.

## Deploying

**Vercel** for front ends, **Render** when something needs a Python process
running, **GitHub Pages** for this site. The build here pulls my repo data from
the GitHub API every couple of days, so what you are reading is current.
`;

export const stackJson = JSON.stringify(
  {
    name: `${personal.firstName.toLowerCase()}-${personal.lastName.toLowerCase()}`,
    role: ["AI / ML", "Full-stack", "IoT"],
    ...Object.fromEntries(
      techCategories.map((c) => [
        c.category
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, ""),
        c.items,
      ])
    ),
  },
  null,
  2
);

export const contactSh = {
  shebang: "#!/usr/bin/env bash",
  comment: "",
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
