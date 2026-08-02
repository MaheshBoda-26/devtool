export default function JobCard({ job }) {
  return (
    <li>
      <a
        href={job.redirect_url}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block",
          background: "var(--surface)",
          border: "1px solid var(--border-faint)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-lg)",
          textDecoration: "none",
          transition:
            "border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.background = "var(--surface-raised)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-faint)";
          e.currentTarget.style.background = "var(--surface)";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "var(--space-md)",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: "1.0625rem",
              color: "var(--primary)",
            }}
          >
            {job.title}
          </span>
          {formatSalary(job) ? (
            <span
              style={{
                color: "var(--success)",
                fontSize: "0.875rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {formatSalary(job)}
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            flexWrap: "wrap",
            alignItems: "baseline",
            color: "var(--ink-dim)",
            fontSize: "0.875rem",
            marginTop: "var(--space-sm)",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--ink)" }}>
            {job.company?.display_name ?? "Unknown company"}
          </span>
          {job.location?.display_name ? (
            <span style={{ color: "var(--muted)" }}>
              {job.location.display_name}
            </span>
          ) : null}
        </div>

        {job.description ? (
          <p
            style={{
              color: "var(--ink-dim)",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              margin: "var(--space-md) 0 0",
              maxWidth: "72ch",
            }}
            dangerouslySetInnerHTML={{
              __html: stripHtml(job.description, 280),
            }}
          />
        ) : null}

        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            flexWrap: "wrap",
            color: "var(--muted)",
            fontSize: "0.75rem",
            marginTop: "var(--space-md)",
          }}
        >
          <span>
            Posted: {formatDate(job.created) ?? "Unknown"}
          </span>
          {job.contract_type ? (
            <span>Contract: {job.contract_type}</span>
          ) : null}
          {job.contract_time ? (
            <span>Hours: {job.contract_time}</span>
          ) : null}
        </div>
      </a>
    </li>
  );
}

function formatSalary(job) {
  const min = job?.salary_min;
  const max = job?.salary_max;
  if (!min && !max) return null;
  const fmt = (n) =>
    typeof n === "number"
      ? n.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : n;
  if (min && max) return `${fmt(min)}&nbsp;–&nbsp;${fmt(max)}`;
  return fmt(min || max);
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function stripHtml(html, maxLength) {
  const stripped = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).replace(/\s+\S*$/, "") + "\u2026";
}