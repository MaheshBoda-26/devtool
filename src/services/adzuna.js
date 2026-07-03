const APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const APP_KEY = import.meta.env.VITE_ADZUNA_APP_KEY;
const BASE_URL = "https://api.adzuna.com/v1/api/jobs";

export const COUNTRY_OPTIONS = [
  { code: "gb", label: "United Kingdom" },
  { code: "us", label: "United States" },
  { code: "au", label: "Australia" },
  { code: "at", label: "Austria" },
  { code: "be", label: "Belgium" },
  { code: "br", label: "Brazil" },
  { code: "ca", label: "Canada" },
  { code: "ch", label: "Switzerland" },
  { code: "de", label: "Germany" },
  { code: "es", label: "Spain" },
  { code: "fr", label: "France" },
  { code: "in", label: "India" },
  { code: "it", label: "Italy" },
  { code: "mx", label: "Mexico" },
  { code: "nl", label: "Netherlands" },
  { code: "nz", label: "New Zealand" },
  { code: "pl", label: "Poland" },
  { code: "sg", label: "Singapore" },
  { code: "za", label: "South Africa" },
];

function isValidCred(value) {
  return Boolean(value) && value.length > 0 && !value.includes("your_") && !value.includes("placeholder");
}

export function isAdzunaConfigured() {
  return isValidCred(APP_ID) && isValidCred(APP_KEY);
}

function buildUrl(country, page = 1, params = {}) {
  if (!isAdzunaConfigured()) {
    throw new Error(
      "Adzuna API is not configured. Set VITE_ADZUNA_APP_ID and VITE_ADZUNA_APP_KEY in your .env file."
    );
  }

  const url = new URL(`${BASE_URL}/${country}/search/${page}`);
  url.searchParams.set("app_id", APP_ID);
  url.searchParams.set("app_key", APP_KEY);
  url.searchParams.set("results_per_page", "20");

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function searchJobs({
  country = "gb",
  what = "",
  where = "",
  page = 1,
  fullTime,
  partTime,
  permanent,
  contract,
  maxSalary,
  minSalary,
  sortBy,
} = {}) {
  const params = {
    what,
    where,
    full_time: fullTime ? 1 : undefined,
    part_time: partTime ? 1 : undefined,
    permanent: permanent ? 1 : undefined,
    contract: contract ? 1 : undefined,
    max_salary: maxSalary,
    min_salary: minSalary,
    sort_by: sortBy,
  };

  const url = buildUrl(country, page, params);
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.exception || body?.display || "";
    } catch {
      detail = await res.text().catch(() => "");
    }
    throw new Error(
      `Adzuna API error (${res.status}${detail ? `): ${detail}` : ")"})`
    );
  }

  const data = await res.json();
  return {
    results: Array.isArray(data?.results) ? data.results : [],
    count: data?.count ?? 0,
  };
}

export async function fetchCategoriesTop(country = "gb") {
  if (!isValidCred(APP_ID) || !isValidCred(APP_KEY)) return [];
  const url = `${BASE_URL}/${country}/categories`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return Object.entries(data?.results ?? {}).map(([tag, label]) => ({
    tag,
    label,
  }));
}
