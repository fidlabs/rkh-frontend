import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GovernanceReviewFormLegend } from './GovernanceReviewFormLegend';
import { createWrapper } from '@/test-utils';

const mocks = vi.hoisted(() => ({
  mockUseWatch: vi.fn(),
}));

vi.mock('react-hook-form', async importOriginal => ({
  ...(await importOriginal()),
  useWatch: mocks.mockUseWatch,
}));

describe('GovernanceReviewFormLegend', () => {
  const mockApplicationName = 'Test Application';
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockUseWatch.mockReturnValue(100);
  });

  it('should render application name correctly', () => {
    render(<GovernanceReviewFormLegend applicationName={mockApplicationName} />, { wrapper });

    expect(screen.getByTestId('governance-review-form-legend')).toHaveTextContent(
      `Approving ${mockApplicationName} for 100 PiBs.`,
    );
  });

  it('should render instruction text', () => {
    render(<GovernanceReviewFormLegend applicationName={mockApplicationName} />, { wrapper });

    const legend = screen.getByTestId('governance-review-form-legend');

    expect(legend).toHaveTextContent(/Please confirm your Ledger is still connected/);
    expect(legend).toHaveTextContent(/then confirm PiB amount and allocator type to approve/);
  });
});
