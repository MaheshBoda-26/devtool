import { useEffect, useRef, useState } from "react";
import styles from "./LandingPages.module.css";

const GITHUB_FEATURES = [
  {
    category: "Data Retrieval",
    items: [
      { name: "Public Repositories", desc: "Fetch up to 100 public repos per request via GitHub REST API v3", detail: "Uses /users/:username/repos endpoint with per_page=100" },
      { name: "Repository Metadata", desc: "Stars, forks, watchers, size, language, license, topics", detail: "All fields from GitHub Repository object, filtered for relevance" },
      { name: "Language Detection", desc: "Primary language with colored indicator dot", detail: "Maps GitHub language names to color codes for visual identification" },
      { name: "Description & Topics", desc: "Full repo description and topic tags", detail: "Topics rendered as clickable chips linking to GitHub topic pages" },
      { name: "Fork & Star Counts", desc: "Formatted with locale-aware thousands separators", detail: "Uses Intl.NumberFormat for consistent display across locales" },
      { name: "Live GitHub Links", desc: "Direct links to repo, issues, and owner profile", detail: "Opens in new tab with rel=noreferrer for security" },
    ],
  },
  {
    category: "User Experience",
    items: [
      { name: "Instant Search", desc: "Auto-fetches on username change with debounce", detail: "300ms debounce prevents excessive API calls" },
      { name: "Loading States", desc: "Animated skeleton loader with staggered dots", detail: "Pure CSS animation, respects prefers-reduced-motion" },
      { name: "Error Handling", desc: "Graceful degradation with user-friendly messages", detail: "Captures 404, rate limits, network errors with retry option" },
      { name: "Empty States", desc: "Clear messaging when no repos found", detail: "Differentiates between private user, no repos, and API errors" },
      { name: "Keyboard Navigation", desc: "Full keyboard support for all interactions", detail: "Tab order, focus visible, Enter to submit" },
      { name: "Responsive Layout", desc: "Card grid adapts from 1 to 3 columns", detail: "CSS Grid with minmax(280px, 1fr) for fluid adaptation" },
    ],
  },
];

const JOB_FEATURES = [
  {
    category: "Search & Filtering",
    items: [
      { name: "Keyword Search", desc: "Full-text search across job titles and descriptions", detail: "Adzuna 'what' parameter with relevance ranking" },
      { name: "Location Filter", desc: "City, region, or remote — free text input", detail: "Adzuna 'where' parameter, supports 'remote' keyword" },
      { name: "Country Selection", desc: "19 countries via dropdown (GB, US, DE, FR, AU, etc.)", detail: "ISO 3166-1 alpha-2 codes mapped to Adzuna country endpoints" },
      { name: "Salary Range", desc: "Min/max annual salary in local currency", detail: "Filters on salary_min/salary_max, converted server-side" },
      { name: "Contract Types", desc: "Full-time, Part-time, Permanent, Contract checkboxes", detail: "Multiple selection via contract_type and contract_time params" },
      { name: "Sort Options", desc: "Relevance, Date posted, Salary", detail: "Maps to Adzuna sort_by: relevance, date, salary" },
      { name: "Pagination", desc: "20 results per page, up to 100 pages", detail: "Client-side page state with smooth scroll to top" },
    ],
  },
  {
    category: "Results Display",
    items: [
      { name: "Job Cards", desc: "Title, company, location, salary, contract type", detail: "Semantic HTML with microdata-ready structure" },
      { name: "Salary Formatting", desc: "Locale-aware currency with range support", detail: "Handles min-only, max-only, and min-max ranges" },
      { name: "Description Preview", desc: "HTML-stripped snippet, 280 char limit", detail: "Regex-based tag stripping with ellipsis truncation" },
      { name: "Date Formatting", desc: "Localized relative date display", detail: "Intl.DateTimeFormat with year/month/day options" },
      { name: "Direct Apply Links", desc: "Opens Adzuna listing in new tab", detail: "Uses redirect_url with rel=noreferrer" },
      { name: "Result Count", desc: "Total matches with pluralization", detail: "Formatted with toLocaleString() for readability" },
    ],
  },
  {
    category: "Developer Experience",
    items: [
      { name: "API Configuration", desc: "VITE_ADZUNA_APP_ID / VITE_ADZUNA_APP_KEY in .env", detail: "Vite injects at build time, no runtime config needed" },
      { name: "Not Configured State", desc: "Clear setup instructions when keys missing", detail: "Shows .env template with links to developer.adzuna.com" },
      { name: "Rate Limit Handling", desc: "Surfaces API errors without crashing", detail: "Catches 429, 401, 5xx with actionable messages" },
      { name: "TypeScript Ready", desc: "Full type definitions for API responses", detail: "Interfaces for Job, SearchParams, SearchResponse" },
    ],
  },
];

