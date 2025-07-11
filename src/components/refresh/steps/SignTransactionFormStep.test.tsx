import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SignTransactionFormStep } from './SignTransactionFormStep';

describe('SignTransactionFormStep', () => {
  const mockProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with required fields', () => {
    render(<SignTransactionFormStep {...mockProps} />);

    expect(screen.getByRole('textbox', { name: /datacap/i })).toBeInTheDocument();
  });

  it('should render approve and cancel buttons', () => {
    render(<SignTransactionFormStep {...mockProps} />);

    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<SignTransactionFormStep {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should show validation error for empty datacap field', async () => {
    const user = userEvent.setup();
    render(<SignTransactionFormStep {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /approve/i });
    await user.click(submitButton);

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(1);
    expect(alerts.at(0)).toHaveTextContent('Data Cap is required');
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<SignTransactionFormStep {...mockProps} />);

    const dataCapInput = screen.getByRole('textbox', { name: /datacap/i });
    const submitButton = screen.getByRole('button', { name: /approve/i });

    await user.type(dataCapInput, '1000');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith(
        {
          dataCap: '1000',
        },
        expect.anything(),
      );
    });
  });

  it('should clear validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<SignTransactionFormStep {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /approve/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryAllByRole('alert')).toHaveLength(1);
    });

    const dataCapInput = screen.getByRole('textbox', { name: /datacap/i });
    await user.type(dataCapInput, '100');

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('should display both from and to addresses when provided', () => {
    const propsWithBothAddresses = {
      ...mockProps,
      fromAddress: 'f1234567890abcdef',
      toAddress: 'f9876543210fedcba',
    };

    render(<SignTransactionFormStep {...propsWithBothAddresses} />);

    expect(screen.getByTestId('from-address')).toHaveTextContent(
      propsWithBothAddresses.fromAddress,
    );
    expect(screen.getByTestId('to-address')).toHaveTextContent(propsWithBothAddresses.toAddress);
  });

  it('should not display addresses when not provided', () => {
    render(<SignTransactionFormStep {...mockProps} />);

    expect(screen.queryByTestId('from-address')).not.toBeInTheDocument();
    expect(screen.queryByTestId('to-address')).not.toBeInTheDocument();
  });
});
