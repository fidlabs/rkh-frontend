import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

import { createWrapper } from '@/test-utils';
import RefreshGovernanceReviewDialog from './RefreshGovernanceReviewDialog';
import { MetapathwayType, Refresh, RefreshStatus } from '@/types/refresh';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockUseToast: vi.fn(),
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

describe('ApproveGovernanceReviewDialog', () => {
  const fixtureRefresh: Refresh = {
    githubIssueId: 123,
    githubIssueNumber: 1,
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

  const mockAccount = {
    address: '0x9876543210987654321098765432109876543210',
    wallet: {
      getPubKey: vi.fn(() => Buffer.from('test-public-key')),
    },
  };

  const mockOnOpenChange = vi.fn();
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      account: mockAccount,
      signStateMessage: mocks.mockSignStateMessage,
    });
    mocks.mockSignStateMessage.mockResolvedValue('test-signature');

    // Mock useToast to return a toast function
    mocks.mockUseToast.mockReturnValue({
      toast: vi.fn(),
    });

    // Mock governanceReview to return a proper Response object
    mocks.mockGovernanceReview.mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  it('should render dialog when open', () => {
    render(
      <RefreshGovernanceReviewDialog
        open
        refresh={fixtureRefresh}
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );
    expect(screen.getByText('Approve Refresh')).toBeInTheDocument();
    expect(
      screen.getByText(/Approve Refresh on behalf of the Governance Team/),
    ).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <RefreshGovernanceReviewDialog
        refresh={fixtureRefresh}
        open={false}
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );

    expect(screen.queryByText('Approve Refresh')).not.toBeInTheDocument();
  });

  it('should render governance review form', () => {
    render(
      <RefreshGovernanceReviewDialog
        refresh={fixtureRefresh}
        open
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );

    expect(screen.getByTestId('governance-review-form-legend')).toBeInTheDocument();
    expect(screen.getByTestId('allocator-type')).toHaveTextContent('Allocator Type:RKH');
    expect(screen.getByRole('spinbutton', { name: 'Datacap' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'APPROVE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REJECT' })).toBeInTheDocument();
  });

  it('should handle form submission correctly', async () => {
    render(
      <RefreshGovernanceReviewDialog
        refresh={fixtureRefresh}
        open
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );

    const dataCapInput = screen.getByRole('spinbutton', { name: 'Datacap' });
    await userEvent.type(dataCapInput, '100');

    const approveButton = screen.getByRole('button', { name: 'APPROVE' });
    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(mocks.mockGovernanceReview).toHaveBeenCalled();
    });
    expect(mocks.mockSignStateMessage).toHaveBeenCalledWith(`Governance refresh approve 1 100 RKH`);
  });

  it('should show loading state when transaction is pending', async () => {
    const neverResolvingPromise = new Promise(() => {});
    mocks.mockGovernanceReview.mockImplementation(() => neverResolvingPromise);

    render(
      <RefreshGovernanceReviewDialog
        refresh={fixtureRefresh}
        open
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );

    const dataCapInput = screen.getByRole('spinbutton', { name: 'Datacap' });
    await userEvent.type(dataCapInput, '100');

    const approveButton = screen.getByRole('button', { name: 'APPROVE' });
    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(mocks.mockSignStateMessage).toHaveBeenCalledWith(
        'Governance refresh approve 1 100 RKH',
      );
    });

    const loader = screen.getByTestId('loading-message');
    expect(loader).toHaveTextContent('Submitting review...');
  });
});
