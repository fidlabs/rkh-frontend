import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RkhApproveTransactionDialog } from './RkhApproveTransactionDialog';
import { createWrapper } from '@/test-utils';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockAcceptVerifierProposal: vi.fn(),
  mockUseToast: vi.fn(),
  mockToast: vi.fn(),
}));

vi.mock('@/hooks/useAccount', () => ({
  useAccount: mocks.mockUseAccount,
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: mocks.mockUseToast,
}));

describe('RkhApproveTransactionDialog Integration Tests', () => {
  const wrapper = createWrapper();
  const mockProps = {
    open: true,
    address: 'f9876543210fedcba',
    transactionId: 123,
    datacap: 1000,
    fromAccount: 'f1234567890abcdef',
    onOpenChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      acceptVerifierProposal: mocks.mockAcceptVerifierProposal,
    });

    mocks.mockUseToast.mockReturnValue({
      toast: mocks.mockToast,
    });
  });

  it('should render dialog with correct title and description', () => {
    render(<RkhApproveTransactionDialog {...mockProps} />, { wrapper });

    const dialog = screen.getByRole('dialog', { name: /Approve as RKH/i });
    expect(dialog).toHaveTextContent(
      'Approving a RKH transaction to assign DataCap to an refresh application',
    );
  });

  it('should display transaction details in form step', () => {
    render(<RkhApproveTransactionDialog {...mockProps} />, { wrapper });

    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByText('f1234567890abcdef')).toBeInTheDocument();
    expect(screen.getByText('To:')).toBeInTheDocument();
    expect(screen.getByText('f9876543210fedcba')).toBeInTheDocument();
    expect(screen.getByText('DataCap:')).toBeInTheDocument();
    expect(screen.getByText('1000 PiB')).toBeInTheDocument();
  });

  describe('Success flow', () => {
    beforeEach(() => {
      mocks.mockAcceptVerifierProposal.mockResolvedValue('message-id-456');
    });

    it('should go through complete success flow', async () => {
      const user = userEvent.setup();
      render(<RkhApproveTransactionDialog {...mockProps} />, { wrapper });

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /approve/i }));

      expect(mocks.mockAcceptVerifierProposal).toHaveBeenCalledWith(
        'f9876543210fedcba',
        1000,
        'f1234567890abcdef',
        123,
      );

      const successHeader = await screen.findByTestId('success-header');
      expect(successHeader).toHaveTextContent('Success!');

      const transactionIdSection = screen.getByTestId('transaction-id-section');
      expect(transactionIdSection).toHaveTextContent('Transaction IDmessage-id-456');
    });
  });

  describe('Error flow', () => {
    beforeEach(() => {
      mocks.mockAcceptVerifierProposal.mockRejectedValue(new Error('Approval failed'));
    });

    it('should show error step when transaction fails', async () => {
      const user = userEvent.setup();
      render(<RkhApproveTransactionDialog {...mockProps} />, { wrapper });

      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Approval failed');
      });
    });

    it('should go back to form from error step', async () => {
      const user = userEvent.setup();
      render(<RkhApproveTransactionDialog {...mockProps} />, { wrapper });

      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Approval failed');
      });

      await user.click(screen.getByRole('button', { name: /go back/i }));

      expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
      expect(screen.getByText('From:')).toBeInTheDocument();
      expect(screen.getByText('f1234567890abcdef')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should show loading step during transaction approval', async () => {
      mocks.mockAcceptVerifierProposal.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();

      render(<RkhApproveTransactionDialog {...mockProps} />, { wrapper });

      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() =>
        expect(screen.getByTestId('loading-message')).toHaveTextContent(
          'Proposing transaction. Please check your Ledger.',
        ),
      );
    });
  });

  it('should close dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<RkhApproveTransactionDialog {...mockProps} />, { wrapper });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should reset state when dialog is reopened', () => {
    const { rerender } = render(<RkhApproveTransactionDialog {...mockProps} open={false} />, {
      wrapper,
    });

    mocks.mockAcceptVerifierProposal.mockRejectedValue(new Error('Test error'));

    rerender(<RkhApproveTransactionDialog {...mockProps} open={true} />);

    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByText('From:')).toBeInTheDocument();
  });
});
