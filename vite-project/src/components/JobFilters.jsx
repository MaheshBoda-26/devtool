import { COUNTRY_OPTIONS } from "../services/adzuna";

const SORT_OPTIONS = [
  { value: "", label: "Relevance" },
  { value: "date", label: "Date" },
  { value: "salary", label: "Salary" },
  { value: "relevance", label: "Relevance" },
];

const filterStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-xs)",
};
const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};
const inputStyle = {
  fontFamily: "inherit",
  fontSize: "0.875rem",
  color: "var(--ink)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 12px",
};
const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.8125rem",
  color: "var(--ink-dim)",
  cursor: "pointer",
  userSelect: "none",
};
const wrapper = {
  display: "grid",
  gap: "var(--space-md)",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  padding: "var(--space-lg)",
  border: "1px solid var(--border-faint)",
  borderRadius: "var(--radius-lg)",
  background: "var(--surface)",
  marginBottom: "var(--space-lg)",
};
const bar = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--space-lg)",
  alignItems: "center",
  gridColumn: "1 / -1",
  paddingTop: "var(--space-xs)",
};

export default function JobFilters({ filters, onChange, onSubmit }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <form onSubmit={onSubmit} style={wrapper}>
      <div style={filterStyle}>
        <span style={labelStyle}>Keyword</span>
        <input
          value={filters.what}
          onChange={(e) => update("what", e.target.value)}
          placeholder="e.g. react developer"
          style={inputStyle}
        />
      </div>

      <div style={filterStyle}>
        <span style={labelStyle}>Location</span>
        <input
          value={filters.where}
          onChange={(e) => update("where", e.target.value)}
          placeholder="e.g. London"
          style={inputStyle}
        />
      </div>

      <div style={filterStyle}>
        <span style={labelStyle}>Country</span>
        <select
          value={filters.country}
          onChange={(e) => update("country", e.target.value)}
          style={{
            ...inputStyle,
            appearance: "none",
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: "36px",
          }}
        >
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div style={filterStyle}>
        <span style={labelStyle}>Sort by</span>
        <select
          value={filters.sortBy}
          onChange={(e) => update("sortBy", e.target.value)}
          style={{
            ...inputStyle,
            appearance: "none",
            backgroundImage:
              `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            paddingRight: "36px",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={filterStyle}>
        <span style={labelStyle}>Min salary</span>
        <input
          type="number"
          min="0"
          value={filters.minSalary}
          onChange={(e) => update("minSalary", e.target.value)}
          placeholder="any"
          style={inputStyle}
        />
      </div>

      <div style={filterStyle}>
        <span style={labelStyle}>Max salary</span>
        <input
          type="number"
          min="0"
          value={filters.maxSalary}
          onChange={(e) => update("maxSalary", e.target.value)}
          placeholder="any"
          style={inputStyle}
        />
      </div>

      <div style={bar}>
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={filters.fullTime}
            onChange={(e) => update("fullTime", e.target.checked)}
          />
          Full-time
        </label>
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={filters.partTime}
            onChange={(e) => update("partTime", e.target.checked)}
          />
          Part-time
        </label>
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={filters.permanent}
            onChange={(e) => update("permanent", e.target.checked)}
          />
          Permanent
        </label>
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={filters.contract}
            onChange={(e) => update("contract", e.target.checked)}
          />
          Contract
        </label>

        <button
          type="submit"
          style={{
            padding: "10px 16px",
            background: "var(--primary)",
            color: "oklch(1 0 none)",
            fontWeight: 600,
            fontSize: "0.875rem",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            marginLeft: "auto",
          }}
        >
          Search jobs
        </button>
      </div>
    </form>
  );
}