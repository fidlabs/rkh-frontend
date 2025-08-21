import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { GovernanceReviewForm } from './GovernanceReviewForm';
import { Application } from '@/types/application';
import { createWrapper } from '@/test-utils';
import { createFormProviderWrapper } from '@/test-utils/form-provider-wrapper';
import { WrapperBuilder } from '@/test-utils/wrapper-builder';

const mocks = vi.hoisted(() => ({
  mockOnSubmit: vi.fn(),
}));

describe('GovernanceReviewForm', () => {
  const mockApplication: Application = {
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

  const wrapper = WrapperBuilder.create()
    .with(createWrapper())
    .with(createFormProviderWrapper())
    .build();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render form with all required elements', () => {
    render(<GovernanceReviewForm application={mockApplication} onSubmit={mocks.mockOnSubmit} />, {
      wrapper,
    });

    expect(screen.getByRole('form')).toBeInTheDocument();
    expect(screen.getByTestId('governance-review-form-legend')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Update JSON only, no onchain DC Allocation' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Allocator Type')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Datacap' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'APPROVE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'REJECT' })).toBeInTheDocument();
  });

  it('should display application datacap as default value', () => {
    render(<GovernanceReviewForm application={mockApplication} onSubmit={mocks.mockOnSubmit} />, {
      wrapper,
    });

    const datacapInput = screen.getByRole('spinbutton', { name: 'Datacap' });
    expect(datacapInput).toHaveValue(mockApplication.datacap);
  });

  it('should set intent to approve when approve button is clicked', async () => {
    const user = userEvent.setup();

    render(<GovernanceReviewForm application={mockApplication} onSubmit={mocks.mockOnSubmit} />, {
      wrapper,
    });

    const hiddenSelect = screen.getByRole('combobox', { name: 'Allocator Type' });
    fireEvent.click(hiddenSelect, { force: true });
    fireEvent.click(screen.getByRole('option', { name: 'MDMA' }), { force: true });

    const approveButton = screen.getByRole('button', { name: 'APPROVE' });
    await user.click(approveButton);

    expect(mocks.mockOnSubmit).toHaveBeenCalledWith(
      {
        intent: 'approve',
        dataCap: String(mockApplication.datacap),
        allocatorType: 'MDMA',
        isMDMAAllocatorChecked: false,
      },
      expect.any(Object),
    );
  });

  it('should set intent to reject when reject button is clicked', async () => {
    const user = userEvent.setup();

    render(<GovernanceReviewForm application={mockApplication} onSubmit={mocks.mockOnSubmit} />, {
      wrapper,
    });

    const hiddenSelect = screen.getByRole('combobox', { name: 'Allocator Type' });
    fireEvent.click(hiddenSelect, { force: true });
    fireEvent.click(screen.getByRole('option', { name: 'MDMA' }), { force: true });

    const rejectButton = screen.getByRole('button', { name: 'REJECT' });
    await user.click(rejectButton);

    expect(mocks.mockOnSubmit).toHaveBeenCalledWith(
      {
        intent: 'reject',
        dataCap: String(mockApplication.datacap),
        allocatorType: 'MDMA',
        isMDMAAllocatorChecked: false,
      },
      expect.any(Object),
    );
  });
});
