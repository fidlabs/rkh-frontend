import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RefreshAllocatorFormStep } from './RefreshAllocatorFormStep';

describe('RefreshAllocatorFormStep', () => {
  const mockProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with required fields', () => {
    render(<RefreshAllocatorFormStep {...mockProps} />);

    expect(screen.getByRole('textbox', { name: /allocator address/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /datacap/i })).toBeInTheDocument();
  });

  it('should render approve and cancel buttons', () => {
    render(<RefreshAllocatorFormStep {...mockProps} />);

    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorFormStep {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorFormStep {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /approve/i });
    await user.click(submitButton);

    const alerts = screen.getAllByRole('alert');

    expect(alerts.at(0)).toHaveTextContent('Allocator address is required');
    expect(alerts.at(1)).toHaveTextContent('Data Cap is required');
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorFormStep {...mockProps} />);

    const addressInput = screen.getByRole('textbox', { name: /allocator address/i });
    const dataCapInput = screen.getByRole('textbox', { name: /datacap/i });
    const submitButton = screen.getByRole('button', { name: /approve/i });

    await user.type(addressInput, 'f1234567890abcdef');
    await user.type(dataCapInput, '1000');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalledWith(
        {
          allocatorAddress: 'f1234567890abcdef',
          dataCap: '1000',
        },
        expect.anything(),
      );
    });
  });

  it('should clear validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorFormStep {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /approve/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryAllByRole('alert')).toHaveLength(2);
    });

    const addressInput = screen.getByRole('textbox', { name: /allocator address/i });
    const dataCapInput = screen.getByRole('textbox', { name: /datacap/i });
    await user.type(addressInput, 'f1');
    await user.type(dataCapInput, '12');

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
