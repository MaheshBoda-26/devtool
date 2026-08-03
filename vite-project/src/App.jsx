import { useState, Suspense, lazy } from "react";
import styles from "./App.module.css";

const LandingPage = lazy(() => import("./components/LandingPage"));
const GitHubRepos = lazy(() => import("./components/GitHubRepos"));
const JobSearch = lazy(() => import("./components/JobSearch"));
const FeaturesPage = lazy(() => import("./components/FeaturesPage"));
const AboutPage = lazy(() => import("./components/AboutPage"));

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