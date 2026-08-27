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

export const projects = [
  {
    icon: Activity,
    title: "PulseFlow-AI",
    github: "https://github.com/DagaVedant/PulseFlow-AI",
    image:
      "https://raw.githubusercontent.com/DagaVedant/PulseFlow-AI/main/frontend/public/preview.png",
    description:
      "A healthcare ops platform that combines optimization, simulation, forecasting, and AI to catch hospital bottlenecks before they turn into real problems.",
    tags: ["OR-Tools", "SimPy", "AI", "Healthcare", "Python"],
    inProgress: true,
  },
  {
    icon: BarChart3,
    title: "AI Portfolio Analyzer",
    github: "https://github.com/DagaVedant/AI-Portfolio-Analyzer",
    image: `${import.meta.env.BASE_URL}images/ai-portfolio-analyzer.png`,
    description:
      "Trains LSTM and Transformer models on 46 stocks to predict returns, volatility, and downside risk. Also does sentiment analysis, portfolio optimization, and has a full backtesting engine.",
    tags: ["LSTM", "Transformers", "PyTorch", "Backtesting", "Finance"],
  },
  {
    icon: Sprout,
    title: "GardenBuddy",
    github: "https://github.com/DagaVedant/GardenBuddy",
    image:
      "https://raw.githubusercontent.com/DagaVedant/GardenBuddy/main/demo/demo_website.png",
    description:
      "A Raspberry Pi garden monitor running two AI models at once, a custom LSTM classifier and a local Ollama LLM, showing live soil, temperature, humidity, and light data on a React dashboard.",
    tags: ["Raspberry Pi", "LSTM", "Ollama", "IoT", "React"],
    inProgress: true,
  },
  {
    icon: Bot,
    title: "FRC Chatbot: Team 10600",
    github: "https://github.com/DagaVedant/FRC-Chatbot-Team-10600",
    image: `${import.meta.env.BASE_URL}images/frc-chatbot.png`,
    description:
      "Meet Avocado, an AI pit assistant for FRC Team 10600. Built with FastAPI, Ollama, and a hybrid TF-IDF plus semantic RAG system, it answers questions about our robot, team, and the game manual, and actually remembers the conversation.",
    tags: ["RAG", "FastAPI", "Ollama", "Robotics", "Python"],
  },
  {
    icon: Mic,
    title: "VoiceGPT",
    github: "https://github.com/DagaVedant/VoiceGPT",
    image: `${import.meta.env.BASE_URL}images/voicegpt-logo.png`,
    description:
      "A voice-controlled GPT assistant with speech recognition, text-to-speech, and image generation. I showed it off at Maker Fair 2024.",
    tags: ["OpenAI API", "Speech Recognition", "TTS", "Python"],
  },
  {
    icon: Brain,
    title: "EMNIST Character Classifier",
    github: "https://github.com/DagaVedant/EMNIST-Character-Classifier",
    image: `${import.meta.env.BASE_URL}images/emnist-classifier.png`,
    description:
      "A CNN trained on the EMNIST Balanced dataset to read handwritten digits and letters. Built with a PyTorch pipeline and WandB experiment tracking, plus a drawing web app so you can test it live.",
    tags: ["CNN", "PyTorch", "Flask", "WandB", "Computer Vision"],
  },
  {
    icon: MapPin,
    title: "California House Price Predictor",
    github: "https://github.com/DagaVedant/California-House-Price-Predictor",
    image: `${import.meta.env.BASE_URL}images/california-house-price.png`,
    description:
      "Predicts median house prices anywhere in California. Click the heatmap or type in an address and it'll give you an XGBoost estimate with a confidence range, right on Google Maps.",
    tags: ["XGBoost", "scikit-learn", "Streamlit", "Google Maps", "ML"],
  },
  {
    icon: Shield,
    title: "Spam Message AI Classifier",
    github: "https://github.com/DagaVedant/Spam-Message-AI-Classifier",
    image:
      "https://raw.githubusercontent.com/DagaVedant/Spam-Message-AI-Classifier/main/images/spam_wordcloud.png",
    description:
      "An NLP spam detector that uses Multinomial Naive Bayes and a custom preprocessing pipeline to sort spam texts from real ones.",
    tags: ["NLP", "Naive Bayes", "scikit-learn", "Python"],
  },
  {
    icon: Globe,
    title: "Lección 7 de Español",
    github: "https://github.com/DagaVedant/Leccion-7-de-Espanol",
    image: `${import.meta.env.BASE_URL}images/leccion-7-espanol.png`,
    description:
      "An interactive Spanish review site that helps students learn job vocab, the future and future perfect tenses, and the past subjunctive. Built with React, Node.js, and TypeScript.",
    tags: ["React", "Node.js", "TypeScript", "Education"],
  },
  {
    icon: Code2,
    title: "Python-Examples",
    github: "https://github.com/DagaVedant/Python-Examples",
    image:
      "https://raw.githubusercontent.com/DagaVedant/Python-Examples/main/public/images/preview.png",
    description:
      "A browser-based Python course for beginners. No downloads, no paywalls, just bite-sized units with code examples, quizzes, practice problems, and projects.",
    tags: ["Python", "Education", "JavaScript", "Interactive"],
    inProgress: true,
  },
  {
    icon: MessageSquare,
    title: "Almanac Slack Bot",
    github: "https://github.com/DagaVedant/Almanac-Slack-Bot",
    image:
      "https://raw.githubusercontent.com/DagaVedant/Almanac-Slack-Bot/main/images/screenshot.png",
    description:
      "A Slack bot that drops a word, a fact, a historical event, and a quote in your channel every day.",
    tags: ["Slack API", "Node.js", "Automation", "Bot"],
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
export const certifications = [];

export const certificationsInProgress = [
  {
    title: "Python Programming Fundamentals",
    issuer: "Microsoft",
    href: "https://www.coursera.org/learn/microsoft-python-programming-fundamentals",
    image:
      "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/http://coursera-university-assets.s3.amazonaws.com/cc/61dbdf2c1c475d82d3b8bf8eee1bda/MSFT-stacked-logo_FINAL.png",
  },
];

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
