import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RefreshAllocatorButton } from './RefreshAllocatorButton';

describe('RefreshAllocatorButton', () => {
  it('should call onClick when clicked', async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();

    render(<RefreshAllocatorButton onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /refresh allocator/i });
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
