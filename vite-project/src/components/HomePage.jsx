import { useEffect, useRef, useState } from "react";
import styles from "./LandingPages.module.css";

const VALUE_PROPS = [
  {
    icon: "speed",
    title: "Speed First",
    description: "Sub-100ms interactions. No bloat. Every byte earns its keep.",
    accent: "var(--primary)",
  },
  {
    icon: "focus",
    title: "Zero Friction",
    description: "No auth walls. No signup. Type username or keyword → get results.",
    accent: "var(--primary)",
  },
  {
    icon: "precision",
    title: "Precise Results",
    description: "GitHub API v3 + Adzuna v1. Real data, real-time, no mocking.",
    accent: "var(--primary)",
  },
  {
    icon: "dark",
    title: "Dark Native",
    description: "OKLCH color system. Reduced motion respected. Accessible by default.",
    accent: "var(--primary)",
  },
];

const QUICK_START = [
  { cmd: "git clone <your-repo-url>", desc: "Clone the repository" },
  { cmd: "cd vite-project", desc: "Enter project directory" },
  { cmd: "npm install", desc: "Install dependencies" },
  { cmd: "cp .env.example .env", desc: "Configure Adzuna API (optional)" },
  { cmd: "npm run dev", desc: "Start dev server" },
];

export function HomePage({ onNavigate }) {
  const [visible, setVisible] = useState({});
  const refs = useRef({});
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      Object.keys(refs.current).forEach((key) => {
        setVisible((prev) => ({ ...prev, [key]: true }));
      });
      document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('visible'));
      return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateParallax = () => {
      setParallaxOffset(lastScrollY * 0.15);
      ticking = false;
    };

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        rafRef.current = requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

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
    <div className={styles.page} data-slot="home-page">
      <header className={styles.header} id="home-hero" ref={(el) => (refs.current.hero = el)}>
        <div
          className={styles.parallaxLayer}
          style={{ transform: `translateY(${parallaxOffset}px)` }}
          aria-hidden="true"
        />
        <div className={styles.heroContent}>
          <div className={`${styles.badge} ${visible.hero ? styles.visible : ""} animate-on-scroll`} style={{ animationDelay: "0ms" }}>
            <span className={styles.badgeDot} />
            DevTool — Dual-purpose utility
          </div>

          <h1 className={`${styles.headline} ${visible.hero ? styles.visible : ""} animate-on-scroll`} style={{ animationDelay: "100ms" }}>
            <span className={styles.word}>Repo</span>
            <span className={styles.word}>browser</span>
            <span className={styles.word}>&</span>
            <span className={styles.word}>Job</span>
            <span className={styles.word}>search</span>
            <span className={styles.word}>.</span>
          </h1>

          <p className={`${styles.subhead} ${visible.hero ? styles.visible : ""} animate-on-scroll`} style={{ animationDelay: "250ms" }}>
            A fast, focused developer tool. Fetch GitHub repositories by username and search Adzuna job listings across 19 countries.
            Dark mode by default. Zero friction. Built for developers who value speed and clarity.
          </p>

          <div className={`${styles.heroActions} ${visible.hero ? styles.visible : ""} animate-on-scroll`} style={{ animationDelay: "400ms" }}>
            <button className={`${styles.cta} ${styles.ctaPrimary}`} onClick={() => onNavigate("features")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M19 12H5"/>
              </svg>
              <span>Explore Features</span>
            </button>
            <button className={`${styles.cta} ${styles.ctaSecondary}`} onClick={() => onNavigate("about")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span>Technical Details</span>
            </button>
            <a href="https://github.com" target="_blank" rel="noreferrer" className={`${styles.cta} ${styles.ctaGhost}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>View Source</span>
            </a>
          </div>
        </div>
        <div className={styles.scrollIndicator} aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12H5"/>
          </svg>
        </div>
      </header>

      <section className={`${styles.valueProps} animate-on-scroll`} id="value-props" ref={(el) => (refs.current.valueProps = el)}>
        <div className={styles.sectionWrapper}>
          <h2 className={`${styles.sectionTitle} ${visible["value-props"] ? styles.visible : ""}`}>
            Why DevTool?
          </h2>
          <div className={styles.valueGrid}>
            {VALUE_PROPS.map((prop, i) => (
              <article
                key={prop.title}
                className={`${styles.valueCard} ${visible["value-props"] ? styles.visible : ""}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className={styles.valueIcon}>
                  {prop.icon === "speed" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  )}
                  {prop.icon === "focus" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  )}
                  {prop.icon === "precision" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  )}
                  {prop.icon === "dark" && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </div>
                <h3 className={styles.valueTitle}>{prop.title}</h3>
                <p className={styles.valueDesc}>{prop.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.quickStart} animate-on-scroll`} id="quick-start" ref={(el) => (refs.current.quickStart = el)}>
        <div className={styles.sectionWrapper}>
          <h2 className={`${styles.sectionTitle} ${visible["quick-start"] ? styles.visible : ""}`}>
            Quick Start
          </h2>
          <p className={`${styles.sectionDesc} ${visible["quick-start"] ? styles.visible : ""}`}>
            Get running in under 30 seconds.
          </p>
          <div className={`${styles.terminal} ${visible["quick-start"] ? styles.visible : ""}`} style={{ animationDelay: "100ms" }}>
            <div className={styles.terminalHeader}>
              <div className={styles.terminalDots}>
                <span /><span /><span />
              </div>
              <span className={styles.terminalTitle}>terminal</span>
            </div>
            <div className={styles.terminalBody}>
              {QUICK_START.map((step, i) => (
                <div key={i} className={styles.terminalLine}>
                  <span className={styles.prompt}>$</span>
                  <span className={styles.command}>{step.cmd}</span>
                  <span className={styles.comment}>{step.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.ctaSection} animate-on-scroll`} id="cta" ref={(el) => (refs.current.cta = el)}>
        <div className={styles.sectionWrapper}>
          <div className={`${styles.ctaCard} ${visible.cta ? styles.visible : ""}`}>
            <h2 className={styles.ctaTitle}>Ready to try it?</h2>
            <p className={styles.ctaDesc}>Launch DevTool and fetch your first repo or job listing in seconds.</p>
            <div className={styles.ctaButtons}>
              <button className={`${styles.cta} ${styles.ctaPrimary}`} onClick={() => onNavigate("features")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <span>Start Exploring</span>
              </button>
              <button className={`${styles.cta} ${styles.ctaSecondary}`} onClick={() => onNavigate("about")}>
                <span>Learn More</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}