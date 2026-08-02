import { useEffect, useMemo, useState } from "react";
import styles from "./GitHubRepos.module.css";

export default function GitHubRepos() {
  const [username, setUsername] = useState("octocat");
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canFetch = useMemo(() => username.trim().length > 0, [username]);

  async function fetchRepos(user) {
    const trimmed = user.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://api.github.com/users/${trimmed}/repos?per_page=100`,
        { headers: { Accept: "application/vnd.github+json" } }
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `GitHub API error (${res.status}${text ? `): ${text}` : ")"}`
        );
      }

      const data = await res.json();
      setRepos(Array.isArray(data) ? data : []);
    } catch (e) {
      setRepos([]);
      setError(e?.message ?? "Failed to fetch repositories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canFetch) fetchRepos(username);
  }, [canFetch, username]);

  function onSubmit(e) {
    e.preventDefault();
    fetchRepos(username);
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>GitHub Repo Retriever</h2>
      <p className={styles.subtitle}>
        Enter a GitHub username to fetch their public repositories.
      </p>

      <form onSubmit={onSubmit} className={styles.form}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="github username"
          className={styles.input}
        />
        <button
          type="submit"
          disabled={!canFetch || loading}
          className={`${styles.submitBtn}${loading ? ` ${styles.submitBtnLoading}` : ""}`}
        >
          {loading ? "Fetching..." : "Fetch Repos"}
        </button>
      </form>

      {error ? (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      ) : null}

      {loading ? (
        <div className={styles.loading}>
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
          Loading repositories...
        </div>
      ) : null}

      {!loading && !error && repos.length === 0 ? (
        <p className={styles.empty}>No repositories found.</p>
      ) : null}

      {!loading && repos.length > 0 ? (
        <ul className={styles.list}>
          {repos.map((repo) => (
              <li key={repo.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.repoLink}
                  >
                    {repo.name}
                  </a>
                  <span className={styles.stars} title="GitHub stars">
                    ★ {repo.stargazers_count?.toLocaleString?.() ?? repo.stargazers_count}
                  </span>
                </div>

                {repo.description ? (
                  <p className={styles.description}>{repo.description}</p>
                ) : (
                  <p className={styles.noDescription}>No description</p>
                )}

                <div className={styles.cardFooter}>
                  <span className={styles.languageTag}>
                    <span className={styles.languageDot} />
                    {repo.language ?? "Unknown"}
                  </span>
                  {typeof repo.forks_count === "number" ? (
                    <span className={styles.metaItem}>
                      <span className={styles.metaLabel}>Forks</span>
                      <span className={styles.metaValue}>
                        {repo.forks_count.toLocaleString?.() ?? repo.forks_count}
                      </span>
                    </span>
                  ) : null}
                  {repo.size ? (
                    <span className={styles.metaItem}>
                      <span className={styles.metaLabel}>Size</span>
                      <span className={styles.metaValue}>
                        {repo.size.toLocaleString?.() ?? repo.size} KB
                      </span>
                    </span>
                  ) : null}
                </div>
              </li>
            )
          )}
        </ul>
      ) : null}
    </section>
  );
}