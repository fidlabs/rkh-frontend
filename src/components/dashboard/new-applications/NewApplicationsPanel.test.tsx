import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NewApplicationsPanel } from './NewApplicationsPanel';
import { Application } from '@/types/application';
import { createTooltipProviderWrapper, createWrapper, WrapperBuilder } from '@/test-utils';
import { AccountRole } from '@/types/account';
import { ReactNode } from 'react';

const mocks = vi.hoisted(() => ({
  mockUseGetApplications: vi.fn(),
  mockUseAccountRole: vi.fn(),
  mockUseAccount: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useGetApplications: mocks.mockUseGetApplications,
  useAccountRole: mocks.mockUseAccountRole,
  useAccount: mocks.mockUseAccount.mockReturnValue({
    address: '0x123',
    account: {},
  }),
}));

describe('NewApplicationsPanel', () => {
  const mockApplication: Application = {
    id: '1',
    number: 1,
    name: 'Test Application',
    organization: 'Test Org',
    address: 'f1testaddress',
    github: 'testuser',
    country: 'US',
    region: 'North America',
    type: 'Allocator',
    datacap: 100,
    status: 'KYC_PHASE',
    githubPrNumber: '123',
    githubPrLink: 'https://github.com/test/pr/123',
  };

  const mockData = {
    applications: [mockApplication],
    totalCount: 1,
  };

  const wrapper = WrapperBuilder.create()
    .with(createWrapper())
    .with(createTooltipProviderWrapper())
    .build();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockUseGetApplications.mockReturnValue({
      data: mockData,
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render header, table and pagination', () => {
    render(<NewApplicationsPanel searchTerm="" activeFilters={[]} />, { wrapper });

    expect(screen.getByRole('heading', { level: 3, name: 'New Applications' })).toBeInTheDocument();
    expect(screen.getByText('Consult and manage Fil+ program applications.')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('should render table columns', () => {
    render(<NewApplicationsPanel searchTerm="" activeFilters={[]} />, { wrapper });

    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Github' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'DataCap' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Phase' })).toBeInTheDocument();
  });

  it('should render table data', () => {
    render(<NewApplicationsPanel searchTerm="" activeFilters={[]} />, { wrapper });

    expect(screen.getByRole('cell', { name: '123' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Test Application' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'testuser' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '100 PiB' })).toBeInTheDocument();
  });

  it('should render actions for logged in user', () => {
    mocks.mockUseAccountRole.mockReturnValue(AccountRole.ROOT_KEY_HOLDER);
    render(<NewApplicationsPanel searchTerm="" activeFilters={[]} />, { wrapper });

    expect(screen.getByRole('button', { name: 'Submit KYC' })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mocks.mockUseGetApplications.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<NewApplicationsPanel searchTerm="" activeFilters={[]} />, { wrapper });

    expect(screen.getByRole('heading', { level: 3, name: 'New Applications' })).toBeInTheDocument();
    expect(screen.getByTestId('table-spinner')).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    mocks.mockUseGetApplications.mockReturnValue({
      data: { applications: [], totalCount: 0 },
      isLoading: false,
    } as any);

    render(<NewApplicationsPanel searchTerm="" activeFilters={[]} />, { wrapper });

    expect(screen.getByRole('heading', { level: 3, name: 'New Applications' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
  });

  it('should handle application without githubPrNumber', () => {
    const applicationWithoutPr: Application = {
      ...mockApplication,
      githubPrNumber: '',
      githubPrLink: '',
    };

    mocks.mockUseGetApplications.mockReturnValue({
      data: { applications: [applicationWithoutPr], totalCount: 1 },
      isLoading: false,
    } as any);

    render(<NewApplicationsPanel searchTerm="" activeFilters={[]} />, { wrapper });

    expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
  });
});
