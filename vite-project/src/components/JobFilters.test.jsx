import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import JobFilters from '../components/JobFilters'

describe('JobFilters', () => {
  const defaultFilters = {
    country: 'gb',
    what: '',
    where: '',
    page: 1,
    fullTime: false,
    partTime: false,
    permanent: false,
    contract: false,
    minSalary: '',
    maxSalary: '',
    sortBy: '',
  }

  const mockOnChange = vi.fn()
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all filter fields', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    expect(screen.getByPlaceholderText('e.g. react developer')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. London')).toBeInTheDocument()
    expect(screen.getByText('Country')).toBeInTheDocument()
    expect(screen.getByText('Sort by')).toBeInTheDocument()
    const anyPlaceholders = screen.getAllByPlaceholderText('any')
    expect(anyPlaceholders).toHaveLength(2)
    expect(screen.getByLabelText('Full-time')).toBeInTheDocument()
    expect(screen.getByLabelText('Part-time')).toBeInTheDocument()
    expect(screen.getByLabelText('Permanent')).toBeInTheDocument()
    expect(screen.getByLabelText('Contract')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search jobs' })).toBeInTheDocument()
  })

  it('populates country select with 19 options', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const countrySelect = screen.getByText('Country').parentElement.querySelector('select')
    expect(countrySelect).toBeInTheDocument()
    expect(countrySelect.options).toHaveLength(19)
    expect(countrySelect).toHaveValue('gb')
  })

  it('populates sort select with 4 options', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const sortSelect = screen.getByText('Sort by').parentElement.querySelector('select')
    expect(sortSelect).toBeInTheDocument()
    expect(sortSelect.options).toHaveLength(4)
  })

  it('calls onChange when keyword input changes', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const keywordInput = screen.getByPlaceholderText('e.g. react developer')
    fireEvent.change(keywordInput, { target: { value: 'react developer' } })

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      what: 'react developer',
    })
  })

  it('calls onChange when location input changes', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const locationInput = screen.getByPlaceholderText('e.g. London')
    fireEvent.change(locationInput, { target: { value: 'London' } })

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      where: 'London',
    })
  })

  it('calls onChange when country select changes', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const countrySelect = screen.getByText('Country').parentElement.querySelector('select')
    fireEvent.change(countrySelect, { target: { value: 'us' } })

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      country: 'us',
    })
  })

  it('calls onChange when sort select changes', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const sortSelect = screen.getByText('Sort by').parentElement.querySelector('select')
    fireEvent.change(sortSelect, { target: { value: 'date' } })

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sortBy: 'date',
    })
  })

  it('calls onChange when min salary changes', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const minSalaryInputs = screen.getAllByPlaceholderText('any')
    fireEvent.change(minSalaryInputs[0], { target: { value: '50000' } })

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      minSalary: '50000',
    })
  })

  it('calls onChange when max salary changes', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const maxSalaryInputs = screen.getAllByPlaceholderText('any')
    fireEvent.change(maxSalaryInputs[1], { target: { value: '150000' } })

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      maxSalary: '150000',
    })
  })

  it('calls onChange when checkbox toggles', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const fullTimeCheckbox = screen.getByLabelText('Full-time')
    fireEvent.click(fullTimeCheckbox)

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      fullTime: true,
    })

    fireEvent.click(fullTimeCheckbox)
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      fullTime: false,
    })
  })

  it('calls onSubmit when form submits', () => {
    render(<JobFilters filters={defaultFilters} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    const form = screen.getByRole('form')
    fireEvent.submit(form)

    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('displays current filter values', () => {
    const filtersWithValues = {
      ...defaultFilters,
      what: 'react',
      where: 'remote',
      country: 'us',
      minSalary: '60000',
      maxSalary: '120000',
      fullTime: true,
      partTime: true,
    }

    render(<JobFilters filters={filtersWithValues} onChange={mockOnChange} onSubmit={mockOnSubmit} />)

    expect(screen.getByPlaceholderText('e.g. react developer')).toHaveValue('react')
    expect(screen.getByPlaceholderText('e.g. London')).toHaveValue('remote')
    const countrySelect = screen.getByText('Country').parentElement.querySelector('select')
    expect(countrySelect).toHaveValue('us')
    expect(screen.getByLabelText('Full-time')).toBeChecked()
    expect(screen.getByLabelText('Part-time')).toBeChecked()
    expect(screen.getAllByPlaceholderText('any')[0]).toHaveValue('60000')
    expect(screen.getAllByPlaceholderText('any')[1]).toHaveValue('120000')
  })
})