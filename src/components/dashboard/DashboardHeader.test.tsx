import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardHeader } from './DashboardHeader';
import userEvent from '@testing-library/user-event';

describe('DashboardHeader', () => {
  const defaultProps = {
    searchTerm: '',
    setSearchTerm: vi.fn(),
    activeFilters: [],
    availableFilters: ['KYC_PHASE', 'GOVERNANCE_REVIEW_PHASE', 'RKH_APPROVAL_PHASE'],
    onFilterChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display current search term in input', () => {
    const searchText = 'test search';
    render(<DashboardHeader {...defaultProps} searchTerm="test search" />);

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveValue(searchText);
  });

  it('should call setSearchTerm when search input changes', async () => {
    const user = userEvent.setup();
    const setSearchTerm = vi.fn();
    const searchText = 'n';
    render(<DashboardHeader {...defaultProps} setSearchTerm={setSearchTerm} />);

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, searchText);

    expect(setSearchTerm).toHaveBeenCalledWith(searchText);
  });

  it('should not show filter count badge when no active filters', () => {
    render(<DashboardHeader {...defaultProps} />);

    const badge = screen.queryByTestId('count-badge');
    expect(badge).not.toBeInTheDocument();
  });

  it('should show filter count badge when active filters exist', () => {
    render(<DashboardHeader {...defaultProps} activeFilters={['KYC_PHASE', 'APPROVED']} />);

    const badge = screen.getByTestId('count-badge');
    expect(badge).toHaveTextContent('2');
  });

  it('should open filter dropdown when filter button is clicked', async () => {
    const user = userEvent.setup();
    render(<DashboardHeader {...defaultProps} />);

    const filterButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filterButton);
  });

  it('should show checked state for active filters', async () => {
    const user = userEvent.setup();
    render(<DashboardHeader {...defaultProps} activeFilters={['KYC_PHASE']} />);

    const filterButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filterButton);

    const kycCheckbox = screen.getByRole('menuitemcheckbox', { name: 'KYC' });
    expect(kycCheckbox).toHaveAttribute('data-state', 'checked');
  });

  it('should call onFilterChange when filter is toggled', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(<DashboardHeader {...defaultProps} onFilterChange={onFilterChange} />);

    const filterButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filterButton);

    const kycCheckbox = screen.getByRole('menuitemcheckbox', { name: 'KYC' });
    await user.click(kycCheckbox);

    expect(onFilterChange).toHaveBeenCalledWith('KYC_PHASE', true);
  });

  it('should call onFilterChange with false when unchecking active filter', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <DashboardHeader
        {...defaultProps}
        activeFilters={['KYC_PHASE']}
        onFilterChange={onFilterChange}
      />,
    );

    const filterButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filterButton);

    const kycCheckbox = screen.getByRole('menuitemcheckbox', { name: 'KYC' });
    await user.click(kycCheckbox);

    expect(onFilterChange).toHaveBeenCalledWith('KYC_PHASE', false);
  });

  it('should render all filter labels correctly', async () => {
    const user = userEvent.setup();
    const allFilters = [
      'KYC_PHASE',
      'GOVERNANCE_REVIEW_PHASE',
      'RKH_APPROVAL_PHASE',
      'META_APPROVAL_PHASE',
      'APPROVED',
      'REJECTED',
      'DC_ALLOCATED',
    ];

    render(<DashboardHeader {...defaultProps} availableFilters={allFilters} />);

    const filterButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filterButton);

    expect(screen.getByTestId('dropdown-label')).toHaveTextContent('Filter by status');
    expect(screen.getByRole('menuitemcheckbox', { name: 'KYC' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Governance Review' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'RKH Approval' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Meta Approval' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Approved' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rejected' })).toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'DC Allocated' })).toBeInTheDocument();
  });
});
