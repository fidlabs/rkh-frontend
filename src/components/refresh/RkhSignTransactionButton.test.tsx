import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RkhSignTransactionButton } from './RkhSignTransactionButton';
import { createWrapper } from '@/test-utils';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
}));

vi.mock('@/hooks/useAccount', () => ({
  useAccount: mocks.mockUseAccount,
}));

describe('RkhSignTransactionButton', () => {
  const wrapper = createWrapper();
  const defaultProps = {
    address: 'f1abc',
    dataCap: 1024,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      account: null,
    });
  });

  it('renders the button label', () => {
    render(<RkhSignTransactionButton {...defaultProps} />, { wrapper });
    expect(screen.getByRole('button', { name: /rkh sign/i })).toBeInTheDocument();
  });

  it('opens the dialog on click', async () => {
    const user = userEvent.setup();
    render(<RkhSignTransactionButton {...defaultProps} />, { wrapper });
    await user.click(screen.getByRole('button', { name: /rkh sign/i }));

    expect(await screen.findByRole('dialog', { name: /sign as rkh/i })).toBeInTheDocument();
  });

  it('closes the dialog via Cancel', async () => {
    const user = userEvent.setup();
    render(<RkhSignTransactionButton {...defaultProps} />, { wrapper });
    await user.click(screen.getByRole('button', { name: /rkh sign/i }));

    const dialog = await screen.findByRole('dialog', { name: /sign as rkh/i });
    expect(dialog).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog', { name: /sign as rkh/i })).not.toBeInTheDocument();
  });
});
