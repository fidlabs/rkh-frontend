import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RkhApproveTransactionButton } from './RkhApproveTransactionButton';
import { createWrapper } from '@/test-utils';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
}));

vi.mock('@/hooks/useAccount', () => ({
  useAccount: mocks.mockUseAccount,
}));

describe('RkhApproveTransactionButton', () => {
  const wrapper = createWrapper();
  const defaultProps = {
    address: 'f1abc',
    transactionId: 42,
    datacap: 2048,
    fromAccount: 'f1from',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      account: null,
    });
  });

  it('renders the button label', () => {
    render(<RkhApproveTransactionButton {...defaultProps} />, { wrapper });
    expect(screen.getByRole('button', { name: /rkh approve/i })).toBeInTheDocument();
  });

  it('opens the dialog on click', async () => {
    const user = userEvent.setup();
    render(<RkhApproveTransactionButton {...defaultProps} />, { wrapper });
    await user.click(screen.getByRole('button', { name: /rkh approve/i }));

    expect(await screen.findByRole('dialog', { name: /approve as rkh/i })).toBeInTheDocument();
  });

  it('closes the dialog via Cancel', async () => {
    const user = userEvent.setup();
    render(<RkhApproveTransactionButton {...defaultProps} />, { wrapper });
    await user.click(screen.getByRole('button', { name: /rkh approve/i }));

    const dialog = await screen.findByRole('dialog', { name: /approve as rkh/i });
    expect(dialog).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('dialog', { name: /approve as rkh/i })).not.toBeInTheDocument();
  });
});
