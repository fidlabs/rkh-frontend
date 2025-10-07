import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RefreshAllocatorSuccessStep } from './RefreshAllocatorSuccessStep';

const mocks = vi.hoisted(() => ({
  mockUseToast: vi.fn(),
  mockToast: vi.fn(),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: mocks.mockUseToast,
}));

describe('RefreshAllocatorSuccessStep', () => {
  const mockOnClose = vi.fn();

  const props = {
    messageId: 'transaction-id-123',
    blockNumber: 1234,
    onClose: mockOnClose,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseToast.mockReturnValue({
      toast: mocks.mockToast,
    });
  });

  it('should render success message', () => {
    render(<RefreshAllocatorSuccessStep {...props} />);

    expect(screen.getByTestId('success-header')).toHaveTextContent('Success!');
    expect(screen.getByTestId('transaction-id-section')).toHaveTextContent(
      'Transaction IDtransaction-id-123',
    );
    expect(screen.getByTestId('block-number-section')).toHaveTextContent('Block number1234');
  });

  it('should call onClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorSuccessStep onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have only one button in footer', () => {
    render(<RefreshAllocatorSuccessStep onClose={mockOnClose} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent(/close/i);
  });

  it('should handle copy transaction-id to clipboard', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorSuccessStep {...props} />);

    const copyButton = screen.getByTestId('copy-transaction-id');
    await user.click(copyButton);

    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBe(props.messageId);
    expect(mocks.mockToast).toHaveBeenCalledWith({
      title: 'Copied to clipboard',
      description: 'TxID has been copied to your clipboard.',
    });
  });

  it('should handle copy block-number to clipboard', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorSuccessStep {...props} />);

    const copyButton = screen.getByTestId('copy-block-number');
    await user.click(copyButton);

    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toBe(String(props.blockNumber));
    expect(mocks.mockToast).toHaveBeenCalledWith({
      title: 'Copied to clipboard',
      description: 'Block number has been copied to your clipboard.',
    });
  });
});
