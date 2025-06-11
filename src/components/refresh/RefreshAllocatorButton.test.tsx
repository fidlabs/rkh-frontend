import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RefreshAlloactorButton } from './RefreshAlloactorButton';

describe('RefreshAlloactorButton', () => {
  it('should render button with correct text', () => {
    render(<RefreshAlloactorButton />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Refresh Alloactor');
  });

  it('should call onClick when clicked', async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();

    render(<RefreshAlloactorButton onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
