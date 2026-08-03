import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
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

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

const expandVariants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
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

const featureItemVariants = {
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

export function FeaturesPage({ onNavigate }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeTool, setActiveTool] = useState("github");

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  function toggleCategory(categoryKey) {
    setExpandedCategories((prev) => ({ ...prev, [categoryKey]: !prev[categoryKey] }));
  }

  const initialVariants = prefersReducedMotion ? false : "hidden";

  function renderFeatureSection(title, icon, features, sectionKey) {
    const isExpanded = expandedCategories[sectionKey];
    const featuresData = features;

    return (
      <motion.section
        key={sectionKey}
        id={sectionKey}
        className={styles.featureSection}
        initial={initialVariants}
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={containerVariants}
      >
        <motion.div className={styles.sectionWrapper} initial="hidden" animate="visible" variants={containerVariants}>
          <motion.button
            className={styles.categoryHeader}
            onClick={() => toggleCategory(sectionKey)}
            aria-expanded={isExpanded}
            whileHover={{ boxShadow: "var(--shadow-md)", borderColor: "var(--primary-border)" }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <motion.div
              className={styles.categoryIcon}
              whileHover={{ scale: 1.05, rotate: 2, boxShadow: "var(--shadow-glow)" }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              {icon}
            </motion.div>
            <motion.div className={styles.categoryInfo} initial="hidden" animate="visible" variants={itemVariants}>
              <motion.h2 className={styles.categoryTitle} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                {title}
              </motion.h2>
              <motion.p className={styles.categoryCount} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                {featuresData.reduce((sum, c) => sum + c.items.length, 0)} features
              </motion.p>
            </motion.div>
            <motion.svg
              className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ""}`}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </motion.button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                className={styles.categoryContent}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                variants={expandVariants}
                style={{ overflow: "hidden" }}
              >
                {featuresData.map((category, _catIdx) => (
                  <motion.article
                    key={category.category}
                    className={styles.featureCard}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    whileHover={{ y: -2, boxShadow: "var(--shadow-md)", borderColor: "var(--primary-border)" }}
                  >
                    <motion.h3
                      className={styles.featureCategoryTitle}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {category.category}
                    </motion.h3>
                    <motion.dl className={styles.featureList} initial="hidden" animate="visible" variants={containerVariants}>
                      {category.items.map((item, _itemIdx) => (
                        <motion.div
                          key={item.name}
                          className={styles.featureItem}
                          initial="hidden"
                          animate="visible"
                          variants={featureItemVariants}
                          whileHover={{ x: 4, borderColor: "var(--primary-border)", background: "var(--surface-raised)" }}
                        >
                          <motion.dt
                            className={styles.featureName}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            {item.name}
                          </motion.dt>
                          <motion.dd
                            className={styles.featureDesc}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                          >
                            {item.desc}
                          </motion.dd>
                          <motion.dd
                            className={styles.featureDetail}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            {item.detail}
                          </motion.dd>
                        </motion.div>
                      ))}
                    </motion.dl>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.section>
    );
  }

  return (
    <div className={styles.page} data-slot="features-page">
      <header className={styles.pageHeader} id="features-hero">
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
            Features
          </motion.div>

          <motion.h1
            className={styles.headline}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            style={{ transitionDelay: "100ms" }}
          >
            <span className={styles.word}>Everything</span>
            <span className={styles.word}>DevTool</span>
            <span className={styles.word}>does.</span>
          </motion.h1>

          <motion.p
            className={styles.subhead}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            style={{ transitionDelay: "250ms" }}
          >
            Two powerful tools in one interface. Each feature is designed for speed, clarity, and zero friction.
          </motion.p>

          <motion.div
            className={styles.toolTabs}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            style={{ transitionDelay: "400ms" }}
            role="tablist"
            aria-label="Tool selection"
          >
            <motion.button
              role="tab"
              aria-selected={activeTool === "github"}
              className={`${styles.toolTab} ${activeTool === "github" ? styles.active : ""}`}
              onClick={() => setActiveTool("github")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              whileFocus={{ boxShadow: "0 0 0 3px var(--primary-muted)" }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              layout
            >
              {ICONS.github}
              <span>GitHub Repos</span>
            </motion.button>
            <motion.button
              role="tab"
              aria-selected={activeTool === "jobs"}
              className={`${styles.toolTab} ${activeTool === "jobs" ? styles.active : ""}`}
              onClick={() => setActiveTool("jobs")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              whileFocus={{ boxShadow: "0 0 0 3px var(--primary-muted)" }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              layout
            >
              {ICONS.briefcase}
              <span>Job Search</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </header>

      {activeTool === "github" ? (
        renderFeatureSection("GitHub Repo Retriever", ICONS.github, GITHUB_FEATURES, "github-features")
      ) : (
        renderFeatureSection("Job Search (Adzuna)", ICONS.briefcase, JOB_FEATURES, "job-features")
      )}

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
            onClick={() => onNavigate("home")}
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
            <span>Back to Home</span>
          </motion.button>
          <motion.button
            className={`${styles.cta} ${styles.ctaPrimary}`}
            onClick={() => onNavigate("about")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            <span>Technical Details</span>
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