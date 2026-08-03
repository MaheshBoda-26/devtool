import { memo } from "react";
import PropTypes from "prop-types";
import styles from "./JobCard.module.css";

/**
 * JobCard component - displays a job listing with title, company, location, salary, description, and metadata
 * @param {Object} props - Component props
 * @param {Object} props.job - Job data object from Adzuna API
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element}
 */
export function JobCard({ job, className }) {
  const cardClasses = `${styles.card} ${className ?? ""}`.trim();
  const salary = formatSalary(job);
  const location = job.location?.display_name;
  const contractType = job.contract_type;
  const contractTime = job.contract_time;

  return (
    <li>
      <a
        href={job.redirect_url}
        target="_blank"
        rel="noreferrer noopener"
        className={cardClasses}
        data-slot="job-card"
      >
        <div className={styles.header}>
          <span className={styles.title}>{job.title}</span>
          {salary && <span className={styles.salary}>{salary}</span>}
        </div>

        <div className={styles.meta}>
          <span className={styles.company}>
            {job.company?.display_name ?? "Unknown company"}
          </span>
          {location && (
            <span className={styles.location}>{location}</span>
          )}
        </div>

        {job.description && (
          <p
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: stripHtml(job.description, 280),
            }}
          />
        )}

        <div className={styles.tags}>
          <span className={styles.tag}>
            <span className={styles.tagLabel}>Posted:</span>
            <span className={styles.tagValue}>
              {formatDate(job.created) ?? "Unknown date"}
            </span>
          </span>
          {contractType && (
            <span className={styles.tag}>
              <span className={styles.tagLabel}>Contract:</span>
              <span className={styles.tagValue}>{contractType}</span>
            </span>
          )}
          {contractTime && (
            <span className={styles.tag}>
              <span className={styles.tagLabel}>Hours:</span>
              <span className={styles.tagValue}>{contractTime}</span>
            </span>
          )}
        </div>
      </a>
    </li>
  );
}

JobCard.propTypes = {
  job: PropTypes.shape({
    title: PropTypes.string.isRequired,
    redirect_url: PropTypes.string.isRequired,
    company: PropTypes.shape({
      display_name: PropTypes.string,
    }),
    location: PropTypes.shape({
      display_name: PropTypes.string,
    }),
    salary_min: PropTypes.number,
    salary_max: PropTypes.number,
    description: PropTypes.string,
    created: PropTypes.string,
    contract_type: PropTypes.string,
    contract_time: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
};

/**
 * Formats salary range for display
 * @param {Object} job - Job object with salary_min and salary_max
 * @returns {string|null} Formatted salary string or null if no salary data
 */
function formatSalary(job) {
  const min = job?.salary_min;
  const max = job?.salary_max;
  if (!min && !max) return null;
  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : n;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
}

/**
 * Formats ISO date string to localized date
 * @param {string} iso - ISO date string
 * @returns {string|null} Formatted date or null if invalid
 */
function formatDate(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

/**
 * Strips HTML tags and truncates text
 * @param {string} html - HTML string
 * @param {number} maxLength - Maximum length of output
 * @returns {string} Cleaned and truncated text
 */
function stripHtml(html, maxLength) {
  if (!html) return "";
  const stripped = html
    .replace(/<[^>]*>/g, "")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export const MemoizedJobCard = memo(JobCard);