import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from './DashboardPage';
import { AccountRole } from '@/types/account';
import { DashboardTabs } from '@/components/dashboard/constants';
import { TooltipProvider } from '@/components/ui/tooltip';

const mocks = vi.hoisted(() => ({
  mockUseGetApplications: vi.fn(),
  mockUseAccountRole: vi.fn(),
  mockUseAccount: vi.fn(),
  mockUseStateWaitMsg: vi.fn(),
  mockUseRKHTransaction: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useAccount: mocks.mockUseAccount,
  useGetApplications: mocks.mockUseGetApplications,
  useAccountRole: mocks.mockUseAccountRole,
  useStateWaitMsg: mocks.mockUseStateWaitMsg,
  useRKHTransaction: mocks.mockUseRKHTransaction,
}));

vi.mock('@/config/environment', () => ({
  env: {
    useTestData: false,
    apiBaseUrl: 'test-api',
  },
}));

const mockApplicationsData = {
  applications: [
    { id: '1', name: 'Test App 1', status: 'NEW' },
    { id: '2', name: 'Test App 2', status: 'KYC_PHASE' },
  ],
  totalCount: 2,
};

const mockAccount = {
  address: '0x123...',
  isConnected: true,
  role: AccountRole.METADATA_ALLOCATOR,
  wallet: { type: 'metamask' },
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({ account: mockAccount });
    mocks.mockUseAccountRole.mockReturnValue(AccountRole.METADATA_ALLOCATOR);
    mocks.mockUseGetApplications.mockReturnValue({
      data: mockApplicationsData,
      error: null,
    });
    mocks.mockUseStateWaitMsg.mockReturnValue({
      checkTransactionState: vi.fn(),
      stateWaitMsg: 'mockMessage',
    });
    mocks.mockUseRKHTransaction.mockReturnValue({
      proposeTransaction: vi.fn(),
      messageId: 'mock-messageId',
    });
  });

  it('should render dashboard with basic elements for logged in user', () => {
    render(<DashboardPage />, { wrapper: TooltipProvider });

    expect(screen.getByRole('heading', { name: 'New Applications' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Apply To Become An Allocator' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avatar' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Completed Applications' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'New Applications' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Refreshes' })).toBeInTheDocument();
  });

  it('should show refresh section for root key holder', () => {
    mocks.mockUseAccountRole.mockReturnValue(AccountRole.ROOT_KEY_HOLDER);

    render(<DashboardPage />, { wrapper: TooltipProvider });

    expect(screen.getByText('Refresh Allocator')).toBeInTheDocument();
  });

  it('should not show refresh section for regular allocator', () => {
    render(<DashboardPage />, { wrapper: TooltipProvider });

    expect(screen.queryByText('Refresh Allocator')).not.toBeInTheDocument();
  });

  it('should show connect wallet buttons for not logged user', () => {
    mocks.mockUseAccount.mockReturnValue({ account: null });
    render(<DashboardPage />, { wrapper: TooltipProvider });

    const buttons = screen.getAllByRole('button', { name: 'Connect Wallet' });
    expect(buttons).toHaveLength(2);
  });

  it('should switch tabs correctly', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, { wrapper: TooltipProvider });

    const completedTab = screen.getByRole('tab', { name: 'Completed Applications' });
    await user.click(completedTab);

    expect(completedTab).toHaveAttribute('data-state', 'active');
  });

  it('should call useGetApplications with correct parameters on tab change', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, { wrapper: TooltipProvider });

    expect(mocks.mockUseGetApplications).toHaveBeenCalledWith({
      searchTerm: '',
      activeFilters: [],
      currentTab: DashboardTabs.NEW_APPLICATIONS,
      currentPage: 1,
    });

    const completedTab = screen.getByRole('tab', { name: 'Completed Applications' });
    await user.click(completedTab);

    expect(mocks.mockUseGetApplications).toHaveBeenCalledWith({
      searchTerm: '',
      activeFilters: [],
      currentTab: DashboardTabs.COMPLETED_APPLICATIONS,
      currentPage: 1,
    });
  });

  it('should display error when API fails', () => {
    mocks.mockUseGetApplications.mockReturnValue({
      data: null,
      error: new Error('Network error'),
    });

    render(<DashboardPage />, { wrapper: TooltipProvider });

    expect(screen.getByText('Error: Network error')).toBeInTheDocument();
  });

  it('should handle search term changes', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, { wrapper: TooltipProvider });

    const searchInput = screen.getByPlaceholderText('Search by name...');
    await user.type(searchInput, 'test');

    expect(mocks.mockUseGetApplications).toHaveBeenLastCalledWith(
      expect.objectContaining({
        searchTerm: 'test',
      }),
    );
  });
});
