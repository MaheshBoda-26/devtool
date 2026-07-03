import { useEffect, useState } from "react";
import { searchJobs, isAdzunaConfigured } from "../services/adzuna";
import JobFilters from "./JobFilters";
import JobCard from "./JobCard";
import styles from "./JobSearch.module.css";

const DEFAULT_FILTERS = {
  country: "gb",
  what: "",
  where: "",
  page: 1,
  fullTime: false,
  partTime: false,
  permanent: false,
  contract: false,
  minSalary: "",
  maxSalary: "",
  sortBy: "",
};

export default function JobSearch() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [jobs, setJobs] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const configured = isAdzunaConfigured();

  async function fetchJobs(opts) {
    setLoading(true);
    setError(null);
    try {
      const data = await searchJobs({
        country: opts.country,
        what: opts.what,
        where: opts.where,
        page: opts.page,
        fullTime: opts.fullTime,
        partTime: opts.partTime,
        permanent: opts.permanent,
        contract: opts.contract,
        maxSalary: opts.maxSalary || undefined,
        minSalary: opts.minSalary || undefined,
        sortBy: opts.sortBy || undefined,
      });
      setJobs(data.results);
      setCount(data.count);
    } catch (e) {
      setJobs([]);
      setCount(0);
      setError(e?.message ?? "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetchJobs({ ...filters, page: 1 });
  }

  function goToPage(page) {
    const next = { ...filters, page };
    setFilters(next);
    fetchJobs(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (configured) fetchJobs(DEFAULT_FILTERS);
  }, [configured]);

  const totalPages = Math.min(Math.ceil(count / 20), 100);

  if (!configured) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Job Search</h2>
        <p className={styles.subtitle}>Powered by Adzuna API</p>
        <div className={styles.notConfigured}>
          Adzuna API is not configured. Set{" "}
          <strong>VITE_ADZUNA_APP_ID</strong> and{" "}
          <strong>VITE_ADZUNA_APP_KEY</strong> in your{" "}
          <code>.env</code> file.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Job Search</h2>
      <p className={styles.subtitle}>Powered by Adzuna API</p>

      <JobFilters filters={filters} onChange={setFilters} onSubmit={handleSubmit} />

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
          Loading jobs...
        </div>
      ) : null}

      {!loading && !error && jobs.length === 0 ? (
        <p className={styles.empty}>No jobs found. Try adjusting your filters.</p>
      ) : null}

      {!loading && jobs.length > 0 ? (
        <>
          <p className={styles.resultCount}>
            {count.toLocaleString()} job{count !== 1 ? "s" : ""} found
          </p>
          <ul className={styles.list}>
            {jobs.map((job, i) => (
              <JobCard key={job.id ?? i} job={job} />
            ))}
          </ul>

          {totalPages > 1 ? (
            <div className={styles.pagination}>
              <button
                disabled={filters.page <= 1}
                onClick={() => goToPage(filters.page - 1)}
                className={styles.pageBtn}
              >
                Prev
              </button>
              {Array.from(
                {
                  length: Math.min(totalPages, 7),
                },
                (_, i) => {
                  let page;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (filters.page <= 4) {
                    page = i + 1;
                  } else if (filters.page >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = filters.page - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`${styles.pageBtn}${
                        page === filters.page ? ` ${styles.pageBtnActive}` : ""
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}
              <button
                disabled={filters.page >= totalPages}
                onClick={() => goToPage(filters.page + 1)}
                className={styles.pageBtn}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}