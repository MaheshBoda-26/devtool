import { useEffect, useRef, useState } from "react";
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

export function AboutPage({ onNavigate, className }) {
  const [visible, setVisible] = useState({});
  const refs = useRef({});

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      Object.keys(refs.current).forEach((key) => {
        setVisible((prev) => ({ ...prev, [key]: true }));
      });
      document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const animateObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            animateObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    Object.values(refs.current).forEach((ref) => ref && observer.observe(ref));
    document.querySelectorAll('.animate-on-scroll').forEach(el => animateObserver.observe(el));

    return () => {
      observer.disconnect();
      animateObserver.disconnect();
    };
  }, []);

  return (
    <div data-slot="about-page" className={`${styles.page} ${className || ""}`}>
      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>
      <header className={`${styles.pageHeader} animate-on-scroll`} id="about-hero" ref={(el) => (refs.current.hero = el)}>
        <div className={styles.heroContent}>
          <div className={`${styles.badge} ${visible.hero ? styles.visible : ""} ${styles.stagger1}`}>
            <span className={styles.badgeDot} />
            Technical Deep Dive
          </div>

          <h1 className={`${styles.headline} ${visible.hero ? styles.visible : ""} ${styles.stagger2}`}>
            <span className={styles.word}>How</span>
            <span className={styles.word}>DevTool</span>
            <span className={styles.word}>is</span>
            <span className={styles.word}>built.</span>
          </h1>

          <p className={`${styles.subhead} ${visible.hero ? styles.visible : ""} ${styles.stagger3}`}>
            Architecture, stack, design decisions, and build process. No fluff — just the technical details.
          </p>
        </div>
      </header>

      <main id="main-content">
        <section className={`${styles.techStackSection} animate-on-scroll`} id="tech-stack" ref={(el) => (refs.current.techStack = el)}>
          <div className={styles.sectionWrapper}>
            <h2 className={`${styles.sectionTitle} ${visible["tech-stack"] ? styles.visible : ""}`}>
              Technology Stack
            </h2>
            {TECH_STACK.map((category, catIdx) => (
              <article key={category.category} className={`${styles.categoryCard} ${visible["tech-stack"] ? styles.visible : ""} ${styles[`stagger${catIdx + 1}`]}`}>
                <h3 className={styles.categoryTitle}>{category.category}</h3>
                <dl className={styles.techList}>
                  {category.items.map((item, _itemIdx) => (
                    <div key={item.name} className={styles.techItem}>
                      <dt className={styles.techName}>
                        <a href={item.link} target="_blank" rel="noreferrer" className={styles.techLink}>
                          {item.name}
                        </a>
                        <span className={styles.techVersion}>{item.version}</span>
                      </dt>
                      <dd className={styles.techDesc}>{item.desc}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.architectureSection} animate-on-scroll`} id="architecture" ref={(el) => (refs.current.architecture = el)}>
          <div className={styles.sectionWrapper}>
            <h2 className={`${styles.sectionTitle} ${visible.architecture ? styles.visible : ""}`}>
              Architecture
            </h2>
            {ARCHITECTURE.map((section, idx) => (
              <article key={section.title} className={`${styles.archCard} ${visible.architecture ? styles.visible : ""} ${styles[`stagger${idx + 1}`]}`}>
                <h3 className={styles.archTitle}>{section.title}</h3>
                <p className={styles.archDesc}>{section.description}</p>
                <ul className={styles.archDetails}>
                  {section.details.map((detail, dIdx) => (
                    <li key={dIdx} className={styles.archDetail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={`${styles.buildSection} animate-on-scroll`} id="build-process" ref={(el) => (refs.current.build = el)}>
          <div className={styles.sectionWrapper}>
            <h2 className={`${styles.sectionTitle} ${visible["build-process"] ? styles.visible : ""}`}>
              Build & Deploy Process
            </h2>
            <ol className={styles.buildSteps}>
              {BUILD_PROCESS.map((step, idx) => (
                <li key={step.step} className={`${styles.buildStep} ${visible["build-process"] ? styles.visible : ""} ${styles[`stagger${idx + 1}`]}`}>
                  <div className={styles.stepNumber}>{step.step}</div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepHeader}>
                      <h3 className={styles.stepTitle}>{step.title}</h3>
                      <code className={styles.stepCommand}>{step.command}</code>
                    </div>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${styles.decisionsSection} animate-on-scroll`} id="design-decisions" ref={(el) => (refs.current.decisions = el)}>
          <div className={styles.sectionWrapper}>
            <h2 className={`${styles.sectionTitle} ${visible["design-decisions"] ? styles.visible : ""}`}>
              Key Design Decisions
            </h2>
            <div className={styles.decisionsGrid}>
              {DESIGN_DECISIONS.map((decision, idx) => (
                <article key={decision.title} className={`${styles.decisionCard} ${visible["design-decisions"] ? styles.visible : ""} ${styles[`stagger${idx + 1}`]}`}>
                  <h3 className={styles.decisionTitle}>{decision.title}</h3>
                  <p className={styles.decisionRationale}>{decision.rationale}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.projectInfoSection} animate-on-scroll`} id="project-info" ref={(el) => (refs.current.info = el)}>
          <div className={styles.sectionWrapper}>
            <h2 className={`${styles.sectionTitle} ${visible["project-info"] ? styles.visible : ""}`}>
              Project Information
            </h2>
            <div className={styles.infoGrid}>
              <article className={`${styles.infoCard} ${visible["project-info"] ? styles.visible : ""} ${styles.stagger1}`}>
                <h3 className={styles.infoTitle}>Repository Structure</h3>
                <pre className={styles.codeBlock}>{`vite-project/
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
└── PRODUCT.md`}</pre>
              </article>
              <article className={`${styles.infoCard} ${visible["project-info"] ? styles.visible : ""} ${styles.stagger2}`}>
                <h3 className={styles.infoTitle}>Environment Variables</h3>
                <pre className={styles.codeBlock}>{`# .env (create from .env.example)
VITE_ADZUNA_APP_ID=your_app_id
VITE_ADZUNA_APP_KEY=your_api_key

# Get credentials at https://developer.adzuna.com
# GitHub tab works without any API keys`}</pre>
                <h3 className={styles.infoTitle} style={{ marginTop: "var(--space-xl)" }}>Scripts</h3>
                <pre className={styles.codeBlock}>{`npm run dev      # Start dev server (HMR)
npm run build    # Production build to dist/
npm run lint     # Run oxlint
npm run preview  # Preview production build`}</pre>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className={`${styles.pageFooter} animate-on-scroll`}>
        <div className={styles.sectionWrapper}>
          <button className={`${styles.cta} ${styles.ctaSecondary}`} onClick={() => onNavigate("features")} aria-label="Navigate back to Features page">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to Features</span>
          </button>
          <button className={`${styles.cta} ${styles.ctaPrimary}`} onClick={() => onNavigate("home")} aria-label="Navigate to Home page">
            <span>Home</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}