import { RevealSection } from "./Layout";
import {
  Award,
  BookOpen,
  ExternalLink,
  ArrowUpRight,
  FileText,
  Braces,
  TerminalSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  aboutBio,
  aboutHighlights as highlights,
  hobbies,
  education,
  leadership,
  leadershipIntro,
  techCategories,
  certifications,
  certificationsInProgress as inProgress,
  recognitions,
  contactLinks,
} from "@/data/portfolio-data";

/* ------------------------------------------------------------------ */
/* Shared chrome                                                       */
/* ------------------------------------------------------------------ */

/** ~60ms apart inside a group, so a scroll produces a visible sequence. */
const STEP = 60;

/**
 * The mono file header above every heading. It matches the section's entry
 * in the explorer tree, so it encodes the file the reader is "open" in
 * rather than decorating the heading with an eyebrow.
 */
function FileHeader({ name }) {
  const Icon = name.endsWith(".json")
    ? Braces
    : name.endsWith(".sh")
      ? TerminalSquare
      : FileText;

  return (
    <div className="t-mono mb-5 flex items-center gap-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{name}</span>
    </div>
  );
}

function TimelineRail() {
  return (
    <div
      className="absolute left-5 top-0 bottom-0 hidden w-px bg-border sm:block"
      aria-hidden="true"
    />
  );
}

