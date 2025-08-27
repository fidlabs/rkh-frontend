import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import ApproveGovernanceReviewDialog from './ApproveGovernanceReviewDialog';
import { Application } from '@/types/application';
import { createWrapper } from '@/test-utils';

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
  const fixtureApplication: Application = {
    id: 'test-app-123',
    name: 'Test Application',
    number: 1,
    organization: 'Test Org',
    address: '0x1234567890123456789012345678901234567890',
    github: 'test-org/test-repo',
    country: 'US',
    region: 'CA',
    type: 'allocator',
    githubPrNumber: '123',
    githubPrLink: 'https://github.com/test-org/test-repo/pull/123',
    datacap: 100,
    status: 'GOVERNANCE_REVIEW_PHASE',
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
  });

  it('should render dialog when open', () => {
    render(
      <ApproveGovernanceReviewDialog
        open
        application={fixtureApplication}
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );
    expect(screen.getByText('Approve Application')).toBeInTheDocument();
    expect(
      screen.getByText(/Approve Application on behalf of the Governance Team/),
    ).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <ApproveGovernanceReviewDialog
        application={fixtureApplication}
        open={false}
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );

    expect(screen.queryByText('Approve Application')).not.toBeInTheDocument();
  });

  it('should render governance review form', () => {
    render(
      <ApproveGovernanceReviewDialog
        application={fixtureApplication}
        open
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );

    expect(screen.getByTestId('governance-review-form-legend')).toBeInTheDocument();
    expect(screen.getByText('Update JSON only, no onchain DC Allocation')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Allocator Type' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Datacap' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'APPROVE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REJECT' })).toBeInTheDocument();
  });

  it('should handle form submission correctly', async () => {
    render(
      <ApproveGovernanceReviewDialog
        application={fixtureApplication}
        open
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );

    const hiddenSelect = screen.getByRole('combobox', { name: 'Allocator Type' });
    fireEvent.click(hiddenSelect, { force: true });
    fireEvent.click(screen.getByRole('option', { name: 'MDMA' }), { force: true });

    const approveButton = screen.getByRole('button', { name: 'APPROVE' });
    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(mocks.mockGovernanceReview).toHaveBeenCalled();
    });
    expect(mocks.mockSignStateMessage).toHaveBeenCalledWith(`Governance approve test-app-123 100 MDMA`);
  });

  it('should show loading state when transaction is pending', async () => {
    const neverResolvingPromise = new Promise(() => {});
    mocks.mockGovernanceReview.mockImplementation(() => neverResolvingPromise);

    render(
      <ApproveGovernanceReviewDialog
        application={fixtureApplication}
        open
        onOpenChange={mockOnOpenChange}
      />,
      { wrapper },
    );

    const hiddenSelect = screen.getByRole('combobox', { name: 'Allocator Type' });
    fireEvent.click(hiddenSelect, { force: true });
    fireEvent.click(screen.getByRole('option', { name: 'MDMA' }), { force: true });

    const approveButton = screen.getByRole('button', { name: 'APPROVE' });
    await userEvent.click(approveButton);

    expect(mocks.mockSignStateMessage).toHaveBeenCalledWith('Governance approve test-app-123 100 MDMA');

    const loader = screen.getByTestId('loading-message');
    expect(loader).toHaveTextContent('Submitting review...');
  });
});
