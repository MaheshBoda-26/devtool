import { motion } from "motion/react";
import { useEffect, useState } from "react";
import styles from "./LandingPages.module.css";

const TECH_STACK = [
  {
    category: "Frontend",
    items: [
      { name: "React 19", version: "19.2.7", desc: "Latest React with concurrent features and improved hooks", link: "https://react.dev" },
      { name: "Vite 8", version: "8.1.1", desc: "Lightning-fast build tool and dev server with native ESM", link: "https://vitejs.dev" },
      { name: "CSS Modules", version: "Native", desc: "Scoped, composable styles with zero runtime overhead", link: "https://github.com/css-modules/css-modules" },
      { name: "OKLCH Color System", version: "CSS Native", desc: "Perceptually uniform colors for consistent dark mode", link: "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch" },
    ],
  },
  {
    category: "APIs & Data",
    items: [
      { name: "GitHub REST API v3", version: "2022-11-28", desc: "Public repository data — no authentication required", link: "https://docs.github.com/en/rest" },
      { name: "Adzuna Job Search API", version: "v1", desc: "19 countries, rich filtering, salary data", link: "https://developer.adzuna.com" },
      { name: "Fetch API", version: "Native", desc: "Modern request/response handling with AbortController", link: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" },
    ],
  },
  {
    category: "Tooling & Quality",
    items: [
      { name: "oxlint", version: "1.71.0", desc: "Rust-based linter — 10-50x faster than ESLint", link: "https://oxc-project.github.io/docs/guide/oxlint" },
      { name: "TypeScript Types", version: "5.8+", desc: "Full type coverage for components and API responses", link: "https://www.typescriptlang.org" },
    ],
  },
];

const ARCHITECTURE = [
  {
    title: "Component Architecture",
    description: "Flat, feature-based structure. Each tool (GitHub, Jobs) is self-contained with its own components, styles, and logic. Shared utilities in /services. No global state — React hooks manage local state per component.",
    details: [
      "App.jsx — Root, tab routing, landing page orchestration",
      "GitHubRepos.jsx — Username input, fetch, repo list, card rendering",
      "JobSearch.jsx — Filter form, pagination, job list, card rendering",
      "JobFilters.jsx — Controlled form with 9 filter fields",
      "JobCard.jsx — Semantic job display with salary/date formatting",
      "ParticleField.jsx — Canvas animation, isolated from React render cycle",
    ],
  },
  {
    title: "State Management",
    description: "Pure React hooks — no Redux, Context, or external stores. Each component owns its state. Derived state via useMemo. Side effects in useEffect with proper cleanup.",
    details: [
      "useState — Form inputs, loading, error, data arrays",
      "useMemo — Derived values (canFetch, totalPages, filtered options)",
      "useEffect — Data fetching, subscriptions, IntersectionObserver",
      "useRef — DOM refs for canvas, scroll, animation frames",
    ],
  },
  {
    title: "Styling System",
    description: "CSS Modules with CSS custom properties (variables) for design tokens. OKLCH color space for perceptual uniformity. Dark-mode only with color-scheme: dark. Responsive via fluid typography (clamp) and CSS Grid/Flexbox.",
    details: [
      "index.css — Global tokens, reset, base elements, reduced motion",
      "App.module.css — Layout, tabs, panel transitions",
      "GitHubRepos.module.css — Form, list, card, loading, empty states",
      "JobSearch.module.css — Section, filters grid, pagination, results",
      "JobFilters.module.css — Filter form with 9 fields",
      "LandingPages.module.css — Multi-page landing styles",
    ],
  },
  {
    title: "Animation & Motion",
    description: "CSS-first animations with IntersectionObserver for scroll reveals. Canvas particle field runs at 60fps via requestAnimationFrame. All motion respects prefers-reduced-motion media query.",
    details: [
      "Entrance: Staggered opacity + translateY (300-600ms, ease-out)",
      "Hover: Transform + box-shadow + border-color (200ms)",
      "Canvas: 60 particles, 3 gradient orbs, noise-based drift, connection lines",
      "Reduced motion: Disables all transitions/animations instantly",
    ],
  },
  {
    title: "Accessibility",
    description: "Built-in, not bolted on. Semantic HTML, ARIA labels, focus management, color contrast (WCAG AA), keyboard navigation.",
    details: [
      "color-scheme: dark forces dark mode for contrast",
      "oklch colors guarantee AA contrast ratios",
      "Focus visible outlines on all interactive elements",
      "ARIA labels on icon-only buttons and canvas",
      "IntersectionObserver with rootMargin for early reveal",
      "prefers-reduced-motion disables all motion instantly",
    ],
  },
];

const BUILD_PROCESS = [
  {
    step: 1,
    title: "Development",
    command: "npm run dev",
    description: "Vite dev server with HMR. Runs on localhost:5173. Hot module replacement for React components and CSS Modules. oxlint runs on save via editor integration.",
  },
  {
    step: 2,
    title: "Linting",
    command: "npm run lint",
    description: "oxlint checks entire codebase in <100ms. Catches unused vars, missing deps, type errors, style issues. Zero config — uses .oxlintrc.json.",
  },
  {
    step: 3,
    title: "Production Build",
    command: "npm run build",
    description: "Vite bundles with Rollup. Outputs to dist/. Code splitting by route. CSS extracted and minified. Assets hashed for cache busting. ES modules + legacy chunks.",
  },
  {
    step: 4,
    title: "Preview",
    command: "npm run preview",
    description: "Serves dist/ locally for final verification. Identical to production headers and compression.",
  },
  {
    step: 5,
    title: "Deploy",
    command: "vercel deploy / netlify / any static host",
    description: "Static output — deploy anywhere. No server required. SPA fallback to index.html for client routing. Environment variables configured in platform dashboard.",
  },
];

const DESIGN_DECISIONS = [
  { title: "Dark Mode Only", rationale: "Reduces eye strain for developers. OKLCH ensures consistent perceived brightness. No light/dark toggle needed — one codepath." },
  { title: "No Framework UI Library", rationale: "Radix, shadcn, MUI add bundle weight and abstraction. Custom components = full control, zero dependencies, smaller bundle." },
  { title: "CSS Modules over CSS-in-JS", rationale: "Zero runtime. Scoped by default. Works with any tooling. Familiar CSS syntax. Easy to migrate." },
  { title: "Canvas for Background", rationale: "ParticleField runs outside React render. 60fps without reconciliation overhead. Pausable, resize-aware, memory-efficient." },
  { title: "IntersectionObserver for Reveals", rationale: "Native, performant, no scroll listeners. RootMargin triggers before element enters viewport. Cleanup on unmount." },
  { title: "Vite over CRA/Next.js", rationale: "DevTool is a client-only SPA. No SSR, no routing, no server components needed. Vite is faster, simpler, smaller." },
];

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const decisionVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const techItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function AboutPage({ onNavigate, className }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const initialVariants = prefersReducedMotion ? false : "hidden";

  return (
    <div data-slot="about-page" className={`${styles.page} ${className || ""}`}>
      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>
      <header className={styles.pageHeader} id="about-hero">
        <motion.div
          className={styles.heroContent}
          initial={initialVariants}
          animate="visible"
          variants={containerVariants}
          role="banner"
        >
          <motion.div
            className={styles.badge}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            style={{ transitionDelay: "0ms" }}
          >
            <span className={styles.badgeDot} />
            Technical Deep Dive
          </motion.div>

          <motion.h1
            className={styles.headline}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            style={{ transitionDelay: "100ms" }}
          >
            <motion.span className={styles.word} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              How
            </motion.span>
            <motion.span className={styles.word} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
              DevTool
            </motion.span>
            <motion.span className={styles.word} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              is
            </motion.span>
            <motion.span className={styles.word} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
              built.
            </motion.span>
          </motion.h1>

          <motion.p
            className={styles.subhead}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            style={{ transitionDelay: "250ms" }}
          >
            Architecture, stack, design decisions, and build process. No fluff — just the technical details.
          </motion.p>
        </motion.div>
      </header>

      <main id="main-content">
        <motion.section
          className={styles.techStackSection}
          id="tech-stack"
          initial={initialVariants}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionWrapper} initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h2
              className={`${styles.sectionTitle} ${styles.sectionTitleGradient}`}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              Technology Stack
            </motion.h2>
            {TECH_STACK.map((category, catIdx) => (
              <motion.article
                key={category.category}
                className={styles.categoryCard}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
                style={{ transitionDelay: `${catIdx * 100}ms` }}
              >
                <motion.h3
                  className={styles.categoryTitle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {category.category}
                </motion.h3>
                <motion.dl className={styles.techList} initial="hidden" animate="visible" variants={containerVariants}>
                  {category.items.map((item, _itemIdx) => (
                    <motion.div
                      key={item.name}
                      className={styles.techItem}
                      initial="hidden"
                      animate="visible"
                      variants={techItemVariants}
                      whileHover={{ x: 4, borderColor: "var(--primary-border)", transform: "translateX(4px)" }}
                    >
                      <dt className={styles.techName}>
                        <motion.a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.techLink}
                          whileHover={{ color: "var(--primary)" }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {item.name}
                        </motion.a>
                        <span className={styles.techVersion}>{item.version}</span>
                      </dt>
                      <motion.dd
                        className={styles.techDesc}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        {item.desc}
                      </motion.dd>
                    </motion.div>
                  ))}
                </motion.dl>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.architectureSection}
          id="architecture"
          initial={initialVariants}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionWrapper} initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h2
              className={`${styles.sectionTitle} ${styles.sectionTitleGradient}`}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              Architecture
            </motion.h2>
            {ARCHITECTURE.map((section, idx) => (
              <motion.article
                key={section.title}
                className={styles.archCard}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <motion.h3
                  className={styles.archTitle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {section.title}
                </motion.h3>
                <motion.p
                  className={styles.archDesc}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {section.description}
                </motion.p>
                <motion.ul className={styles.archDetails} initial="hidden" animate="visible" variants={containerVariants}>
                  {section.details.map((detail, dIdx) => (
                    <motion.li
                      key={dIdx}
                      className={styles.archDetail}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + dIdx * 0.05 }}
                    >
                      {detail}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.buildSection}
          id="build-process"
          initial={initialVariants}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionWrapper} initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h2
              className={`${styles.sectionTitle} ${styles.sectionTitleGradient}`}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              Build & Deploy Process
            </motion.h2>
            <motion.ol className={styles.buildSteps} initial="hidden" animate="visible" variants={containerVariants}>
              {BUILD_PROCESS.map((step, _idx) => (
                <motion.li
                  key={step.step}
                  className={styles.buildStep}
                  initial="hidden"
                  animate="visible"
                  variants={stepVariants}
                  whileHover={{ x: 4, boxShadow: "var(--shadow-md)", borderColor: "var(--primary-border)" }}
                >
                  <motion.div
                    className={styles.stepNumber}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 15 }}
                    whileHover={{ scale: 1.1, boxShadow: "var(--shadow-glow)" }}
                  >
                    {step.step}
                  </motion.div>
                  <div className={styles.stepContent}>
                    <motion.div className={styles.stepHeader} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                      <motion.h3 className={styles.stepTitle}>{step.title}</motion.h3>
                      <motion.code className={styles.stepCommand} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                        {step.command}
                      </motion.code>
                    </motion.div>
                    <motion.p
                      className={styles.stepDesc}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.decisionsSection}
          id="design-decisions"
          initial={initialVariants}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionWrapper} initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h2
              className={`${styles.sectionTitle} ${styles.sectionTitleGradient}`}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              Key Design Decisions
            </motion.h2>
            <motion.div className={styles.decisionsGrid} initial="hidden" animate="visible" variants={containerVariants}>
              {DESIGN_DECISIONS.map((decision, _idx) => (
                <motion.article
                  key={decision.title}
                  className={styles.decisionCard}
                  initial="hidden"
                  animate="visible"
                  variants={decisionVariants}
                  whileHover={{ y: -4, boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
                >
                  <motion.h3
                    className={styles.decisionTitle}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {decision.title}
                  </motion.h3>
                  <motion.p
                    className={styles.decisionRationale}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    {decision.rationale}
                  </motion.p>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          className={styles.projectInfoSection}
          id="project-info"
          initial={initialVariants}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
        >
          <motion.div className={styles.sectionWrapper} initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h2
              className={`${styles.sectionTitle} ${styles.sectionTitleGradient}`}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              Project Information
            </motion.h2>
            <motion.div className={styles.infoGrid} initial="hidden" animate="visible" variants={containerVariants}>
              <motion.article
                className={styles.infoCard}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
              >
                <motion.h3
                  className={styles.infoTitle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Repository Structure
                </motion.h3>
                <motion.pre
                  className={styles.codeBlock}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {`vite-project/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── GitHubRepos.jsx
│   │   ├── GitHubRepos.module.css
│   │   ├── JobCard.jsx
│   │   ├── JobFilters.jsx
│   │   ├── JobSearch.jsx
│   │   ├── JobSearch.module.css
│   │   ├── ParticleField.jsx
│   │   ├── ParticleField.module.css
│   │   ├── HomePage.jsx
│   │   ├── FeaturesPage.jsx
│   │   ├── AboutPage.jsx
│   │   └── LandingPages.module.css
│   ├── services/
│   │   └── adzuna.js
│   ├── App.jsx
│   ├── App.module.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── PRODUCT.md`}
                </motion.pre>
              </motion.article>
              <motion.article
                className={styles.infoCard}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
              >
                <motion.h3
                  className={styles.infoTitle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Environment Variables
                </motion.h3>
                <motion.pre
                  className={styles.codeBlock}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {`# .env (create from .env.example)
VITE_ADZUNA_APP_ID=your_app_id
VITE_ADZUNA_APP_KEY=your_api_key

# Get credentials at https://developer.adzuna.com
# GitHub tab works without any API keys`}
                </motion.pre>
                <motion.h3
                  className={styles.infoTitle}
                  style={{ marginTop: "var(--space-xl)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Scripts
                </motion.h3>
                <motion.pre
                  className={styles.codeBlock}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  {`npm run dev      # Start dev server (HMR)
npm run build    # Production build to dist/
npm run lint     # Run oxlint
npm run preview  # Preview production build`}
                </motion.pre>
              </motion.article>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>

      <motion.footer
        className={styles.pageFooter}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={containerVariants}
      >
        <motion.div className={styles.sectionWrapper} initial="hidden" animate="visible" variants={containerVariants}>
          <motion.button
            className={`${styles.cta} ${styles.ctaSecondary}`}
            onClick={() => onNavigate("features")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <motion.svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              initial={{ x: -5 }}
              animate={{ x: 0 }}
              transition={{ type: "spring" }}
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </motion.svg>
            <span>Back to Features</span>
          </motion.button>
          <motion.button
            className={`${styles.cta} ${styles.ctaPrimary}`}
            onClick={() => onNavigate("home")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <span>Home</span>
            <motion.svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              initial={{ x: 5 }}
              animate={{ x: 0 }}
              transition={{ type: "spring" }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </motion.svg>
          </motion.button>
        </motion.div>
      </motion.footer>
    </div>
  );
}