const ICONS = {
  github: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  briefcase: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  category: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 17H20"/>
      <path d="M6.5 17V14a2.5 2.5 0 0 1 5 0v3.5"/>
      <path d="M6.5 17h11v-9"/>
    </svg>
  ),
};

export function FeaturesPage({ onNavigate }) {
  const [visible, setVisible] = useState({});
  const refs = useRef({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeTool, setActiveTool] = useState("github");

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

  function toggleCategory(categoryKey) {
    setExpandedCategories((prev) => ({ ...prev, [categoryKey]: !prev[categoryKey] }));
  }

  function renderFeatureSection(title, icon, features, sectionKey) {
    const isExpanded = expandedCategories[sectionKey];

    return (
      <section key={sectionKey} id={sectionKey} ref={(el) => (refs.current[sectionKey] = el)} className={styles.featureSection}>
        <div className={styles.sectionWrapper}>
          <button
            className={`${styles.categoryHeader} ${visible[sectionKey] ? styles.visible : ""}`}
            onClick={() => toggleCategory(sectionKey)}
            style={{ animationDelay: "0ms" }}
            aria-expanded={isExpanded}
          >
            <div className={styles.categoryIcon}>{icon}</div>
            <div className={styles.categoryInfo}>
              <h2 className={styles.categoryTitle}>{title}</h2>
              <p className={styles.categoryCount}>{features.reduce((sum, c) => sum + c.items.length, 0)} features</p>
            </div>
            <svg
              className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ""}`}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <div
            className={`${styles.categoryContent} ${isExpanded ? styles.expanded : ""}`}
            style={{ maxHeight: isExpanded ? "2000px" : "0" }}
            aria-hidden={!isExpanded}
          >
            {features.map((category, catIdx) => (
              <article key={category.category} className={`${styles.featureCard} ${visible[sectionKey] ? styles.visible : ""}`} style={{ animationDelay: `${catIdx * 80}ms` }}>
                <h3 className={styles.featureCategoryTitle}>{category.category}</h3>
                <dl className={styles.featureList}>
                  {category.items.map((item, _itemIdx) => (
                    <div key={item.name} className={styles.featureItem}>
                      <dt className={styles.featureName}>{item.name}</dt>
                      <dd className={styles.featureDesc}>{item.desc}</dd>
                      <dd className={styles.featureDetail}>{item.detail}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.page} data-slot="features-page">
      <header className={`${styles.pageHeader} animate-on-scroll`} id="features-hero" ref={(el) => (refs.current.hero = el)}>
        <div className={styles.heroContent}>
          <div className={`${styles.badge} ${visible.hero ? styles.visible : ""}`} style={{ animationDelay: "0ms" }}>
            <span className={styles.badgeDot} />
            Features
          </div>

          <h1 className={`${styles.headline} ${visible.hero ? styles.visible : ""}`} style={{ animationDelay: "100ms" }}>
            <span className={styles.word}>Everything</span>
            <span className={styles.word}>DevTool</span>
            <span className={styles.word}>does.</span>
          </h1>

          <p className={`${styles.subhead} ${visible.hero ? styles.visible : ""}`} style={{ animationDelay: "250ms" }}>
            Two powerful tools in one interface. Each feature is designed for speed, clarity, and zero friction.
          </p>

          <div className={`${styles.toolTabs} ${visible.hero ? styles.visible : ""}`} style={{ animationDelay: "400ms" }} role="tablist" aria-label="Tool selection">
            <button
              role="tab"
              aria-selected={activeTool === "github"}
              className={`${styles.toolTab} ${activeTool === "github" ? styles.active : ""}`}
              onClick={() => setActiveTool("github")}
            >
              {ICONS.github}
              <span>GitHub Repos</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTool === "jobs"}
              className={`${styles.toolTab} ${activeTool === "jobs" ? styles.active : ""}`}
              onClick={() => setActiveTool("jobs")}
            >
              {ICONS.briefcase}
              <span>Job Search</span>
            </button>
          </div>
        </div>
      </header>

      {activeTool === "github" ? (
        renderFeatureSection("GitHub Repo Retriever", ICONS.github, GITHUB_FEATURES, "github-features")
      ) : (
        renderFeatureSection("Job Search (Adzuna)", ICONS.briefcase, JOB_FEATURES, "job-features")
      )}

      <footer className={`${styles.pageFooter} animate-on-scroll`}>
        <div className={styles.sectionWrapper}>
          <button className={`${styles.cta} ${styles.ctaSecondary}`} onClick={() => onNavigate("home")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to Home</span>
          </button>
          <button className={`${styles.cta} ${styles.ctaPrimary}`} onClick={() => onNavigate("about")}>
            <span>Technical Details</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}