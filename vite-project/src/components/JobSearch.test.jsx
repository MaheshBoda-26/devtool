import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the adzuna service at module level
vi.mock('../services/adzuna', () => ({
  searchJobs: vi.fn(),
  isAdzunaConfigured: vi.fn(),
  COUNTRY_OPTIONS: [
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
  ],
}))

import { searchJobs, isAdzunaConfigured } from '../services/adzuna'
import { JobSearch } from '../components/JobSearch'

describe('JobSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_ADZUNA_APP_ID', 'test-id')
    vi.stubEnv('VITE_ADZUNA_APP_KEY', 'test-key')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows not configured message when API not configured', async () => {
    isAdzunaConfigured.mockReturnValue(false)
    searchJobs.mockResolvedValue({ results: [], count: 0 })

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText(/Adzuna API is not configured/)).toBeInTheDocument()
    }, { timeout: 10000 })
  })

  it('renders filters and calls fetch on mount when configured', async () => {
    isAdzunaConfigured.mockReturnValue(true)
    searchJobs.mockResolvedValue({ results: [], count: 0 })

    render(<JobSearch />)

    expect(screen.getByPlaceholderText('e.g. react developer')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. London')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search jobs' })).toBeInTheDocument()

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalled()
    }, { timeout: 10000 })
  })

  it('shows loading state', async () => {
    isAdzunaConfigured.mockReturnValue(true)
    let resolveSearch
    searchJobs.mockImplementation(() => new Promise(r => { resolveSearch = r }))

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText(/Loading jobs/)).toBeInTheDocument()
    }, { timeout: 10000 })

    resolveSearch({ results: [], count: 0 })
    await waitFor(() => {
      expect(screen.queryByText(/Loading jobs/)).not.toBeInTheDocument()
    }, { timeout: 10000 })
  })

  it('shows error on search failure', async () => {
    isAdzunaConfigured.mockReturnValue(true)
    searchJobs.mockImplementation(() => Promise.reject(new Error('API Error')))

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
      expect(screen.getByText('API Error')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('shows empty state when no jobs found', async () => {
    isAdzunaConfigured.mockReturnValue(true)
    searchJobs.mockResolvedValue({ results: [], count: 0 })

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText('No jobs found. Try adjusting your filters.')).toBeInTheDocument()
    }, { timeout: 10000 })
  })

  it('renders job results with count', async () => {
    isAdzunaConfigured.mockReturnValue(true)
    const mockJobs = [
      { id: '1', title: 'Job 1', redirect_url: 'https://adzuna.com/1', company: { display_name: 'Co1' }, location: { display_name: 'Loc1' }, created: '2024-01-01', salary_min: 50000, salary_max: 60000 },
      { id: '2', title: 'Job 2', redirect_url: 'https://adzuna.com/2', company: { display_name: 'Co2' }, location: { display_name: 'Loc2' }, created: '2024-01-02', salary_min: 70000, salary_max: 80000 },
    ]

    searchJobs.mockResolvedValue({ results: mockJobs, count: 42 })
    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText('42 jobs found')).toBeInTheDocument()
      expect(screen.getByText('Job 1')).toBeInTheDocument()
      expect(screen.getByText('Job 2')).toBeInTheDocument()
    }, { timeout: 10000 })
  })

  it('shows pagination when more than one page', async () => {
    isAdzunaConfigured.mockReturnValue(true)
    const mockJobs = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      title: `Job ${i}`,
      redirect_url: `https://adzuna.com/${i}`,
      company: { display_name: 'Co' },
      location: { display_name: 'Loc' },
      created: '2024-01-01',
    }))

    searchJobs.mockResolvedValue({ results: mockJobs, count: 42 })
    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText('42 jobs found')).toBeInTheDocument()
    }, { timeout: 15000 })

    await waitFor(() => {
      expect(screen.getByText('Job 0')).toBeInTheDocument()
    }, { timeout: 15000 })

    await waitFor(() => {
      const pagination = screen.getByRole('navigation', { name: 'Pagination' })
      expect(pagination).toBeInTheDocument()
    }, { timeout: 15000 })

    await waitFor(() => {
      expect(screen.getByText('Prev')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
    }, { timeout: 15000 })
  })

  it('calls searchJobs with updated filters on submit', async () => {
    isAdzunaConfigured.mockReturnValue(true)
    searchJobs.mockResolvedValue({ results: [], count: 0 })

    render(<JobSearch />)

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalled()
    }, { timeout: 10000 })

    vi.clearAllMocks()

    const keywordInput = screen.getByPlaceholderText('e.g. react developer')
    await userEvent.type(keywordInput, 'react developer')

    const searchButton = screen.getByRole('button', { name: 'Search jobs' })
    await userEvent.click(searchButton)

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({ what: 'react developer', page: 1 })
      )
    }, { timeout: 10000 })
  })

  it('navigates pages', async () => {
    isAdzunaConfigured.mockReturnValue(true)
    const mockJobs = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      title: `Job ${i}`,
      redirect_url: `https://adzuna.com/${i}`,
      company: { display_name: 'Co' },
      location: { display_name: 'Loc' },
      created: '2024-01-01',
    }))

    searchJobs.mockResolvedValue({ results: mockJobs, count: 42 })

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    }, { timeout: 15000 })

    await userEvent.click(screen.getByText('2'))

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    }, { timeout: 15000 })
  })
})