import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('adzuna service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_ADZUNA_APP_ID', 'test-app-id')
    vi.stubEnv('VITE_ADZUNA_APP_KEY', 'test-app-key')
    global.fetch = vi.fn()
  })

  describe('isAdzunaConfigured', () => {
    it('returns true when both credentials are set', async () => {
      const { isAdzunaConfigured } = await import('../services/adzuna')
      expect(isAdzunaConfigured()).toBe(true)
    })

    it('returns false when APP_ID is missing', async () => {
      vi.stubEnv('VITE_ADZUNA_APP_ID', '')
      vi.resetModules()
      const { isAdzunaConfigured } = await import('../services/adzuna')
      expect(isAdzunaConfigured()).toBe(false)
    })

    it('returns false when APP_KEY is missing', async () => {
      vi.stubEnv('VITE_ADZUNA_APP_KEY', '')
      vi.resetModules()
      const { isAdzunaConfigured } = await import('../services/adzuna')
      expect(isAdzunaConfigured()).toBe(false)
    })

    it('returns false when credentials contain placeholder', async () => {
      vi.stubEnv('VITE_ADZUNA_APP_ID', 'your_app_id_here')
      vi.resetModules()
      const { isAdzunaConfigured } = await import('../services/adzuna')
      expect(isAdzunaConfigured()).toBe(false)
    })
  })

  describe('COUNTRY_OPTIONS', () => {
    it('has 19 country options', async () => {
      const { COUNTRY_OPTIONS } = await import('../services/adzuna')
      expect(COUNTRY_OPTIONS).toHaveLength(19)
    })

    it('includes expected countries', async () => {
      const { COUNTRY_OPTIONS } = await import('../services/adzuna')
      const codes = COUNTRY_OPTIONS.map(c => c.code)
      expect(codes).toContain('gb')
      expect(codes).toContain('us')
      expect(codes).toContain('au')
      expect(codes).toContain('de')
    })

    it('each option has code and label', async () => {
      const { COUNTRY_OPTIONS } = await import('../services/adzuna')
      COUNTRY_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('code')
        expect(option).toHaveProperty('label')
        expect(typeof option.code).toBe('string')
        expect(typeof option.label).toBe('string')
      })
    })
  })

  describe('searchJobs', () => {
    it('builds correct URL with default params', async () => {
      const mockResponse = { results: [], count: 0 }
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { searchJobs } = await import('../services/adzuna')
      const _result = await searchJobs({ country: 'gb', what: 'developer' })

      expect(global.fetch).toHaveBeenCalled()
      const callUrl = global.fetch.mock.calls[0][0]
      expect(callUrl).toContain('app_id=test-app-id')
      expect(callUrl).toContain('app_key=test-app-key')
      expect(callUrl).toContain('what=developer')
      expect(callUrl).toContain('results_per_page=20')
    })

    it('includes filter params when provided', async () => {
      const mockResponse = { results: [], count: 0 }
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { searchJobs } = await import('../services/adzuna')
      await searchJobs({
        country: 'us',
        what: 'react',
        where: 'remote',
        fullTime: true,
        minSalary: 50000,
        maxSalary: 150000,
      })

      const callUrl = global.fetch.mock.calls[0][0]
      expect(callUrl).toContain('what=react')
      expect(callUrl).toContain('where=remote')
      expect(callUrl).toContain('full_time=1')
      expect(callUrl).toContain('min_salary=50000')
      expect(callUrl).toContain('max_salary=150000')
    })

    it('throws error when API not configured', async () => {
      vi.stubEnv('VITE_ADZUNA_APP_ID', '')
      vi.stubEnv('VITE_ADZUNA_APP_KEY', '')
      vi.resetModules()

      const { searchJobs } = await import('../services/adzuna')
      await expect(searchJobs({ country: 'gb' })).rejects.toThrow('Adzuna API is not configured')
    })

    it('throws error on non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      })

      const { searchJobs } = await import('../services/adzuna')
      await expect(searchJobs({ country: 'gb' })).rejects.toThrow('Adzuna API error')
    })

    it('returns parsed results and count', async () => {
      const mockResults = [{ id: '1', title: 'Developer' }]
      const mockResponse = { results: mockResults, count: 42 }
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const { searchJobs } = await import('../services/adzuna')
      const result = await searchJobs({ country: 'gb' })

      expect(result.results).toEqual(mockResults)
      expect(result.count).toBe(42)
    })
  })

  describe('fetchCategoriesTop', () => {
    it('returns empty array when not configured', async () => {
      vi.stubEnv('VITE_ADZUNA_APP_ID', '')
      vi.resetModules()
      const { fetchCategoriesTop } = await import('../services/adzuna')
      const result = await fetchCategoriesTop()
      expect(result).toEqual([])
    })

    it('parses categories from response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: { it: 'IT', hr: 'HR' }
        }),
      })

      const { fetchCategoriesTop } = await import('../services/adzuna')
      const result = await fetchCategoriesTop('gb')
      expect(result).toEqual([
        { tag: 'it', label: 'IT' },
        { tag: 'hr', label: 'HR' },
      ])
    })
  })
})