import {
  Brain,
  Lightbulb,
  BarChart3,
  Mail,
  Phone,
  Github,
  Zap,
  BookOpen,
  Globe,
  GraduationCap,
  Headphones,
  Gamepad2,
  BookMarked,
  Mountain,
  Microscope,
  Activity,
  Mic,
  Shield,
  MapPin,
  Bot,
  Sprout,
  Code2,
  MessageSquare,
  Award,
  Calculator,
  Users,
  Medal,
  Star,
  Rocket,
} from "lucide-react";
import TennisBallIcon from "@/components/portfolio/TennisBallIcon";

export const personal = {
  firstName: "Vedant",
  lastName: "Daga",
  initials: "VD",
};

export const taglineParts = [
  { text: "Building across " },
  { text: "AI/ML" },
  { text: ", " },
  { text: "full-stack" },
  { text: ", and " },
  { text: "IoT" },
];

export const rotatingWords = [
  "Builder",
  "AI Engineer",
  "ML Developer",
  "Full-Stack Dev",
  "IoT Tinkerer",
  "Problem Solver",
  "Innovator",
];

export const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: "vedantdaga04@gmail.com",
    href: "mailto:vedantdaga04@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (609) 608-8060",
    href: "tel:+16096088060",
  },
  {
    icon: Globe,
    label: "Devpost",
    value: "https://devpost.com/Vedant-Daga",
    href: "https://devpost.com/Vedant-Daga",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "github.com/DagaVedant",
    href: "https://github.com/DagaVedant",
  },
];

export const aboutBio = `I'm always building something, that's kind of just my whole thing. Mostly AI/ML, full-stack, and IoT, and I'm constantly picking up new tools because there's always something new worth messing with.`;

export const aboutHighlights = [
  {
    icon: Brain,
    title: "AI & Machine Learning",
    description:
      "I build deep learning models, everything from LSTMs and Transformers for finance to CNNs that read handwriting, plus NLP pipelines.",
  },
  {
    icon: Zap,
    title: "Full-Stack Development",
    description:
      "I ship full web apps with React, Node.js, FastAPI, and TypeScript, everything from dashboards to AI-powered platforms.",
  },
  {
    icon: Microscope,
    title: "IoT & Embedded Systems",
    description:
      "I mess around with Arduino and embedded hardware to build connected systems and automate stuff.",
  },
  {
    icon: Lightbulb,
    title: "Always Shipping",
    description:
      "From hospital optimization platforms to random open-source autoclickers, I'm always building something and putting it out there.",
  },
];

export const techCategories = [
  {
    category: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "HTML/CSS", "C/C++"],
  },
  {
    category: "AI / ML",
    items: [
      "PyTorch",
      "scikit-learn",
      "Transformers",
      "NumPy",
      "Pandas",
      "WandB",
      "Jupyter",
    ],
  },
  {
    category: "Web & Backend",
    items: ["React", "Node.js", "FastAPI", "Streamlit", "Tailwind CSS"],
  },
  {
    category: "AI Tools & APIs",
    items: ["OpenAI API", "Ollama", "OR-Tools", "SimPy"],
  },
  {
    category: "Hardware & IoT",
    items: ["Arduino", "IoT", "Raspberry Pi", "Embedded Systems"],
  },
  {
    category: "Learning Next",
    items: [
      "Deep Learning",
      "LLM Fine-tuning",
      "Reinforcement Learning",
      "AI Fundamentals",
    ],
    dashed: true,
  },
];

/**
 * The seven repos the portfolio shows.
 *
 * Only `github` and `inProgress` are read at runtime now: scripts/fetch-repos.mjs
 * parses the URLs, and everything shown in a repo view — description, topics,
 * languages, files, commits, README — comes from the GitHub API at build time.
 * `title` is kept for readability when editing this list.
 */
export const projects = [
  {
    title: "PulseFlow-AI",
    github: "https://github.com/DagaVedant/PulseFlow-AI",
  },
  {
    title: "StudyBuddy",
    github: "https://github.com/DagaVedant/StudyBuddy",
  },
  {
    title: "Voice AI",
    github: "https://github.com/DagaVedant/Voice_AI",
  },
  {
    title: "GardenBuddy",
    github: "https://github.com/DagaVedant/GardenBuddy",
  },
  {
    title: "AI Portfolio Analyzer",
    github: "https://github.com/DagaVedant/AI-Portfolio-Analyzer",
  },
  {
    title: "Inventory Management System",
    github: "https://github.com/DagaVedant/Inventory-Management-System",
  },
  {
    title: "Hydroponic Garden",
    github: "https://github.com/DagaVedant/Hydroponic-Garden",
    inProgress: true,
  },
];

