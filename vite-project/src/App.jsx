import { useState, Suspense, lazy } from "react";
import styles from "./App.module.css";

const LandingPage = lazy(() => import("./components/LandingPage").then(m => ({ default: m.LandingPage })));
const GitHubRepos = lazy(() => import("./components/GitHubRepos").then(m => ({ default: m.GitHubRepos })));
const JobSearch = lazy(() => import("./components/JobSearch").then(m => ({ default: m.JobSearch })));
const _FeaturesPage = lazy(() => import("./components/FeaturesPage").then(m => ({ default: m.FeaturesPage })));
const _AboutPage = lazy(() => import("./components/AboutPage").then(m => ({ default: m.AboutPage })));

const TABS = [
  { key: "github", label: "GitHub Repos" },
  { key: "jobs", label: "Job Search" },
];

function LoadingFallback() {
  return (
    <div className={styles.loading} aria-live="polite">
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
      <span className={styles.loadingDot} />
      Loading...
    </div>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState("github");
  const [showLanding, setShowLanding] = useState(true);

  function handleEnter(tab) {
    setActiveTab(tab);
    setShowLanding(false);
  }

  function handleBackToLanding() {
    setShowLanding(true);
  }

  if (showLanding) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage onEnter={handleEnter} />
      </Suspense>
    );
  }

  return (
    <div className={styles.app}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <header className={styles.header}>
        <h1 className={styles.title}>DevTool</h1>
        <p className={styles.subtitle}>
          Repo browser & job search in one place
        </p>
      </header>

      <nav className={styles.tabs} role="tablist" aria-label="Main navigation">
        <button
          className={styles.backButton}
          onClick={handleBackToLanding}
          aria-label="Back to landing page"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.key)}
              className={`${styles.tab}${active ? ` ${styles.tabActive}` : ""}`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <main id="main-content" className={styles.panel} key={activeTab} role="tabpanel">
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === "github" ? <GitHubRepos /> : <JobSearch />}
        </Suspense>
      </main>
    </div>
  );
}