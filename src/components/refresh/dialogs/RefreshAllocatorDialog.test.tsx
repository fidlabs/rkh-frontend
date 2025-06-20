import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { RefreshAllocatorDialog } from './RefreshAllocatorDialog';
import { createWrapper } from '@/test-utils';
import { ApiStateWaitMsgResponse } from '@/types/filecoin-client';
import { getStateWaitMsg } from '@/lib/glif-api';

const mockProposeAddVerifier = vi.fn();
const mockGetStateWaitMsg = getStateWaitMsg as Mock;
const mockToast = vi.fn();

vi.mock('@/lib/glif-api');

vi.mock('@/hooks/useAccount', () => ({
  useAccount: () => ({
    proposeAddVerifier: mockProposeAddVerifier,
  }),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('RefreshAllocatorDialog Integration Tests', () => {
  const wrapper = createWrapper();
  const mockProps = {
    open: true,
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
  });

  it('should render dialog with correct title and description', () => {
    render(<RefreshAllocatorDialog {...mockProps} />, { wrapper });

    const dialog = screen.getByRole('dialog', { name: /Refresh Allocator/i });
    expect(dialog).toHaveTextContent(
      'Signing a RKH transaction to assign DataCap to an allocator without the full application process. This will not update the Allocator JSON automatically!',
    );
  });

  describe('Success flow', () => {
    beforeEach(() => {
      mockProposeAddVerifier.mockResolvedValue('message-id-123');
      mockGetStateWaitMsg.mockResolvedValue(mockStateWaitResponse);
    });

    it('should go through complete success flow', async () => {
      const user = userEvent.setup();
      render(<RefreshAllocatorDialog {...mockProps} />, { wrapper });

      expect(screen.getByRole('textbox', { name: /allocator address/i })).toBeInTheDocument();

      await user.type(
        screen.getByRole('textbox', { name: /allocator address/i }),
        'f1234567890abcdef',
      );
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      expect(mockProposeAddVerifier).toHaveBeenCalledWith('f1234567890abcdef', '1000');

      const successHeader = await screen.findByTestId('success-header');
      expect(successHeader).toHaveTextContent('Success!');

      const transactionIdSection = screen.getByTestId('transaction-id-section');
      expect(transactionIdSection).toHaveTextContent('Transaction IDmessage-id-123');

      const blockNumberSection = screen.getByTestId('block-number-section');
      expect(blockNumberSection).toHaveTextContent('Block number12345');
    });

    it('should close dialog from success step', async () => {
      const user = userEvent.setup();
      render(<RefreshAllocatorDialog {...mockProps} />, { wrapper });

      await user.type(
        screen.getByRole('textbox', { name: /allocator address/i }),
        'f1234567890abcdef',
      );
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      const successHeader = await screen.findByTestId('success-header');
      expect(successHeader).toHaveTextContent('Success!');

      await user.click(screen.getAllByRole('button', { name: /close/i })[0]);

      expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Error flow', () => {
    beforeEach(() => {
      mockProposeAddVerifier.mockRejectedValue(new Error('Transaction failed'));
    });

    it('should show error step when transaction fails', async () => {
      const user = userEvent.setup();
      render(<RefreshAllocatorDialog {...mockProps} />, { wrapper });

      await user.type(
        screen.getByRole('textbox', { name: /allocator address/i }),
        'f1234567890abcdef',
      );
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Transaction failed');
      });
    });

    it('should go back to form from error step', async () => {
      const user = userEvent.setup();
      render(<RefreshAllocatorDialog {...mockProps} />, { wrapper });

      await user.type(
        screen.getByRole('textbox', { name: /allocator address/i }),
        'f1234567890abcdef',
      );
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Transaction failed');
      });

      await user.click(screen.getByRole('button', { name: /go back/i }));

      expect(screen.getByRole('textbox', { name: /allocator address/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /datacap/i })).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    beforeEach(() => {
      mockProposeAddVerifier.mockResolvedValue('message-id-123');
      mockGetStateWaitMsg.mockResolvedValue(mockStateWaitResponse);
    });

    it('should show loading step during ledger transaction', async () => {
      mockProposeAddVerifier.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();

      render(<RefreshAllocatorDialog {...mockProps} />, { wrapper });

      await user.type(
        screen.getByRole('textbox', { name: /allocator address/i }),
        'f1234567890abcdef',
      );
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() =>
        expect(screen.getByTestId('loading-message')).toHaveTextContent(
          'Proposing transaction. Please check your Ledger.',
        ),
      );
    });

    it('should show loading stat during getStateWaitMsg', async () => {
      mockGetStateWaitMsg.mockImplementation(() => new Promise(() => {}));
      const user = userEvent.setup();

      render(<RefreshAllocatorDialog {...mockProps} />, { wrapper });

      await user.type(
        screen.getByRole('textbox', { name: /allocator address/i }),
        'f1234567890abcdef',
      );
      await user.type(screen.getByRole('textbox', { name: /datacap/i }), '1000');
      await user.click(screen.getByRole('button', { name: /approve/i }));

      await waitFor(() =>
        expect(screen.getByTestId('loading-message')).toHaveTextContent(
          'Checking the block number please wait... Do not close this window.',
        ),
      );
    });
  });
});
