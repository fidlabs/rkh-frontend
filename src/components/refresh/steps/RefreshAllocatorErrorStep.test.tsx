import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RefreshAllocatorErrorStep } from './RefreshAllocatorErrorStep';

describe('RefreshAllocatorErrorStep', () => {
  const mockProps = {
    onGoBack: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render error message', () => {
    render(<RefreshAllocatorErrorStep {...mockProps} />);

    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  });

  it('should render both action buttons', () => {
    render(<RefreshAllocatorErrorStep {...mockProps} />);

    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should call onGoBack when Go back button is clicked', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorErrorStep {...mockProps} />);

    const goBackButton = screen.getByRole('button', { name: /go back/i });
    await user.click(goBackButton);

    expect(mockProps.onGoBack).toHaveBeenCalledTimes(1);
    expect(mockProps.onClose).not.toHaveBeenCalled();
  });

  it('should call onClose when Close button is clicked', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorErrorStep {...mockProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    expect(mockProps.onGoBack).not.toHaveBeenCalled();
  });
});
