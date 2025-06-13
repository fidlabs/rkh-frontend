import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RefreshAllocatorSection } from './RefreshAllocatorSection';

vi.mock('@/hooks/useRKHTransaction', () => ({
  useRKHTransaction: () => ({
    proposeTransaction: vi.fn(),
  }),
}));

describe('RefreshAllocatorSection', () => {
  it('should not show dialog initially', () => {
    render(<RefreshAllocatorSection />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorSection />);

    const button = screen.getByRole('button', { name: /refresh allocator/i });
    await user.click(button);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Refresh Allocator')).toBeInTheDocument();
  });

  it('should show form fields when dialog is opened', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorSection />);

    const button = screen.getByRole('button', { name: /refresh allocator/i });
    await user.click(button);

    expect(screen.getByRole('textbox', { name: /Allocator address/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /DataCap/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
  });

  it('should close dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorSection />);

    const button = screen.getByRole('button', { name: /refresh allocator/i });
    await user.click(button);

    const dialog = screen.getByRole('dialog', { name: /Refresh Allocator/i });
    expect(dialog).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(dialog).not.toBeInTheDocument();
  });
});
