import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MetaAllocatorSignTransactionDialog from './MetaAllocatorSignTransactionDialog';
import { createWrapper } from '@/test-utils';
import { MetapathwayType } from '@/types/refresh';
import { SignatureType } from '@/types/governance-review';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockUseAccountWagmi: vi.fn(),
  mockUseSwitchChain: vi.fn(),
  mockUseFilecoinPublicClient: vi.fn(),
  mockGetSafeKit: vi.fn(),
  mockIsFilecoinAddress: vi.fn(),
  mockEncodeFunctionData: vi.fn(),
  mockConnector: {
    getProvider: vi.fn(),
  },
  mockSwitchChain: vi.fn(),
  mockClient: {
    request: vi.fn(),
  },
  mockSafeKit: {
    createTransaction: vi.fn(),
    signTransaction: vi.fn(),
    executeTransaction: vi.fn(),
  },
  mockProvider: {},
  mockGovernanceReview: vi.fn(),
  mockSignStateMessage: vi.fn(),
}));

vi.mock('@/hooks/useAccount', () => ({
  useAccount: mocks.mockUseAccount,
}));

vi.mock('wagmi', () => ({
  useAccount: mocks.mockUseAccountWagmi,
  useSwitchChain: mocks.mockUseSwitchChain,
}));

vi.mock('@/hooks/use-filecoin-public-client', () => ({
  useFilecoinPublicClient: mocks.mockUseFilecoinPublicClient,
}));

vi.mock('@/lib/safe', () => ({
  getSafeKit: mocks.mockGetSafeKit,
}));

vi.mock('@/types/filecoin', () => ({
  isFilecoinAddress: mocks.mockIsFilecoinAddress,
}));

vi.mock('viem/utils', () => ({
  encodeFunctionData: mocks.mockEncodeFunctionData,
}));

vi.mock('@/lib/api', () => ({
  governanceReview: mocks.mockGovernanceReview,
}));

