import { useState, useEffect, useRef } from "react";
import ParticleField from "./ParticleField";
import HomePage from "./HomePage";
import FeaturesPage from "./FeaturesPage";
import AboutPage from "./AboutPage";
import styles from "./LandingPages.module.css";

const PAGES = [
  { key: "home", label: "Home", icon: "home" },
  { key: "features", label: "Features", icon: "features" },
  { key: "about", label: "About", icon: "about" },
];

const ICONS = {
  home: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  features: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  about: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  ),
};

export default function LandingPage({ onEnter }) {
  const [activePage, setActivePage] = useState("home");
  const [navVisible, setNavVisible] = useState(false);
  const [pageTransition, setPageTransition] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setNavVisible(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function navigate(pageKey) {
    if (pageKey === "github" || pageKey === "jobs") {
      onEnter(pageKey);
      return;
    }

    setPageTransition(true);
    setTimeout(() => {
      setActivePage(pageKey);
      setPageTransition(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 150);
  }

  function renderPage() {
    switch (activePage) {
      case "features":
        return <FeaturesPage onNavigate={navigate} key="features" />;
      case "about":
        return <AboutPage onNavigate={navigate} key="about" />;
      case "home":
      default:
        return <HomePage onNavigate={navigate} key="home" />;
    }
  }

  return (
    <div className={styles.landingWrapper}>
      <ParticleField />

      <nav
        ref={navRef}
        className={`${styles.nav} ${navVisible ? styles.navVisible : ""} ${pageTransition ? styles.navTransition : ""}`}
        role="navigation"
        aria-label="Landing page navigation"
      >
        <div className={styles.navInner}>
          <a href="#" className={styles.navBrand} onClick={(e) => { e.preventDefault(); navigate("home"); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </button>
            <button
              className={`${styles.cta} ${styles.ctaPrimary} ${styles.navCta}`}
              onClick={() => onEnter("jobs")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

      <main className={styles.main} role="main">
        <div
          className={`${styles.pageContainer} ${pageTransition ? styles.pageExiting : ""}`}
          style={{ opacity: pageTransition ? 0 : 1, transform: pageTransition ? "translateY(10px)" : "translateY(0)" }}
        >
          {renderPage()}
        </div>
      </main>
    </div>
  );
}