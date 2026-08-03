import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GitHubRepos from '../components/GitHubRepos'

describe('GitHubRepos', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders title and subtitle', () => {
    render(<GitHubRepos />)

    expect(screen.getByText('GitHub Repo Retriever')).toBeInTheDocument()
    expect(screen.getByText(/Enter a GitHub username to fetch their public repositories/)).toBeInTheDocument()
  })

  it('renders input with default value octocat', () => {
    render(<GitHubRepos />)

    const input = screen.getByPlaceholderText('github username')
    expect(input).toHaveValue('octocat')
  })

  it('renders submit button', () => {
    render(<GitHubRepos />)

    expect(screen.getByRole('button', { name: 'Fetch Repos' })).toBeInTheDocument()
  })

  it('disables button when input is empty', () => {
    render(<GitHubRepos />)

    const input = screen.getByPlaceholderText('github username')
    const button = screen.getByRole('button', { name: 'Fetch Repos' })

    act(() => {
      fireEvent.change(input, { target: { value: '' } })
    })
    expect(button).toBeDisabled()
  })

  it('enables button when input has value', () => {
    render(<GitHubRepos />)

    const input = screen.getByPlaceholderText('github username')
    const button = screen.getByRole('button', { name: 'Fetch Repos' })

    act(() => {
      fireEvent.change(input, { target: { value: 'testuser' } })
    })
    expect(button).not.toBeDisabled()
  })

  it('fetches repos on submit', async () => {
    const mockRepos = [
      { id: 1, name: 'repo1', html_url: 'https://github.com/test/repo1', stargazers_count: 10, description: 'Test repo', language: 'JavaScript', forks_count: 5, size: 100 },
      { id: 2, name: 'repo2', html_url: 'https://github.com/test/repo2', stargazers_count: 20, description: 'Another repo', language: 'TypeScript', forks_count: 3, size: 200 },
    ]

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    })

    render(<GitHubRepos />)

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const button = screen.getByRole('button', { name: 'Fetch Repos' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('repo1')).toBeInTheDocument()
      expect(screen.getByText('repo2')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.github.com/users/octocat/repos?per_page=100',
      { headers: { Accept: 'application/vnd.github+json' } }
    )
  })

  it('shows loading state while fetching', async () => {
    let resolveFetch
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve
    })
    global.fetch.mockReturnValueOnce(fetchPromise)

    render(<GitHubRepos />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const button = screen.getByRole('button', { name: 'Fetch Repos' })
    await act(async () => {
      fireEvent.click(button)
    })

    expect(screen.getByText('Fetching...')).toBeInTheDocument()
    expect(screen.getByText(/Loading repositories/)).toBeInTheDocument()

    resolveFetch({
      ok: true,
      json: () => Promise.resolve([]),
    })

    await waitFor(() => {
      expect(screen.queryByText('Fetching...')).not.toBeInTheDocument()
    })
  })

  it('shows error on fetch failure', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    render(<GitHubRepos />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const button = screen.getByRole('button', { name: 'Fetch Repos' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
      expect(screen.getByText('Failed to fetch repositories')).toBeInTheDocument()
    })
  })

  it('shows error on non-ok response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () => Promise.resolve('Not Found'),
    })

    render(<GitHubRepos />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const button = screen.getByRole('button', { name: 'Fetch Repos' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument()
      expect(screen.getByText('GitHub API error')).toBeInTheDocument()
    })
  })

  it('shows empty state when no repos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    })

    render(<GitHubRepos />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const button = screen.getByRole('button', { name: 'Fetch Repos' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('No repositories found.')).toBeInTheDocument()
    })
  })

  it('renders repo cards with correct data', async () => {
    const mockRepos = [
      { id: 1, name: 'awesome-repo', html_url: 'https://github.com/test/awesome-repo', stargazers_count: 1500, description: 'An awesome repository', language: 'Python', forks_count: 300, size: 5000 },
    ]

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    })

    render(<GitHubRepos />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const button = screen.getByRole('button', { name: 'Fetch Repos' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('awesome-repo')).toBeInTheDocument()
      expect(screen.getByText('An awesome repository')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.getByText('Forks')).toBeInTheDocument()
      expect(screen.getByText('300')).toBeInTheDocument()
      expect(screen.getByText('Size')).toBeInTheDocument()
      expect(screen.getByText('5,000 KB')).toBeInTheDocument()
    })

    const link = screen.getByRole('link', { name: 'awesome-repo' })
    expect(link).toHaveAttribute('href', 'https://github.com/test/awesome-repo')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
  })

  it('shows "No description" when repo has no description', async () => {
    const mockRepos = [
      { id: 1, name: 'no-desc', html_url: 'https://github.com/test/no-desc', stargazers_count: 0, description: null, language: 'JavaScript', forks_count: 0, size: 100 },
    ]

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    })

    render(<GitHubRepos />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const button = screen.getByRole('button', { name: 'Fetch Repos' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('No description')).toBeInTheDocument()
    })
  })

  it('shows "Unknown" when repo has no language', async () => {
    const mockRepos = [
      { id: 1, name: 'no-lang', html_url: 'https://github.com/test/no-lang', stargazers_count: 0, description: 'Test', language: null, forks_count: 0, size: 100 },
    ]

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    })

    render(<GitHubRepos />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const button = screen.getByRole('button', { name: 'Fetch Repos' })
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })
  })

  it('fetches on Enter key in input', async () => {
    const mockRepos = [{ id: 1, name: 'repo1', html_url: 'https://github.com/test/repo1', stargazers_count: 0, description: 'Test', language: 'JS', forks_count: 0, size: 100 }]
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    })

    render(<GitHubRepos />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const input = screen.getByPlaceholderText('github username')
    await userEvent.type(input, 'testuser{enter}')

    await waitFor(() => {
      expect(screen.getByText('repo1')).toBeInTheDocument()
    })
  })
})