import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApproveTransactionDetailsStep } from './ApproveTransactionDetailsStep';

describe('ApproveTransactionDetailsStep', () => {
  const mockProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ApproveTransactionDetailsStep {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should call onSubmit when approve button is clicked', async () => {
    const user = userEvent.setup();
    render(<ApproveTransactionDetailsStep {...mockProps} />);

    const approveButton = screen.getByRole('button', { name: /approve/i });
    await user.click(approveButton);

    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should display all transaction details when provided', () => {
    const propsWithAllDetails = {
      ...mockProps,
      fromAddress: 'f1234567890abcdef',
      toAddress: 'f9876543210fedcba',
      dataCap: 500,
    };

    render(<ApproveTransactionDetailsStep {...propsWithAllDetails} />);

    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByText('f1234567890abcdef')).toBeInTheDocument();
    expect(screen.getByText('To:')).toBeInTheDocument();
    expect(screen.getByText('f9876543210fedcba')).toBeInTheDocument();
    expect(screen.getByText('DataCap:')).toBeInTheDocument();
    expect(screen.getByText('500 PiB')).toBeInTheDocument();
  });

  it('should not display transaction details when not provided', () => {
    render(<ApproveTransactionDetailsStep {...mockProps} />);

    expect(screen.queryByText('From:')).not.toBeInTheDocument();
    expect(screen.queryByText('To:')).not.toBeInTheDocument();
    expect(screen.queryByText('DataCap:')).not.toBeInTheDocument();
  });
});
