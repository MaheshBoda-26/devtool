import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import JobCard from '../components/JobCard'

describe('JobCard', () => {
  const mockJob = {
    id: '1',
    title: 'Senior React Developer',
    redirect_url: 'https://adzuna.com/job/1',
    company: { display_name: 'Tech Corp' },
    location: { display_name: 'London, UK' },
    description: '<p>We are looking for a <strong>Senior React Developer</strong> to join our team.</p>',
    created: '2024-01-15T10:00:00Z',
    salary_min: 60000,
    salary_max: 90000,
    contract_type: 'permanent',
    contract_time: 'full_time',
  }

  it('renders job title as link', () => {
    render(<JobCard job={mockJob} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://adzuna.com/job/1')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noreferrer')
    expect(link).toHaveTextContent('Senior React Developer')
  })

  it('renders company name', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
  })

  it('renders location', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText('London, UK')).toBeInTheDocument()
  })

  it('renders salary range', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText((content) => content.includes('60,000') && content.includes('90,000'))).toBeInTheDocument()
  })

  it('renders description with HTML stripped', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText('We are looking for a Senior React Developer to join our team.')).toBeInTheDocument()
  })

  it('renders posted date formatted', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText(/Posted: Jan 15, 2024/)).toBeInTheDocument()
  })

  it('renders contract type', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText('Contract: permanent')).toBeInTheDocument()
  })

  it('renders contract time', () => {
    render(<JobCard job={mockJob} />)

    expect(screen.getByText('Hours: full_time')).toBeInTheDocument()
  })

  it('handles missing salary', () => {
    const jobNoSalary = { ...mockJob, salary_min: null, salary_max: null }
    render(<JobCard job={jobNoSalary} />)

    expect(screen.queryByText(/60,000|90,000/)).not.toBeInTheDocument()
  })

  it('handles only min salary', () => {
    const jobMinOnly = { ...mockJob, salary_min: 50000, salary_max: null }
    render(<JobCard job={jobMinOnly} />)

    expect(screen.getByText('50,000')).toBeInTheDocument()
  })

  it('handles only max salary', () => {
    const jobMaxOnly = { ...mockJob, salary_min: null, salary_max: 120000 }
    render(<JobCard job={jobMaxOnly} />)

    expect(screen.getByText('120,000')).toBeInTheDocument()
  })

  it('handles missing company', () => {
    const jobNoCompany = { ...mockJob, company: null }
    render(<JobCard job={jobNoCompany} />)

    expect(screen.getByText('Unknown company')).toBeInTheDocument()
  })

  it('handles missing location', () => {
    const jobNoLocation = { ...mockJob, location: null }
    render(<JobCard job={jobNoLocation} />)

    expect(screen.queryByText('London')).not.toBeInTheDocument()
  })

  it('handles missing description', () => {
    const jobNoDesc = { ...mockJob, description: null }
    render(<JobCard job={jobNoDesc} />)

    expect(screen.queryByText('We are looking')).not.toBeInTheDocument()
  })

  it('handles missing created date', () => {
    const jobNoDate = { ...mockJob, created: null }
    render(<JobCard job={jobNoDate} />)

    expect(screen.getByText('Posted: Unknown')).toBeInTheDocument()
  })

  it('handles missing contract type', () => {
    const jobNoContract = { ...mockJob, contract_type: null }
    render(<JobCard job={jobNoContract} />)

    expect(screen.queryByText('Contract:')).not.toBeInTheDocument()
  })

  it('truncates long description', () => {
    const longDesc = 'A'.repeat(400)
    const jobLongDesc = { ...mockJob, description: `<p>${longDesc}</p>` }
    render(<JobCard job={jobLongDesc} />)

    const descText = screen.getByText(/A{280}/)
    expect(descText.textContent).toContain('…')
  })
})