function TimelineMarker({ icon: Icon }) {
  return (
    <div className="relative z-10 hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius)] border border-border bg-card sm:flex">
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* About — about.md                                                    */
/* ------------------------------------------------------------------ */

export function AboutSection() {
  return (
    <section id="about" className="section section--major">
      <div className="shell">
        <RevealSection>
          <div className="section-head">
            <FileHeader name="about.md" />
            <h2 className="t-h2">About</h2>
            <p className="t-lead mt-5 max-w-2xl">{aboutBio}</p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <RevealSection
                key={item.title}
                delay={index * STEP}
                className="h-full"
              >
                <div className="card h-full p-6">
                  <Icon
                    className="mb-4 h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h3 className="t-h3 mb-2">{item.title}</h3>
                  <p className="t-body">{item.description}</p>
                </div>
              </RevealSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Hobbies — hobbies.md                                                */
/* ------------------------------------------------------------------ */

export function HobbiesSection() {
  return (
    <section id="hobbies" className="section">
      <div className="shell">
        <RevealSection>
          <div className="section-head">
            <FileHeader name="hobbies.md" />
            <h2 className="t-h2">Hobbies</h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hobbies.map((hobby, index) => {
            const Icon = hobby.icon;
            return (
              <RevealSection
                key={hobby.label}
                delay={index * STEP}
                className="h-full"
              >
                <div className="card h-full p-5">
                  <Icon
                    className="mb-3 h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h3 className="t-h3 mb-1.5">{hobby.label}</h3>
                  <p className="t-caption">{hobby.description}</p>
                </div>
              </RevealSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Education — education.md                                            */
/* ------------------------------------------------------------------ */

export function EducationSection() {
  return (
    <section id="education" className="section">
      <div className="shell">
        <RevealSection>
          <div className="section-head">
            <FileHeader name="education.md" />
            <h2 className="t-h2">Education</h2>
          </div>
        </RevealSection>

        <div className="relative">
          <TimelineRail />
          <div className="flex flex-col gap-6">
            {education.map((edu, index) => (
              <RevealSection key={edu.degree} delay={index * STEP}>
                <div className="flex gap-6">
                  <TimelineMarker icon={edu.icon} />
                  <div className="card flex-1 p-6">
                    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="t-h3">{edu.degree}</h3>
                      <span className="t-mono flex-shrink-0">{edu.period}</span>
                    </div>
                    <p className="t-label mb-3">{edu.school}</p>
                    <p className="t-body">{edu.details}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Leadership — leadership.md                                          */
/* ------------------------------------------------------------------ */

export function LeadershipSection() {
  return (
    <section id="leadership" className="section">
      <div className="shell">
        <RevealSection>
          <div className="section-head">
            <FileHeader name="leadership.md" />
            <h2 className="t-h2">Leadership</h2>
            <p className="t-lead mt-5 max-w-2xl">{leadershipIntro}</p>
          </div>
        </RevealSection>

        <div className="relative">
          <TimelineRail />
          <div className="flex flex-col gap-6">
            {leadership.map((role, index) => (
              <RevealSection key={role.org} delay={index * STEP}>
                <div className="flex gap-6">
                  <TimelineMarker icon={role.icon} />
                  <div className="card flex-1 p-6">
                    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="t-h3">{role.role}</h3>
                      <span className="t-mono flex-shrink-0">{role.period}</span>
                    </div>
                    <p className="t-label mb-3">{role.org}</p>
                    <p className="t-body">{role.details}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Tech stack — stack.json                                             */
/* ------------------------------------------------------------------ */

/** Structural JSON punctuation: present, but quieter than the data. */
function Punct({ children }) {
  return (
    <span className="text-[hsl(var(--ide-gutter))]" aria-hidden="true">
      {children}
    </span>
  );
}

export function TechStackSection() {
  return (
    <section id="tech" className="section">
      <div className="shell">
        <RevealSection>
          <div className="section-head">
            <FileHeader name="stack.json" />
            <h2 className="t-h2">Tech stack</h2>
          </div>
        </RevealSection>

        <RevealSection>
          <div className="card overflow-x-auto p-6 font-mono text-[13px] leading-relaxed md:p-8">
            <Punct>{"{"}</Punct>

            <div className="my-1 sm:pl-6">
              {techCategories.map((cat, index) => (
                <RevealSection
                  key={cat.category}
                  delay={index * STEP}
                  className="py-2.5"
                >
                  <p className="flex items-baseline gap-1">
                    <span className="text-foreground">
                      <Punct>&quot;</Punct>
                      {cat.category}
                      <Punct>&quot;</Punct>
                    </span>
                    <Punct>: [</Punct>
                  </p>

                  <ul
                    aria-label={cat.category}
                    className="mt-2.5 flex flex-wrap gap-2 sm:pl-6"
                  >
                    {cat.items.map((item) => (
                      <li
                        key={item}
                        className={cn(
                          "rounded-[var(--radius)] border border-border px-2.5 py-1 font-mono text-[12.5px] text-foreground",
                          cat.dashed
                            ? "border-dashed bg-transparent text-muted-foreground"
                            : "bg-secondary"
                        )}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-2.5">
                    <Punct>
                      {index === techCategories.length - 1 ? "]" : "],"}
                    </Punct>
                  </p>
                </RevealSection>
              ))}
            </div>

            <Punct>{"}"}</Punct>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Credentials — credentials.md                                        */
/* ------------------------------------------------------------------ */

export function CredentialsSection() {
  return (
    <section id="credentials" className="section">
      <div className="shell">
        <RevealSection>
          <div className="section-head">
            <FileHeader name="credentials.md" />
            <h2 className="t-h2">Credentials</h2>
          </div>
        </RevealSection>

        <div id="certifications">
          <RevealSection>
            <h3 className="t-h3 mb-6">Certifications</h3>
          </RevealSection>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_18rem]">
            {certifications.length > 0 && (
              <div className="flex flex-col gap-4">
                {certifications.map((cert, index) => (
                  <RevealSection key={cert.title} delay={index * STEP}>
                    <div className="card p-5">
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <h4 className="t-label mb-1">{cert.title}</h4>
                          <p className="t-caption">{cert.issuer}</p>
                        </div>
                        <span className="t-mono flex-shrink-0">{cert.year}</span>
                      </div>
                    </div>
                  </RevealSection>
                ))}
              </div>
            )}

            <RevealSection delay={certifications.length > 0 ? 180 : STEP}>
              <div className="card p-6">
                <div className="mb-5 flex items-center gap-2">
                  <BookOpen
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h4 className="t-label">Currently pursuing</h4>
                </div>
                <div className="flex flex-col gap-3">
                  {inProgress.map((cert) => {
                    const CardTag = cert.href ? "a" : "div";
                    return (
                      <CardTag
                        key={cert.title}
                        {...(cert.href
                          ? {
                              href: cert.href,
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
                        className={cn(
                          "card block border-dashed p-4",
                          cert.href && "card-i"
                        )}
                      >
                        {cert.image && (
                          <img
                            src={cert.image}
                            alt={cert.issuer}
                            className="mb-3 h-6 object-contain object-left"
                          />
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="t-label mb-1">{cert.title}</p>
                            <p className="t-caption">{cert.issuer}</p>
                          </div>
                          {cert.href && (
                            <ExternalLink
                              className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      </CardTag>
                    );
                  })}
                </div>
              </div>
            </RevealSection>
          </div>
        </div>

        <div id="recognitions" className="section--tight pb-0">
          <RevealSection>
            <h3 className="t-h3 mb-6">Awards &amp; recognition</h3>
          </RevealSection>

          <div className="relative">
            <TimelineRail />
            <div className="flex flex-col gap-4">
              {recognitions.map((item, index) => (
                <RevealSection key={item.title} delay={(index % 4) * STEP}>
                  <div className="flex gap-6">
                    <TimelineMarker icon={item.icon ?? Award} />
                    <div className="card flex-1 p-6">
                      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h4 className="t-h3">{item.title}</h4>
                        <span className="t-mono flex-shrink-0">{item.year}</span>
                      </div>
                      <p className="t-body">{item.description}</p>
                    </div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact — contact.sh                                                */
/* ------------------------------------------------------------------ */

/** The command that would actually open each link from a shell. */
function commandFor(href) {
  if (href.startsWith("mailto:")) return "mail";
  if (href.startsWith("tel:")) return "call";
  return "open";
}

export function ContactSection() {
  return (
    <section id="contact" className="section">
      <div className="shell">
        <RevealSection>
          <div className="section-head">
            <FileHeader name="contact.sh" />
            <h2 className="t-h2">Contact</h2>
            <p className="t-lead mt-5 max-w-xl">
              I love talking about AI, new technologies, or fun project ideas. Contact me through my
              number or email!
            </p>
          </div>
        </RevealSection>

        <RevealSection>
          <div className="card max-w-2xl overflow-x-auto p-5 font-mono text-[13px] sm:p-6">
            <p className="t-mono mb-4">#!/bin/sh</p>

            <div className="flex flex-col gap-1.5">
              {contactLinks.map(({ icon: Icon, label, value, href }, index) => (
                <RevealSection key={label} delay={index * STEP}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={`${label}: ${value}`}
                    className="flex items-center gap-2.5 rounded-[var(--radius)] border border-transparent px-2.5 py-2 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-border focus-visible:-translate-y-px focus-visible:border-border"
                  >
                    <Icon
                      className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span
                      className="flex-shrink-0 select-none text-[hsl(var(--ide-gutter))]"
                      aria-hidden="true"
                    >
                      $
                    </span>
                    <span className="flex-shrink-0 text-muted-foreground">
                      {commandFor(href)}
                    </span>
                    <span className="truncate text-foreground">{value}</span>
                    <span className="ml-auto hidden flex-shrink-0 items-center gap-2 sm:flex">
                      <span className="text-[hsl(var(--ide-gutter))]">
                        # {label}
                      </span>
                      <ArrowUpRight
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                </RevealSection>
              ))}
            </div>

            <p className="t-mono mt-4 flex items-center gap-2">
              <span className="text-[hsl(var(--ide-gutter))]">$</span>
              <span className="caret-blink" aria-hidden="true" />
            </p>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
