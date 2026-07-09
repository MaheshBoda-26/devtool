# DevTool

A dual-purpose React utility app — fetch GitHub repositories by username and search Adzuna job listings across 19 countries. Dark mode by default, built with Vite + React.

# Example for GitHub Repo Retriever

<img width="3380" height="2722" alt="Screenshot from GoFullPage July 9 2026 (1)" src="https://github.com/user-attachments/assets/c0f8efd5-71c6-474c-93a7-cb31c84cbea7" />

# Example for Job Search

<img width="977" height="901" alt="Screenshot 2026-07-09 at 11 58 43 AM" src="https://github.com/user-attachments/assets/c3ce0ef4-7942-4289-a003-682bfeb2b45c" />



## Features

- **GitHub Repo Retriever** — Fetch any user's public repos (stars, forks, language, description)
- **Job Search (Adzuna API)** — Keyword + location + country + salary range + contract type filtering with pagination
- Dark-first design with oxidized teal accent
- Responsive layout (desktop + mobile)
- Tab-based navigation between tools

## Prerequisites

- Node.js 18+ and npm
- An Adzuna API key and app ID (for job search only)

## Installation

```bash
git clone <your-repo-url>
cd vite-project
npm install
```

## Environment Setup

Create a `.env` file in the project root:

```env
VITE_ADZUNA_APP_ID=your_app_id_here
VITE_ADZUNA_APP_KEY=your_api_key_here
```

Get your credentials at [developer.adzuna.com](https://developer.adzuna.com). The GitHub tab works without any API keys.

## Running

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

### GitHub Tab (default)

1. Enter a GitHub username in the search field
2. Click **Fetch Repos**
3. Browse the repo list — click any repo name to open it on GitHub

### Job Search Tab

1. Click **Job Search** tab
2. Fill in optional filters: keyword, location, country, salary range, contract type
3. Click **Search jobs**
4. Click any job title to open the full listing on Adzuna

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview production build |

## Tech Stack

- **React 19** with hooks
- **Vite 8** — dev server + bundler
- **oxlint** — fast linter
- **CSS Modules** — scoped component styles
- **OKLCH color system** — dark-mode design tokens
