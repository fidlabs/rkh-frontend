import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RefreshesPanel } from './RefreshesPanel';
import { Refresh, RefreshStatus, MetapathwayType } from '@/types/refresh';
import { createWrapper } from '@/test-utils';
import { AccountRole } from '@/types/account';

const mocks = vi.hoisted(() => ({
  mockUseGetRefreshes: vi.fn(),
  mockUseAccountRole: vi.fn(),
  mockUseStateWaitMsg: vi.fn(),
  mockUseProposeRKHTransaction: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useGetRefreshes: mocks.mockUseGetRefreshes,
  useAccountRole: mocks.mockUseAccountRole,
  useStateWaitMsg: mocks.mockUseStateWaitMsg.mockReturnValue({
    stateWaitMsg: '',
    checkTransactionState: vi.fn(),
  }),
  useProposeRKHTransaction: mocks.mockUseProposeRKHTransaction.mockReturnValue({
    proposeTransaction: vi.fn(),
    messageId: '',
  }),
}));

describe('RefreshesPanel', () => {
  const mockRefresh: Refresh = {
    githubIssueId: 1,
    title: 'Test Refresh',
    creator: { userId: 1, name: 'testuser' },
    assignees: null,
    labels: null,
    state: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    closedAt: null,
    jsonNumber: '1',
    refreshStatus: RefreshStatus.PENDING,
    dataCap: 100,
    msigAddress: 'f1testaddress',
    maAddress: '0xtestmaaddress' as `0x${string}`,
    metapathwayType: MetapathwayType.RKH,
  };

  const mockData = {
    data: {
      results: [mockRefresh],
      pagination: {
        totalItems: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
    },
  };

  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockUseGetRefreshes.mockReturnValue({
      data: mockData,
      isLoading: false,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render header, table and pagination', () => {
    render(<RefreshesPanel searchTerm="" />, { wrapper });

    expect(screen.getByRole('heading', { level: 3, name: 'Refreshes' })).toBeInTheDocument();
    expect(screen.getByTestId('refresh-table-description')).toHaveTextContent(
      'Consult and manage Fil+ datacap Refreshes.',
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('should render table columns', () => {
    render(<RefreshesPanel searchTerm="" />, { wrapper });

    expect(screen.getByRole('columnheader', { name: 'Issue ▼' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'AllocatorJson ▼' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Github' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'DataCap' })).toBeInTheDocument();
  });

  it('should render table data', () => {
    render(<RefreshesPanel searchTerm="" />, { wrapper });

    expect(screen.getByRole('cell', { name: '#' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Test Refresh' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'testuser' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '100 PiB' })).toBeInTheDocument();
  });

  it('should render actions for logged in user', () => {
    mocks.mockUseAccountRole.mockReturnValue(AccountRole.ROOT_KEY_HOLDER);
    render(<RefreshesPanel searchTerm="" />, { wrapper });

    expect(screen.getByRole('button', { name: 'RKH Sign' })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mocks.mockUseGetRefreshes.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    render(<RefreshesPanel searchTerm="" />, { wrapper });

    expect(screen.getByRole('heading', { level: 3, name: 'Refreshes' })).toBeInTheDocument();
    expect(screen.getByTestId('table-spinner')).toBeInTheDocument();
  });

  it('should show empty state when no data', () => {
    mocks.mockUseGetRefreshes.mockReturnValue({
      data: { data: { results: [], pagination: { totalItems: 0 } } },
      isLoading: false,
    } as any);

    render(<RefreshesPanel searchTerm="" />, { wrapper });

    expect(screen.getByRole('heading', { level: 3, name: 'Refreshes' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'No results.' })).toBeInTheDocument();
  });
});
