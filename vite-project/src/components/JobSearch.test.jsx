import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import JobSearch from '../components/JobSearch'
import * as adzunaService from '../services/adzuna'

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

describe('JobSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.stubEnv('VITE_ADZUNA_APP_ID', 'test-id')
    vi.stubEnv('VITE_ADZUNA_APP_KEY', 'test-key')
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows not configured message when API not configured', () => {
    adzunaService.isAdzunaConfigured.mockReturnValue(false)

    render(<JobSearch />)

    expect(screen.getByText('Job Search')).toBeInTheDocument()
    expect(screen.getByText(/Adzuna API is not configured/)).toBeInTheDocument()
    expect(screen.getByText('VITE_ADZUNA_APP_ID')).toBeInTheDocument()
    expect(screen.getByText('VITE_ADZUNA_APP_KEY')).toBeInTheDocument()
  })

  it('renders filters and calls fetch on mount when configured', async () => {
    adzunaService.isAdzunaConfigured.mockReturnValue(true)
    adzunaService.searchJobs.mockResolvedValue({ results: [], count: 0 })

    render(<JobSearch />)

    expect(screen.getByPlaceholderText('e.g. react developer')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. London')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search jobs' })).toBeInTheDocument()

    await waitFor(() => {
      expect(adzunaService.searchJobs).toHaveBeenCalled()
    })
  })

  it('shows loading state', async () => {
    adzunaService.isAdzunaConfigured.mockReturnValue(true)
    let resolveSearch
    adzunaService.searchJobs.mockImplementation(() => new Promise(r => { resolveSearch = r }))

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText(/Loading jobs/)).toBeInTheDocument()
    })

    resolveSearch({ results: [], count: 0 })
    await waitFor(() => {
      expect(screen.queryByText(/Loading jobs/)).not.toBeInTheDocument()
    })
  })

  it('shows error on search failure', async () => {
    adzunaService.isAdzunaConfigured.mockReturnValue(true)
    adzunaService.searchJobs.mockRejectedValue(new Error('API Error'))

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch jobs')).toBeInTheDocument()
    })
  })

  it('shows empty state when no jobs found', async () => {
    adzunaService.isAdzunaConfigured.mockReturnValue(true)
    adzunaService.searchJobs.mockResolvedValue({ results: [], count: 0 })

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText('No jobs found. Try adjusting your filters.')).toBeInTheDocument()
    })
  })

  it('renders job results with count', async () => {
    const mockJobs = [
      { id: '1', title: 'Job 1', redirect_url: 'https://adzuna.com/1', company: { display_name: 'Co1' }, location: { display_name: 'Loc1' }, created: '2024-01-01', salary_min: 50000, salary_max: 60000 },
      { id: '2', title: 'Job 2', redirect_url: 'https://adzuna.com/2', company: { display_name: 'Co2' }, location: { display_name: 'Loc2' }, created: '2024-01-02', salary_min: 70000, salary_max: 80000 },
    ]

    adzunaService.isAdzunaConfigured.mockReturnValue(true)
    adzunaService.searchJobs.mockResolvedValue({ results: mockJobs, count: 42 })

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByText('42 jobs found')).toBeInTheDocument()
      expect(screen.getByText('Job 1')).toBeInTheDocument()
      expect(screen.getByText('Job 2')).toBeInTheDocument()
    })
  })

  it('shows pagination when more than one page', async () => {
    const mockJobs = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      title: `Job ${i}`,
      redirect_url: `https://adzuna.com/${i}`,
      company: { display_name: 'Co' },
      location: { display_name: 'Loc' },
      created: '2024-01-01',
    }))

    adzunaService.isAdzunaConfigured.mockReturnValue(true)
    adzunaService.searchJobs.mockResolvedValue({ results: mockJobs, count: 42 })

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Prev' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    })
  })

  it('calls searchJobs with updated filters on submit', async () => {
    adzunaService.isAdzunaConfigured.mockReturnValue(true)
    adzunaService.searchJobs.mockResolvedValue({ results: [], count: 0 })

    render(<JobSearch />)

    await waitFor(() => {
      expect(adzunaService.searchJobs).toHaveBeenCalled()
    })

    vi.clearAllMocks()

    const keywordInput = screen.getByPlaceholderText('e.g. react developer')
    await userEvent.type(keywordInput, 'react developer')

    const searchButton = screen.getByRole('button', { name: 'Search jobs' })
    await userEvent.click(searchButton)

    await waitFor(() => {
      expect(adzunaService.searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({ what: 'react developer', page: 1 })
      )
    })
  })

  it('navigates pages', async () => {
    adzunaService.isAdzunaConfigured.mockReturnValue(true)
    adzunaService.searchJobs.mockResolvedValue({ results: [], count: 42 })

    render(<JobSearch />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: '2' }))

    await waitFor(() => {
      expect(adzunaService.searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    })
  })
})