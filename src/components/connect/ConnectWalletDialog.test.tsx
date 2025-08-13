import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConnectWalletDialog } from './ConnectWalletDialog';
import { createTooltipProviderWrapper, createWrapper, WrapperBuilder } from '@/test-utils';
import { AccountRole } from '@/types/account';
import { LedgerConnector } from '@/lib/connectors/ledger-connector';

const mocks = vi.hoisted(() => ({
  mockUseAccountRole: vi.fn(),
  mockUseAccount: vi.fn(),
  mockUseMaAddresses: vi.fn(),
  mockConnect: vi.fn(),
  mockUseAccountConnect: vi.fn(),
  mockFetchAccounts: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useAccountRole: mocks.mockUseAccountRole,
  useAccount: mocks.mockUseAccount,
  useMaAddresses: mocks.mockUseMaAddresses,
}));

vi.mock('@/lib/connectors/ledger-connector', () => ({
  LedgerConnector: class {
    accountIndex = 0;
    name = 'ledger';
    connect = mocks.mockConnect;
    fetchAccounts = mocks.mockFetchAccounts;
    constructor(accountIndex: number) {
      this.accountIndex = accountIndex;
    }
  },
}));

describe('ConnectWalletDialog', () => {
  const defaultProps = {
    isOpen: true,
    setIsOpen: vi.fn(),
    handleClose: vi.fn(),
  };

  const fixtureEthSafeAddress = '0x123';

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseMaAddresses.mockReturnValue({
      data: [
        {
          ethSafeAddress: fixtureEthSafeAddress,
          name: 'Test Meta Allocator',
        },
      ],
      isLoading: false,
    });

    mocks.mockUseAccount.mockReturnValue({
      account: null,
      connect: mocks.mockUseAccountConnect,
      connectors: {
        ledger: new LedgerConnector(0),
      },
    });

    mocks.mockConnect.mockResolvedValue({
      address: '0x123',
      isConnected: true,
      role: AccountRole.ROOT_KEY_HOLDER,
    });

    mocks.mockFetchAccounts.mockResolvedValue([
      {
        address: '0x123',
        pubKey: Buffer.from('0x123'),
        path: '0x123',
        index: 0,
      },
    ]);
  });

  const wrapper = WrapperBuilder.create()
    .with(createWrapper())
    .with(createTooltipProviderWrapper())
    .build();

  it('should render with initial step (select role)', () => {
    render(<ConnectWalletDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Select Role' })).toBeInTheDocument();
    expect(screen.getByText('Please select a role to continue.')).toBeInTheDocument();
  });

  it('should navigate to MA selection when meta-allocator role is selected', async () => {
    const user = userEvent.setup();
    render(<ConnectWalletDialog {...defaultProps} />, { wrapper });

    const metaAllocatorButton = screen.getByRole('button', { name: 'Connect as Allocator' });
    await user.click(metaAllocatorButton);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Select Meta Allocator' })).toBeInTheDocument(),
    );
    expect(screen.getByText('Please select a meta allocator to continue.')).toBeInTheDocument();
  });

  it('should navigate to provider selection when root role is selected', async () => {
    const user = userEvent.setup();
    render(<ConnectWalletDialog {...defaultProps} />);

    const rootButton = screen.getByRole('button', { name: 'Connect as Root' });
    await user.click(rootButton);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Select Provider' })).toBeInTheDocument(),
    );
    expect(screen.getByText('Please select a provider to continue.')).toBeInTheDocument();
  });

  it('should navigate to provider selection after MA selection', async () => {
    const user = userEvent.setup();
    render(<ConnectWalletDialog {...defaultProps} />, { wrapper });

    const metaAllocatorButton = screen.getByRole('button', { name: 'Connect as Allocator' });
    await user.click(metaAllocatorButton);

    const maButton = screen.getByRole('button', { name: 'Test Meta Allocator' });
    await user.click(maButton);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Select Provider' })).toBeInTheDocument(),
    );
    expect(screen.getByText('Please select a provider to continue.')).toBeInTheDocument();
  });

  it('should navigate to wallet connection after provider selection', async () => {
    const user = userEvent.setup();
    render(<ConnectWalletDialog {...defaultProps} />);

    const rootButton = screen.getByRole('button', { name: 'Connect as Root' });
    await user.click(rootButton);

    const providerButton = screen.getByRole('button', { name: 'Ledger' });
    await user.click(providerButton);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Connect Wallet' })).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: `Connect to ${fixtureEthSafeAddress}` }),
    ).toBeInTheDocument();
  });

  it('should go back to initial step from meta allocator provider selection', async () => {
    const user = userEvent.setup();
    render(<ConnectWalletDialog {...defaultProps} />);

    const rootButton = screen.getByRole('button', { name: 'Connect as Allocator' });
    await user.click(rootButton);

    const maButton = screen.getByRole('button', { name: 'Test Meta Allocator' });
    await user.click(maButton);

    expect(screen.getByRole('button', { name: 'MetaMask' })).toBeInTheDocument();

    const backButton = screen.getByRole('button', { name: 'back' });
    await user.click(backButton);

    expect(screen.getByRole('heading', { name: 'Select Role' })).toBeInTheDocument();
  });

  it('should go back to role selection from root key holder provider selection', async () => {
    const user = userEvent.setup();
    render(<ConnectWalletDialog {...defaultProps} />);

    const rootButton = screen.getByRole('button', { name: 'Connect as Root' });
    await user.click(rootButton);

    const backButton = screen.getByRole('button', { name: 'back' });
    await user.click(backButton);

    expect(screen.getByRole('heading', { name: 'Select Role' })).toBeInTheDocument();
  });

  it('should handle meta allocator connection flow', async () => {
    const user = userEvent.setup();
    render(<ConnectWalletDialog {...defaultProps} />);

    // Navigate to wallet connection
    const rootButton = screen.getByRole('button', { name: 'Connect as Allocator' });
    await user.click(rootButton);

    const maButton = screen.getByRole('button', { name: 'Test Meta Allocator' });
    await user.click(maButton);

    const providerButton = screen.getByRole('button', { name: 'MetaMask' });
    await user.click(providerButton);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Connect Wallet' })).toBeInTheDocument(),
    );
    expect(screen.getByText('Connecting to MetaMask...')).toBeInTheDocument();
  });
});
