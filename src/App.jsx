import { useState } from "react";
import GitHubRepos from "./components/GitHubRepos";
import JobSearch from "./components/JobSearch";
import styles from "./App.module.css";

const TABS = [
  { key: "github", label: "GitHub Repos" },
  { key: "jobs", label: "Job Search" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("github");

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>DevTool</h1>
        <p className={styles.subtitle}>
          Repo browser & job search in one place
        </p>
      </header>

      <nav className={styles.tabs}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${styles.tab}${active ? ` ${styles.tabActive}` : ""}`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className={styles.panel} key={activeTab}>
        {activeTab === "github" ? <GitHubRepos /> : null}
        {activeTab === "jobs" ? <JobSearch /> : null}
      </div>
    </div>
  );
}