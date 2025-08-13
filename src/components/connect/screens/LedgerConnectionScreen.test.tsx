import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LedgerConnectionScreen } from './LedgerConnectionScreen';
import { LedgerConnector } from '@/lib/connectors/ledger-connector';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  mockOnConnect: vi.fn(),
  mockOnError: vi.fn(),
  mockConnect: vi.fn(),
  mockFetchAccounts: vi.fn(),
  mockToast: vi.fn(),
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

vi.mock('@/hooks', () => ({
  useAccount: () => ({
    account: null,
    connect: mocks.mockOnConnect,
    connectors: { ledger: new LedgerConnector(0) },
  }),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mocks.mockToast,
  }),
}));

describe('LedgerConnectionScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockFetchAccounts.mockResolvedValue([
      {
        address: '0x123',
      },
      {
        address: '0x456',
      },
    ]);
  });

  it('should render successfully with a list of accounts', async () => {
    render(<LedgerConnectionScreen onConnect={mocks.mockOnConnect} onError={mocks.mockOnError} />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Select Ledger Account' })).toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Connect to 0x123' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connect to 0x456' })).toBeInTheDocument();
  });

  it('should display loading state', async () => {
    mocks.mockFetchAccounts.mockImplementation(() => new Promise(() => {}));
    render(<LedgerConnectionScreen onConnect={mocks.mockOnConnect} onError={mocks.mockOnError} />);

    await waitFor(() => expect(screen.getByText('Connecting to Ledger...')).toBeInTheDocument());
  });

  it('should copy address to clipboard', async () => {
    const user = userEvent.setup();
    render(<LedgerConnectionScreen onConnect={mocks.mockOnConnect} onError={mocks.mockOnError} />);

    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Select Ledger Account' })).toBeInTheDocument(),
    );

    const copyButton = screen.getAllByRole('button', { name: 'Copy address' })[0];
    await user.click(copyButton);

    expect(mocks.mockToast).toHaveBeenCalledWith({
      title: 'Copied to clipboard',
      description: 'The address has been copied to your clipboard.',
    });
  });

  it('should display error state', async () => {
    mocks.mockFetchAccounts.mockRejectedValue(new Error('test error'));
    render(<LedgerConnectionScreen onConnect={mocks.mockOnConnect} onError={mocks.mockOnError} />);

    await waitFor(() => expect(mocks.mockOnError).toHaveBeenCalled());
    expect(mocks.mockToast).toHaveBeenCalledWith({
      title: 'Connection Failed',
      description: 'test error',
      variant: 'destructive',
    });
  });
});
