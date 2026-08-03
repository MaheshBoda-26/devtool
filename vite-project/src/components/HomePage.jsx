import { motion } from "motion/react";
import { useEffect, useState } from "react";
import styles from "./LandingPages.module.css";

const VALUE_PROPS = [
  {
    icon: "speed",
    title: "Speed First",
    description: "Sub-100ms interactions. No bloat. Every byte earns its keep.",
  },
  {
    icon: "focus",
    title: "Zero Friction",
    description: "No auth walls. No signup. Type username or keyword → get results.",
  },
  {
    icon: "precision",
    title: "Precise Results",
    description: "GitHub API v3 + Adzuna v1. Real data, real-time, no mocking.",
  },
  {
    icon: "dark",
    title: "Dark Native",
    description: "OKLCH color system. Reduced motion respected. Accessible by default.",
  },
];

const QUICK_START = [
  { cmd: "git clone <your-repo-url>", desc: "Clone the repository" },
  { cmd: "cd vite-project", desc: "Enter project directory" },
  { cmd: "npm install", desc: "Install dependencies" },
  { cmd: "cp .env.example .env", desc: "Configure Adzuna API (optional)" },
  { cmd: "npm run dev", desc: "Start dev server" },
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

const headlineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.1 + i * 0.08,
    },
  }),
};

export function HomePage({ onNavigate }) {
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
    <div className={styles.page} data-slot="home-page">
      <header className={styles.pageHeader} id="home-hero">
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
            DevTool — Dual-purpose utility
          </motion.div>

          <motion.h1
            className={styles.headline}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            style={{ transitionDelay: "100ms" }}
          >
            <motion.span
              className={styles.word}
              variants={headlineVariants}
            >
              Repo
            </motion.span>
            <motion.span
              className={styles.word}
              variants={headlineVariants}
            >
              browser
            </motion.span>
            <motion.span
              className={styles.word}
              variants={headlineVariants}
            >
              &
            </motion.span>
            <motion.span
              className={styles.word}
              variants={headlineVariants}
            >
              Job
            </motion.span>
            <motion.span
              className={styles.word}
              variants={headlineVariants}
            >
              search
            </motion.span>
            <motion.span
              className={styles.word}
              variants={headlineVariants}
            >
              .
            </motion.span>
          </motion.h1>

          <motion.p
            className={styles.subhead}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            style={{ transitionDelay: "250ms" }}
          >
            A fast, focused developer tool. Fetch GitHub repositories by username and search Adzuna job listings across 19 countries.
            Dark mode by default. Zero friction. Built for developers who value speed and clarity.
          </motion.p>

          <motion.div
            className={styles.heroActions}
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            style={{ transitionDelay: "400ms" }}
          >
            <motion.button
              className={`${styles.cta} ${styles.ctaPrimary}`}
              onClick={() => onNavigate("features")}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
              >
                <path d="M12 5v14M19 12H5" />
              </motion.svg>
              <span>Explore Features</span>
            </motion.button>
            <motion.button
              className={`${styles.cta} ${styles.ctaSecondary}`}
              onClick={() => onNavigate("about")}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 20 }}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </motion.svg>
              <span>Technical Details</span>
            </motion.button>
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className={`${styles.cta} ${styles.ctaGhost}`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <motion.svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                initial={{ rotate: 180 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </motion.svg>
              <span>View Source</span>
            </motion.a>
          </motion.div>

          <motion.div
            className={styles.scrollIndicator}
            aria-hidden="true"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M19 12H5" />
            </svg>
          </motion.div>
        </motion.div>
      </header>

      <section className={styles.valueProps} id="value-props">
        <motion.div className={styles.sectionWrapper} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={containerVariants}>
          <motion.h2
            className={`${styles.sectionTitle} ${styles.sectionTitleGradient}`}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            Why DevTool?
          </motion.h2>
          <motion.div className={styles.valueGrid} initial="hidden" animate="visible" variants={containerVariants}>
            {VALUE_PROPS.map((prop, i) => (
              <motion.article
                key={prop.title}
                className={styles.valueCard}
                initial="hidden"
                animate="visible"
                variants={itemVariants}
                style={{ transitionDelay: `${i * 100}ms` }}
                whileHover={{ y: -4, boxShadow: "var(--shadow-lg), var(--shadow-glow)" }}
              >
                <motion.div
                  className={styles.valueIcon}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                  whileHover={{ scale: 1.1, rotate: 3, boxShadow: "var(--shadow-glow)" }}
                >
                  {prop.icon === "speed" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  )}
                  {prop.icon === "focus" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  )}
                  {prop.icon === "precision" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  )}
                  {prop.icon === "dark" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </motion.div>
                <motion.h3
                  className={styles.valueTitle}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {prop.title}
                </motion.h3>
                <motion.p
                  className={styles.valueDesc}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  {prop.description}
                </motion.p>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.quickStart} id="quick-start">
        <motion.div className={styles.sectionWrapper} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={containerVariants}>
          <motion.h2
            className={`${styles.sectionTitle} ${styles.sectionTitleGradient}`}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            Quick Start
          </motion.h2>
          <motion.p
            className={styles.sectionDesc}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
          >
            Get running in under 30 seconds.
          </motion.p>
          <motion.div
            className={styles.terminal}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            whileHover={{ boxShadow: "var(--shadow-xl), var(--shadow-glow-strong)" }}
          >
            <div className={styles.terminalHeader}>
              <div className={styles.terminalDots}>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 15 }}
                />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 15 }}
                />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
                />
              </div>
              <span className={styles.terminalTitle}>terminal</span>
            </div>
            <div className={styles.terminalBody}>
              {QUICK_START.map((step, i) => (
                <motion.div
                  key={i}
                  className={styles.terminalLine}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
                >
                  <span className={styles.prompt}>$</span>
                  <span className={styles.command}>{step.cmd}</span>
                  <span className={styles.comment}>{step.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.ctaSection} id="cta">
        <motion.div className={styles.sectionWrapper} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={containerVariants}>
          <motion.div
            className={styles.ctaCard}
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            whileHover={{ boxShadow: "var(--shadow-xl), var(--shadow-glow-strong)" }}
          >
            <motion.h2
              className={styles.ctaTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Ready to try it?
            </motion.h2>
            <motion.p
              className={styles.ctaDesc}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Launch DevTool and fetch your first repo or job listing in seconds.
            </motion.p>
            <motion.div className={styles.ctaButtons} initial="hidden" animate="visible" variants={containerVariants}>
              <motion.button
                className={`${styles.cta} ${styles.ctaPrimary}`}
                onClick={() => onNavigate("features")}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
                  transition={{ delay: 0.1, type: "spring" }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </motion.svg>
                <span>Start Exploring</span>
              </motion.button>
              <motion.button
                className={`${styles.cta} ${styles.ctaSecondary}`}
                onClick={() => onNavigate("about")}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <span>Learn More</span>
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
                  transition={{ delay: 0.1, type: "spring" }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </motion.svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}