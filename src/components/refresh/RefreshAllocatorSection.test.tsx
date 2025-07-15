import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RefreshAllocatorSection } from './RefreshAllocatorSection';
import { createWrapper } from '@/test-utils';

const mocks = vi.hoisted(() => ({
  mockProposeUseRKHTransaction: vi.fn(),
}));

vi.mock('@/hooks/useProposeRKHTransaction', () => ({
  useProposeRKHTransaction: mocks.mockProposeUseRKHTransaction.mockReturnValue({
    proposeTransaction: vi.fn(),
  }),
}));

describe('RefreshAllocatorSection', () => {
  const wrapper = createWrapper();

  it('should not show dialog initially', () => {
    render(<RefreshAllocatorSection />, { wrapper });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorSection />, { wrapper });

    const button = screen.getByRole('button', { name: /refresh allocator/i });
    await user.click(button);

    expect(screen.getByRole('dialog', { name: /Refresh Allocator/i })).toBeInTheDocument();
  });

  it('should show form fields when dialog is opened', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorSection />, { wrapper });

    const button = screen.getByRole('button', { name: /refresh allocator/i });
    await user.click(button);

    expect(screen.getByRole('textbox', { name: /Allocator address/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /DataCap in PiB/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
  });

  it('should close dialog when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<RefreshAllocatorSection />, { wrapper });

    const button = screen.getByRole('button', { name: /refresh allocator/i });
    await user.click(button);

    const dialog = screen.getByRole('dialog', { name: /Refresh Allocator/i });
    expect(dialog).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(dialog).not.toBeInTheDocument();
  });
});
