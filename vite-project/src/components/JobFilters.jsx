import { COUNTRY_OPTIONS } from "../services/adzuna";
import styles from "./JobFilters.module.css";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "salary", label: "Salary" },
];

export function JobFilters({ filters, onChange, onSubmit, className }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <form onSubmit={onSubmit} className={`${styles.wrapper} ${className || ""}`} data-slot="job-filters">
      <div className={styles.filterGroup}>
        <label htmlFor="job-filter-what" className={styles.label}>
          Keyword
        </label>
        <input
          id="job-filter-what"
          value={filters.what}
          onChange={(e) => update("what", e.target.value)}
          placeholder="e.g. react developer"
          className={styles.input}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="job-filter-where" className={styles.label}>
          Location
        </label>
        <input
          id="job-filter-where"
          value={filters.where}
          onChange={(e) => update("where", e.target.value)}
          placeholder="e.g. London"
          className={styles.input}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="job-filter-country" className={styles.label}>
          Country
        </label>
        <select
          id="job-filter-country"
          value={filters.country}
          onChange={(e) => update("country", e.target.value)}
          className={styles.select}
        >
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="job-filter-sort" className={styles.label}>
          Sort by
        </label>
        <select
          id="job-filter-sort"
          value={filters.sortBy}
          onChange={(e) => update("sortBy", e.target.value)}
          className={styles.select}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="job-filter-min-salary" className={styles.label}>
          Min salary
        </label>
        <input
          id="job-filter-min-salary"
          type="number"
          min="0"
          value={filters.minSalary}
          onChange={(e) => update("minSalary", e.target.value)}
          placeholder="any"
          className={styles.input}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="job-filter-max-salary" className={styles.label}>
          Max salary
        </label>
        <input
          id="job-filter-max-salary"
          type="number"
          min="0"
          value={filters.maxSalary}
          onChange={(e) => update("maxSalary", e.target.value)}
          placeholder="any"
          className={styles.input}
        />
      </div>

      <div className={styles.bar}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filters.fullTime}
            onChange={(e) => update("fullTime", e.target.checked)}
          />
          Full-time
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filters.partTime}
            onChange={(e) => update("partTime", e.target.checked)}
          />
          Part-time
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filters.permanent}
            onChange={(e) => update("permanent", e.target.checked)}
          />
          Permanent
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={filters.contract}
            onChange={(e) => update("contract", e.target.checked)}
          />
          Contract
        </label>

        <button type="submit" className={styles.submitButton}>
          Search jobs
        </button>
      </div>
    </form>
  );
}