import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ApproveGovernanceReviewButton from './ApproveGovernanceReviewButton';
import { Application } from '@/types/application';
import { createWrapper } from '@/test-utils';
import { AccountRole } from '@/types/account';
import { RefreshGovernanceReviewButton } from './RefreshGovernanceReviewButton';
import { MetapathwayType, Refresh, RefreshStatus } from '@/types/refresh';

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
  const fixtureRefresh: Refresh = {
    githubIssueId: 1,
    title: 'Test Refresh',
    creator: { userId: 1, name: 'testuser' },
    assignees: null,
    labels: null,
    state: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    closedAt: null,
    jsonNumber: '1',
    refreshStatus: RefreshStatus.PENDING,
    dataCap: 100,
    msigAddress: 'f1testaddress',
    maAddress: '0xtestmaaddress' as `0x${string}`,
    metapathwayType: MetapathwayType.RKH,
    rkhPhase: {
      approvals: ['0x1234567890123456789012345678901234567890'],
      messageId: 1,
    },
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
    render(<RefreshGovernanceReviewButton refresh={fixtureRefresh} />, { wrapper });

    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    render(<RefreshGovernanceReviewButton refresh={fixtureRefresh} />, { wrapper });

    const button = screen.getByRole('button', { name: 'Review' });
    await userEvent.click(button);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should close dialog when close button is clicked', async () => {
    render(<RefreshGovernanceReviewButton refresh={fixtureRefresh} />, { wrapper });

    const button = screen.getByRole('button', { name: 'Review' });
    await userEvent.click(button);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
