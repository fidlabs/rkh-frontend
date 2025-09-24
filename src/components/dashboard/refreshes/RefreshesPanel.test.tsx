import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RefreshesPanel } from './RefreshesPanel';
import { Refresh, RefreshStatus, MetapathwayType } from '@/types/refresh';
import { createWrapper } from '@/test-utils';
import { AccountRole } from '@/types/account';

const mocks = vi.hoisted(() => ({
  mockUseGetRefreshes: vi.fn(),
  mockUseAccount: vi.fn(),
  mockUseStateWaitMsg: vi.fn(),
  mockUseProposeRKHTransaction: vi.fn(),
}));

vi.mock('@/hooks/useAccount', () => ({
  useAccount: mocks.mockUseAccount,
}));

vi.mock('@/hooks', () => ({
  useGetRefreshes: mocks.mockUseGetRefreshes,
  useAccount: mocks.mockUseAccount,
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
  const createFixtureRefresh = (overrides: Partial<Refresh>) => {
    return {
      githubIssueId: 1,
      title: 'Test Refresh',
      creator: { userId: 1, name: 'testuser' },
      assignees: null,
      labels: null,
      state: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      closedAt: null,
      jsonNumber: 'rec123',
      refreshStatus: RefreshStatus.DC_ALLOCATED,
      dataCap: 100,
      msigAddress: 'f1testaddress',
      maAddress: '0xtestmaaddress' as `0x${string}`,
      metapathwayType: MetapathwayType.RKH,
      githubIssueNumber: 100,
      ...overrides,
    };
  };

  const mockData = {
    data: {
      results: [
        createFixtureRefresh({
          refreshStatus: RefreshStatus.APPROVED,
          githubIssueNumber: 100,
          jsonNumber: 'rec1',
          title: 'Test Refresh 1',
          creator: { userId: 1, name: 'testuser1' },
          dataCap: 100,
        }),
        createFixtureRefresh({
          refreshStatus: RefreshStatus.PENDING,
          githubIssueNumber: 101,
          jsonNumber: 'rec2',
          title: 'Test Refresh 2',
          creator: { userId: 2, name: 'testuser2' },
          dataCap: 200,
        }),
      ],
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
    mocks.mockUseGetRefreshes.mockReturnValue({
      data: mockData,
      isLoading: false,
    });

    mocks.mockUseAccount.mockReturnValue({
      account: null,
      selectedMetaAllocator: null,
    });
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

    expect(screen.getByRole('cell', { name: '#100' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'rec1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Test Refresh 1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'testuser1' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '100 PiB' })).toBeInTheDocument();
  });

  it('should render actions for logged in user as ROOT_KEY_HOLDER', () => {
    mocks.mockUseAccount.mockReturnValue({
      account: { role: AccountRole.ROOT_KEY_HOLDER },
      selectedMetaAllocator: null,
    });
    render(<RefreshesPanel searchTerm="" />, { wrapper });

    expect(screen.getByRole('button', { name: 'RKH Sign' })).toBeInTheDocument();
  });

  it('should render actions for logged in user as GOVERNANCE_TEAM', () => {
    mocks.mockUseAccount.mockReturnValue({
      account: { role: AccountRole.GOVERNANCE_TEAM },
      selectedMetaAllocator: null,
    });
    render(<RefreshesPanel searchTerm="" />, { wrapper });

    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument();
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
