import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ApproveGovernanceReviewButton from './ApproveGovernanceReviewButton';
import { Application } from '@/types/application';
import { createWrapper } from '@/test-utils';
import { AccountRole } from '@/types/account';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockUseToast: vi.fn(),
  mockToast: vi.fn(),
  mockGovernanceReview: vi.fn(),
  mockSignStateMessage: vi.fn(),
}));

vi.mock('@/hooks/useAccount', () => ({
  useAccount: mocks.mockUseAccount,
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: mocks.mockUseToast,
}));

vi.mock('@/lib/api', () => ({
  governanceReview: mocks.mockGovernanceReview,
}));

describe('ApproveGovernanceReviewButton', () => {
  const fixtureApplication: Application = {
    id: 'test-app-123',
    number: 1,
    name: 'Test Allocator',
    organization: 'Test Org',
    address: 'f1testaddress',
    github: 'testuser',
    country: 'US',
    region: 'North America',
    type: 'allocator',
    datacap: 100,
    status: 'GOVERNANCE_REVIEW_PHASE',
    githubPrNumber: '123',
    githubPrLink: 'https://github.com/test/pr/123',
  };

  const fixtureAccount = {
    address: '0x1234567890123456789012345678901234567890',
    role: AccountRole.ROOT_KEY_HOLDER,
    wallet: {
      getPubKey: vi.fn(() => Buffer.from('test-public-key')),
    },
  };

  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      account: fixtureAccount,
      signStateMessage: mocks.mockSignStateMessage.mockResolvedValue('test-signature'),
    });

    // Mock useToast to return a toast function
    mocks.mockUseToast.mockReturnValue({
      toast: mocks.mockToast,
    });
  });

  it('should render approve button', () => {
    render(<ApproveGovernanceReviewButton application={fixtureApplication} />, { wrapper });

    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    render(<ApproveGovernanceReviewButton application={fixtureApplication} />, { wrapper });

    const button = screen.getByRole('button', { name: 'Approve' });
    await userEvent.click(button);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should close dialog when close button is clicked', async () => {
    render(<ApproveGovernanceReviewButton application={fixtureApplication} />, { wrapper });

    const button = screen.getByRole('button', { name: 'Approve' });
    await userEvent.click(button);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
