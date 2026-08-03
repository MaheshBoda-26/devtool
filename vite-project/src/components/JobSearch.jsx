import { useEffect, useRef, useState } from "react";
import { isAdzunaConfigured, searchJobs } from "../services/adzuna";
import { JobFilters } from "./JobFilters";
import { MemoizedJobCard as JobCard } from "./JobCard";
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

export function JobSearch() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [jobs, setJobs] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  async function fetchJobs(opts) {
    if (!isAdzunaConfigured()) {
      setError("Adzuna API is not configured. Set VITE_ADZUNA_APP_ID and VITE_ADZUNA_APP_KEY in your .env file.");
      return;
    }
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
      if (mountedRef.current) {
        setJobs(data.results);
        setCount(data.count);
      }
    } catch (e) {
      if (mountedRef.current) {
        setJobs([]);
        setCount(0);
        setError(e?.message ?? "Failed to fetch jobs");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    fetchJobs(DEFAULT_FILTERS);
    return () => { mountedRef.current = false; };
  }, []);

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

  const totalPages = Math.min(Math.ceil(count / 20), 100);

  return (
    <section className={styles.section} data-slot="job-search">
      <h2 className={styles.title}>Job Search</h2>
      <p className={styles.subtitle}>Powered by Adzuna API</p>

      <JobFilters filters={filters} onChange={setFilters} onSubmit={handleSubmit} />

      {error ? (
        <div className={styles.error} role="alert" aria-live="assertive">
          <strong>Error:</strong> {error}
        </div>
      ) : null}

      {loading ? (
        <div className={styles.loading} aria-live="polite" aria-busy="true">
          <span className={styles.loadingDot} aria-hidden="true" />
          <span className={styles.loadingDot} aria-hidden="true" />
          <span className={styles.loadingDot} aria-hidden="true" />
          Loading jobs...
        </div>
      ) : null}

      {!loading && !error && jobs.length === 0 ? (
        <p className={styles.empty} aria-live="polite">No jobs found. Try adjusting your filters.</p>
      ) : null}

      {!loading && jobs.length > 0 ? (
        <>
          <p className={styles.resultCount} aria-live="polite">
            {count.toLocaleString()} job{count !== 1 ? "s" : ""} found
          </p>
          <ul className={styles.list} role="list" aria-label="Job listings">
            {jobs.map((job, i) => (
              <JobCard key={job.id ?? i} job={job} />
            ))}
          </ul>

          {totalPages > 1 ? (
            <div className={styles.pagination} role="navigation" aria-label="Pagination">
              <button
                disabled={filters.page <= 1}
                onClick={() => goToPage(filters.page - 1)}
                className={styles.pageBtn}
                aria-label="Previous page"
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
                      aria-label={`Page ${page}`}
                      aria-current={page === filters.page ? "page" : undefined}
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
                aria-label="Next page"
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