export const education = [
  {
    degree: "Freshman at Edison Academy Magnet School",
    school: "Edison Academy Magnet School",
    period: "2025 - 2029",
    details: "One of the top public high schools in Middlesex County.",
    icon: GraduationCap,
  },
  {
    degree: "Independent Learning",
    school: "Online Courses and Personal Projects",
    period: "2023 - Present",
    details:
      "Teaching myself AI/ML, deep learning, full-stack dev, and embedded systems by just building stuff.",
    icon: BookOpen,
  },
];

export const leadershipIntro =
  "Outside of building software, I teach and lead. I've put in 600+ volunteer hours on STEM education and mentoring kids across New Jersey.";

export const leadership = [
  {
    role: "Secretary & Mentor",
    org: "Robbinsville 4-H Innovation Club",
    period: "2022 - Present",
    details:
      "I lead and mentor a team of student teachers, planning lessons and materials, teaching 70+ students, and running outreach at schools, libraries, and senior centers. Also co-designed and co-taught a 6-month IoT curriculum for students in India.",
    icon: Users,
  },
  {
    role: "Lead",
    org: "4-H Curriculum Redesign",
    period: "2024 - Present",
    details:
      "Rebuilt the club's teaching framework so lessons actually build on each other, and started a peer-teaching model where older students mentor the new ones.",
    icon: BookOpen,
  },
  {
    role: "Co-founder & Teacher",
    org: "4-H Summer Learning Program",
    period: "2026 - Present",
    details:
      "Co-founding a community STEM summer program, building out the curriculum and structure before it kicks off this summer.",
    icon: Lightbulb,
  },
];

/** @type {never[]} */
export const certifications = [
  {
    title: "Google AI Essentials",
    issuer: "Google",
    // PLACEHOLDER: this points at the programme page, not Vedant's certificate.
    // Replace with the personal verify link from Coursera > Accomplishments,
    // which looks like https://coursera.org/verify/professional-cert/XXXXXXXX
    href: "https://www.coursera.org/professional-certificates/google-ai-essentials",
    verified: false,
  },
  {
    title: "Python Programming Fundamentals",
    issuer: "Microsoft",
    // PLACEHOLDER: same — swap for https://coursera.org/verify/XXXXXXXX
    href: "https://www.coursera.org/learn/microsoft-python-programming-fundamentals",
    verified: false,
  },
];

export const certificationsInProgress = [];

export const hobbies = [
  {
    icon: Microscope,
    label: "Tinkering",
    description:
      "Taking things apart, building circuits, messing with hardware.",
  },
  {
    icon: TennisBallIcon,
    label: "Tennis",
    description:
      "I play tennis with friends and for school. Season just ended and I made JV first as a freshman.",
  },
  {
    icon: Gamepad2,
    label: "Gaming",
    description:
      "Strategy games mostly, really anything that makes me think or do math.",
  },
  {
    icon: BookMarked,
    label: "Reading",
    description:
      "I love sci-fi, mystery, or fantasy. Favorite series: Inheritance Games by Jennifer Lynn Barnes.",
  },
  {
    icon: Mountain,
    label: "Outdoors",
    description:
      "I love hiking and exploring nature. Best trail I've done is Fairy Falls in Yellowstone.",
  },
  {
    icon: Headphones,
    label: "Music",
    description:
      "Music's always on, bus rides, my room, while I'm coding, doesn't matter.",
  },
];

export const recognitions = [
  {
    icon: Medal,
    title: "3rd Place: TSA TEAMS Nationals",
    description:
      "Placed 3rd in the Multiple Choice round at TSA TEAMS Nationals.",
    year: "2026",
  },
  {
    icon: Star,
    title: "Edison Academy Tech Expo Winner",
    description: "Won the Edison Academy Tech Expo.",
    year: "2026",
  },
  {
    icon: Activity,
    title: "Best in AI/ML: HackJPS 2026",
    description:
      "Won Best in AI/ML for PulseFlow-AI, a hospital digital-twin platform that simulates patient flow and predicts bottlenecks.",
    year: "2026",
  },
  {
    icon: Zap,
    title: "Top 10 Overall: MakeNJIT",
    description: "Finished top 10 overall at the MakeNJIT hackathon.",
    year: "2026",
  },
  {
    icon: Globe,
    title: "Honorable Mention: ILMUNC",
    description:
      "Recognized at the Ivy League Model United Nations Conference.",
    year: "2026",
  },
  {
    icon: Rocket,
    title: "NASA TechRise",
    description: "Participated in the NASA TechRise Student Challenge.",
    year: "2025",
  },
  {
    icon: Bot,
    title: "VEX IQ World Championship",
    description: "Qualified for and competed at the VEX IQ World Championship.",
    year: "2025",
  },
  {
    icon: Calculator,
    title: "MCAMC Math Competition",
    description: "4th place individual and 3rd place team at MCAMC.",
    year: "2025",
  },
  {
    icon: Award,
    title: "Best AI/ML Project: HackJPS",
    description:
      "Won Best AI/ML Project for VeggieBuddy, an AI diet-recommendation app I built with React, Flask, and the Google Maps Places API.",
    year: "2025",
  },
];
