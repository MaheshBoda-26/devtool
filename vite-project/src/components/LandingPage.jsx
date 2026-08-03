import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import ParticleField from "./ParticleField";
import styles from "./LandingPages.module.css";

function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => {
      setHasError(true);
    };

    const handleUnhandledRejection = () => {
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return fallback;
  }

  return children;
}

// Code-split heavy pages
const HomePage = lazy(() => import("./HomePage"));
const FeaturesPage = lazy(() => import("./FeaturesPage"));
const AboutPage = lazy(() => import("./AboutPage"));

const PAGES = [
  { key: "home", label: "Home", icon: "home" },
  { key: "features", label: "Features", icon: "features" },
  { key: "about", label: "About", icon: "about" },
];

const ICONS = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  features: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  about: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  ),
};

function renderPage(pageKey, navigate) {
  switch (pageKey) {
    case "features":
      return (
        <Suspense fallback={<div className={styles.page} aria-busy="true">Loading...</div>}>
          <FeaturesPage onNavigate={navigate} key="features" />
        </Suspense>
      );
    case "about":
      return (
        <Suspense fallback={<div className={styles.page} aria-busy="true">Loading...</div>}>
          <AboutPage onNavigate={navigate} key="about" />
        </Suspense>
      );
    case "home":
    default:
      return (
        <Suspense fallback={<div className={styles.page} aria-busy="true">Loading...</div>}>
          <HomePage onNavigate={navigate} key="home" />
        </Suspense>
      );
  }
}

export function LandingPage({ onEnter }) {
  const [activePage, setActivePage] = useState("home");
  const [pageTransition, setPageTransition] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const pageKeys = PAGES.map(p => p.key);
  const currentIndex = pageKeys.indexOf(activePage);

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useCallback((pageKey) => {
    if (pageKey === "github" || pageKey === "jobs") {
      onEnter(pageKey);
      return;
    }

    const newIndex = pageKeys.indexOf(pageKey);
    if (newIndex === -1 || newIndex === currentIndex) return;

    setTransitionDirection(newIndex > currentIndex ? 1 : -1);
    setPageTransition(true);

    setTimeout(() => {
      setActivePage(pageKey);
      setPageTransition(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 180);
  }, [currentIndex, onEnter, pageKeys]);

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    if (e.key === "ArrowRight" && currentIndex < pageKeys.length - 1) {
      navigate(pageKeys[currentIndex + 1]);
    } else if (e.key === "ArrowLeft" && currentIndex > 0) {
      navigate(pageKeys[currentIndex - 1]);
    }
  }, [currentIndex, navigate, pageKeys]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.landingWrapper} data-slot="landing-page">
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      <ErrorBoundary fallback={<div className={styles.errorFallback}>Failed to load background</div>}>
        <ParticleField />
      </ErrorBoundary>

      <nav
        className={`${styles.nav} ${navScrolled ? styles.scrolled : ""}`}
        role="navigation"
        aria-label="Landing page navigation"
      >
        <div className={styles.navInner}>
          <a href="#" className={styles.navBrand} onClick={(e) => { e.preventDefault(); navigate("home"); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span>DevTool</span>
          </a>

          <div className={styles.navLinks} role="tablist">
            {PAGES.map((page) => (
              <button
                key={page.key}
                role="tab"
                aria-selected={activePage === page.key}
                className={`${styles.navLink} ${activePage === page.key ? styles.navLinkActive : ""}`}
                onClick={() => navigate(page.key)}
              >
                {ICONS[page.icon]}
                <span>{page.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.navActions}>
            <button
              className={`${styles.cta} ${styles.ctaGhost} ${styles.navCta}`}
              onClick={() => onEnter("github")}
              aria-label="Open GitHub Repos tool"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
              <span>GitHub</span>
            </button>
            <button
              className={`${styles.cta} ${styles.ctaPrimary} ${styles.navCta}`}
              onClick={() => onEnter("jobs")}
              aria-label="Open Job Search tool"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Jobs</span>
            </button>
          </div>
        </div>
      </nav>

      <main id="main-content" className={styles.main} role="main">
        <div
          className={`${styles.pageContainer} ${pageTransition ? styles.pageExiting : ""}`}
          style={{
            opacity: pageTransition ? 0 : 1,
            transform: pageTransition
              ? `translateX(${transitionDirection > 0 ? -30 : 30}px) translateY(10px) scale(0.98)`
              : "translateX(0) translateY(0) scale(1)",
            transition: pageTransition
              ? "opacity 180ms cubic-bezier(0.4, 0, 0.2, 1), transform 180ms cubic-bezier(0.4, 0, 0.2, 1)"
              : "opacity 250ms cubic-bezier(0.4, 0, 0.2, 1), transform 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {renderPage(activePage, navigate)}
        </div>
      </main>
    </div>
  );
}