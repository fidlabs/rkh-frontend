import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { WalletConnectionScreen } from './WalletConnectionScreen';
import { LedgerConnector } from '@/lib/connectors/ledger-connector';
import { FilsnapConnector } from '@/lib/connectors/filsnap-connector';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockConnect: vi.fn(),
  mockUseAccountConnect: vi.fn(),
  mockFetchAccounts: vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useAccount: mocks.mockUseAccount,
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

vi.mock('@/lib/connectors/filsnap-connector', () => ({
  FilsnapConnector: class {
    name = 'filsnap';
    connect = mocks.mockConnect;
    fetchAccounts = mocks.mockFetchAccounts;
  },
}));

describe('WalletConnectionScreen', () => {
  const defaultProps = {
    provider: 'metamask',
    onConnect: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      account: null,
      selectedMetaAllocator: null,
      connect: mocks.mockUseAccountConnect,
      connectors: {
        ledger: new LedgerConnector(),
        filsnap: new FilsnapConnector(),
      },
    });
  });

  it('should render MetaMask connection screen for metamask provider', () => {
    render(<WalletConnectionScreen {...defaultProps} provider="metamask" />);

    expect(screen.getByText('Connecting to MetaMask...')).toBeInTheDocument();
  });

  it('should render FileSnap connection screen for filsnap provider', () => {
    render(<WalletConnectionScreen {...defaultProps} provider="filsnap" />);

    expect(screen.getByText('Connecting to MetaMask via Filsnap...')).toBeInTheDocument();
  });

  it('should render Ledger connection screen for ledger provider', () => {
    render(<WalletConnectionScreen {...defaultProps} provider="ledger" />);

    expect(screen.getByText('Connecting to Ledger...')).toBeInTheDocument();
  });

  it('should handle unknown provider gracefully', () => {
    expect(() => {
      render(<WalletConnectionScreen {...defaultProps} provider="unknown" />);
    }).not.toThrow();
  });
});