describe('MetaAllocatorSignTransactionDialog Integration Tests', () => {
  const wrapper = createWrapper();
  const mockProps = {
    githubIssueNumber: 123,
    open: true,
    address: '0x1234567890123456789012345678901234567890',
    metapathwayType: MetapathwayType.MDMA,
    maAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      selectedMetaAllocator: {
        ethSafeAddress: '0x1234567890123456789012345678901234567890',
      },
      signStateMessage: mocks.mockSignStateMessage,
    });
    mocks.mockSignStateMessage.mockResolvedValue('test-signature');

    mocks.mockUseAccountWagmi.mockReturnValue({
      connector: mocks.mockConnector,
    });

    mocks.mockUseSwitchChain.mockReturnValue({
      chains: [{ id: 314 }, { id: 31415926 }], // Provide both mainnet and testnet chains
      switchChain: mocks.mockSwitchChain,
    });

    mocks.mockUseFilecoinPublicClient.mockReturnValue(mocks.mockClient);

    mocks.mockConnector.getProvider.mockResolvedValue(mocks.mockProvider);
    mocks.mockGetSafeKit.mockResolvedValue(mocks.mockSafeKit);
    mocks.mockIsFilecoinAddress.mockReturnValue(false);
    mocks.mockEncodeFunctionData.mockReturnValue('0x123456');

    mocks.mockSafeKit.createTransaction.mockResolvedValue({ id: 'safe-tx-123' });
    mocks.mockSafeKit.signTransaction.mockResolvedValue({ id: 'signed-tx-123' });
    mocks.mockSafeKit.executeTransaction.mockResolvedValue({
      hash: '0xabcdef123456789',
      status: 'success',
    });
    mocks.mockGovernanceReview.mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  it('should render dialog with correct title and description', () => {
    render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

    const dialog = screen.getByRole('dialog', { name: /Approve as MetaAllocator/i });
    expect(dialog).toHaveTextContent('Approve a Meta Allocator transaction to refresh DataCap');
  });

  describe('Success flow', () => {
    beforeEach(() => {
      mocks.mockSafeKit.executeTransaction.mockResolvedValue({
        hash: '0xabcdef123456789',
        status: 'success',
        transactionResponse: {
          wait: vi.fn().mockResolvedValue({
            blockNumber: 123,
          }),
        },
      });
    });

    it('should go through complete success flow', async () => {
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      const successHeader = await screen.findByTestId('success-header');
      expect(successHeader).toHaveTextContent('Success!');

      const transactionIdSection = screen.getByTestId('transaction-id-section');
      expect(transactionIdSection).toHaveTextContent('Transaction ID0xabcdef123456789');

      const blockNumberSection = screen.getByTestId('block-number-section');
      expect(blockNumberSection).toHaveTextContent('Block number123');
    });

    it('should close dialog from success step', async () => {
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      const successHeader = await screen.findByTestId('success-header');
      expect(successHeader).toHaveTextContent('Success!');

      await user.click(screen.getAllByRole('button', { name: /close/i })[0]);

      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Error flow', () => {
    beforeEach(() => {
      mocks.mockSafeKit.createTransaction.mockRejectedValue(
        new Error('Transaction creation failed'),
      );
    });

    it('should show error step when transaction fails', async () => {
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Transaction creation failed',
        );
      });
    });

    it('should show generic error message for unknown errors', async () => {
      mocks.mockSafeKit.createTransaction.mockRejectedValue('Unknown error');
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Unknown error. Please try again later.',
        );
      });
    });

    it('should go back to form from error step', async () => {
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Transaction creation failed',
        );
      });

      await user.click(screen.getByRole('button', { name: /go back/i }));

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
    });

    it('should close dialog from error step', async () => {
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Transaction creation failed',
        );
      });

      await user.click(screen.getAllByRole('button', { name: /close/i })[0]);

      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Reject flow', () => {
    it('should show rejection confirmation step when dataCap is 0', async () => {
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '0');
      await user.click(screen.getByRole('button', { name: /reject/i }));

      await waitFor(() => {
        expect(screen.getByTestId('confirmation-message')).toHaveTextContent(
          'Are you sure you want to reject this MetaAllocator transaction?',
        );
      });

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => {
        expect(screen.getByTestId('success-header')).toHaveTextContent('Success!');
      });
      expect(mocks.mockGovernanceReview).toHaveBeenCalledWith(
        SignatureType.MetaAllocatorReject,
        '123',
        {
          result: 'reject',
          details: {
            finalDataCap: '0',
            allocatorType: 'MDMA',
            isMDMAAllocator: false,
            reason: 'No reason given',
            reviewerAddress: '0x0000000000000000000000000000000000000000',
            reviewerPublicKey: '',
          },
          signature: 'test-signature',
        },
      );
    });

    it('should show error message when governance review fails', async () => {
      mocks.mockGovernanceReview.mockResolvedValue({
        ok: false,
        status: 500,
      });
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '0');
      await user.click(screen.getByRole('button', { name: /reject/i }));

      await waitFor(() => {
        expect(screen.getByTestId('confirmation-message')).toHaveTextContent(
          'Are you sure you want to reject this MetaAllocator transaction?',
        );
      });

      await user.click(screen.getByRole('button', { name: /confirm/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent(
          'Failed to submit MetaAllocator reject, status: 500',
        );
      });
    });

    it('should show generic error message for unknown errors', async () => {
      mocks.mockGovernanceReview.mockRejectedValue(new Error('Unknown error'));
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '0');
      await user.click(screen.getByRole('button', { name: /reject/i }));
    });
  });

  describe('Loading states', () => {
    it('should show initial loading message during transaction submission', async () => {
      mocks.mockSafeKit.createTransaction.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();

      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() =>
        expect(screen.getByTestId('loading-message')).toHaveTextContent(
          'Signing transaction. Please wait...',
        ),
      );
    });

    it('should show address conversion loading message', async () => {
      mocks.mockIsFilecoinAddress.mockReturnValueOnce(true);
      mocks.mockClient.request.mockImplementation(() => new Promise(() => {}));

      const propsWithFilecoinAddress = {
        ...mockProps,
        address: 'f1abc123def456',
      };

      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...propsWithFilecoinAddress} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() =>
        expect(screen.getByTestId('loading-message')).toHaveTextContent(
          'Converting address to ETH adress. Please wait...',
        ),
      );
    });

    it('should show signing loading message', async () => {
      mocks.mockSafeKit.createTransaction.mockResolvedValue({ id: 'safe-tx-123' });
      mocks.mockSafeKit.signTransaction.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() =>
        expect(screen.getByTestId('loading-message')).toHaveTextContent(
          'Signing transaction. Please check your MetaMask.',
        ),
      );
    });

    it('should show execution loading message', async () => {
      mocks.mockSafeKit.createTransaction.mockResolvedValue({ id: 'safe-tx-123' });
      mocks.mockSafeKit.signTransaction.mockResolvedValue({ id: 'signed-tx-123' });
      mocks.mockSafeKit.executeTransaction.mockImplementation(() => new Promise(() => {}));

      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() =>
        expect(screen.getByTestId('loading-message')).toHaveTextContent(
          'Executing transaction. Please confrim on your MetaMask.',
        ),
      );
    });
  });

  describe('Dialog state management', () => {
    it('should reset state when dialog opens', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <MetaAllocatorSignTransactionDialog {...mockProps} open={false} />,
        { wrapper },
      );

      mocks.mockSafeKit.createTransaction.mockRejectedValue(new Error('Test error'));

      rerender(<MetaAllocatorSignTransactionDialog {...mockProps} open={true} />);

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
      });

      rerender(<MetaAllocatorSignTransactionDialog {...mockProps} open={false} />);
      rerender(<MetaAllocatorSignTransactionDialog {...mockProps} open={true} />);

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should call onSubmit with correct parameters', async () => {
      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...mockProps} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(mocks.mockEncodeFunctionData).toHaveBeenCalledWith({
          abi: expect.any(Array),
          functionName: 'addAllowance',
          args: [mockProps.address, BigInt(1000 * 1_125_899_906_842_624)],
        });
      });
    });
  });

  describe('Address conversion scenarios', () => {
    it('should handle Filecoin address conversion successfully', async () => {
      mocks.mockIsFilecoinAddress
        .mockReturnValueOnce(true) // for address
        .mockReturnValueOnce(false); // for maAddress

      mocks.mockClient.request.mockResolvedValue('0x9876543210987654321098765432109876543210');

      const propsWithFilecoinAddress = {
        ...mockProps,
        address: 'f1abc123def456',
      };

      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...propsWithFilecoinAddress} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      const successHeader = await screen.findByTestId('success-header');
      expect(successHeader).toHaveTextContent('Success!');

      expect(mocks.mockClient.request).toHaveBeenCalledWith({
        method: 'Filecoin.FilecoinAddressToEthAddress',
        params: ['f1abc123def456'],
      });
    });

    it('should handle MetaAllocator contract address conversion', async () => {
      mocks.mockIsFilecoinAddress
        .mockReturnValueOnce(false) // for address
        .mockReturnValueOnce(true); // for maAddress

      mocks.mockClient.request.mockResolvedValue('0x9876543210987654321098765432109876543210');

      const propsWithFilecoinContract = {
        ...mockProps,
        maAddress: 'f1contract123' as `0x${string}`,
      };

      const user = userEvent.setup();
      render(<MetaAllocatorSignTransactionDialog {...propsWithFilecoinContract} />, { wrapper });

      await user.type(screen.getByRole('spinbutton', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      const successHeader = await screen.findByTestId('success-header');
      expect(successHeader).toHaveTextContent('Success!');

      expect(mocks.mockClient.request).toHaveBeenCalledWith({
        method: 'Filecoin.FilecoinAddressToEthAddress',
        params: ['f1contract123'],
      });
    });
  });
});
