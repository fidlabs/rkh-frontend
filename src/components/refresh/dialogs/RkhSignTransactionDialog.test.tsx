import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RkhSignTransactionDialog } from './RkhSignTransactionDialog';
import { createWrapper } from '@/test-utils';
import { ApiStateWaitMsgResponse } from '@/types/filecoin-client';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockProposeAddVerifier: vi.fn(),
  mockGetStateWaitMsg: vi.fn(),
  mockUseToast: vi.fn(),
  mockToast: vi.fn(),
}));

vi.mock('@/lib/glif-api', () => ({
  getStateWaitMsg: mocks.mockGetStateWaitMsg,
}));

vi.mock('@/hooks/useAccount', () => ({
  useAccount: mocks.mockUseAccount,
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: mocks.mockUseToast,
}));

describe('RkhSignTransactionDialog Integration Tests', () => {
  const wrapper = createWrapper();
  const mockProps = {
    open: true,
    address: 'f1234567890abcdef',
    dataCap: 1000,
    onOpenChange: vi.fn(),
  };
  const mockStateWaitResponse: ApiStateWaitMsgResponse = {
    data: {
      Height: 12345,
      Message: { '/': 'message-id-123' },
      Receipt: {
        EventsRoot: null,
        ExitCode: 0,
        GasUsed: 1000,
        Return: 'success',
      },
      ReturnDec: {
        Applied: true,
        Code: 0,
        Ret: 'success',
      },
      TipSet: [{ '/': 'tipset-cid' }],
    },
    error: '',
    success: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      proposeAddVerifier: mocks.mockProposeAddVerifier,
    });

    mocks.mockUseToast.mockReturnValue({
      toast: mocks.mockToast,
    });
  });

  it('should render dialog with correct title and description', () => {
    render(<RkhSignTransactionDialog {...mockProps} />, { wrapper });

    const dialog = screen.getByRole('dialog', { name: /Sign as RKH/i });
    expect(dialog).toHaveTextContent('Signing a RKH transaction to refresh DataCap');
  });

  it('should display all details in form step', () => {
    render(<RkhSignTransactionDialog {...mockProps} />, { wrapper });

    expect(screen.getByTestId('to-address')).toHaveTextContent('To:f1234567890abcdef');
    expect(screen.getByTestId('data-cap')).toHaveTextContent('DataCap:1000 PiB');
  });

  describe('Success flow', () => {
    beforeEach(() => {
      mocks.mockProposeAddVerifier.mockResolvedValue('message-id-123');
      mocks.mockGetStateWaitMsg.mockResolvedValue(mockStateWaitResponse);
    });

    it('should go through complete success flow', async () => {
      const user = userEvent.setup();
      render(<RkhSignTransactionDialog {...mockProps} />, { wrapper });

      await user.click(screen.getByRole('button', { name: /approve/i }));

      expect(mocks.mockProposeAddVerifier).toHaveBeenCalledWith(mockProps.address, 1000);

      const successHeader = await screen.findByTestId('success-header');
      expect(successHeader).toHaveTextContent('Success!');

      const transactionIdSection = screen.getByTestId('transaction-id-section');
      expect(transactionIdSection).toHaveTextContent('Transaction IDmessage-id-123');

      const blockNumberSection = screen.getByTestId('block-number-section');
      expect(blockNumberSection).toHaveTextContent('Block number12345');
    });

    it('should close dialog from success step', async () => {
      const user = userEvent.setup();
      render(<RkhSignTransactionDialog {...mockProps} />, { wrapper });

      await user.click(screen.getByRole('button', { name: /approve/i }));

      const successHeader = await screen.findByTestId('success-header');
      expect(successHeader).toHaveTextContent('Success!');

      await user.click(screen.getAllByRole('button', { name: /close/i })[0]);

      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Error flow', () => {
    beforeEach(() => {
      mocks.mockProposeAddVerifier.mockRejectedValue(new Error('Transaction failed'));
    });

    it('should show error step when transaction fails', async () => {
      const user = userEvent.setup();
      render(<RkhSignTransactionDialog {...mockProps} />, { wrapper });

      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Transaction failed');
      });
    });

    it('should go back to form from error step', async () => {
      const user = userEvent.setup();
      render(<RkhSignTransactionDialog {...mockProps} />, { wrapper });

      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Transaction failed');
      });

      await user.click(screen.getByRole('button', { name: /go back/i }));

      expect(screen.getByTestId('data-cap')).toHaveTextContent('DataCap:1000 PiB');
      expect(screen.getByTestId('to-address')).toHaveTextContent('To:f1234567890abcdef');
    });
  });

  describe('Loading state', () => {
    beforeEach(() => {
      mocks.mockProposeAddVerifier.mockResolvedValue('message-id-123');
      mocks.mockGetStateWaitMsg.mockResolvedValue(mockStateWaitResponse);
    });

    it('should show loading step during ledger transaction', async () => {
      mocks.mockProposeAddVerifier.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();

      render(<RkhSignTransactionDialog {...mockProps} />, { wrapper });

      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() =>
        expect(screen.getByTestId('loading-message')).toHaveTextContent(
          'Proposing transaction. Please check your Ledger.',
        ),
      );
    });

    it('should show loading state during getStateWaitMsg', async () => {
      mocks.mockGetStateWaitMsg.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();

      render(<RkhSignTransactionDialog {...mockProps} />, { wrapper });

      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() =>
        expect(screen.getByTestId('loading-message')).toHaveTextContent(
          'Checking the block number please wait... Do not close this window.',
        ),
      );
    });
  });

  it('should close dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<RkhSignTransactionDialog {...mockProps} />, { wrapper });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
