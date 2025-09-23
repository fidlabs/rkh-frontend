import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useGovernanceReview } from './useGovernanceReview';
import { GovernanceReviewFormValues } from '@/components/governance-review/GovernanceReviewForm';
import { createWrapper } from '@/test-utils/query-client';
import { SignatureType } from '@/types/governance-review';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockGovernanceReview: vi.fn(),
  mockOnSignaturePending: vi.fn(),
  mockOnReviewPending: vi.fn(),
  mockSignStateMessage: vi.fn(),
  mockOnSuccess: vi.fn(),
  mockOnError: vi.fn(),
}));

vi.mock('@/hooks/useAccount', () => ({
  useAccount: mocks.mockUseAccount,
}));

vi.mock('@/lib/api', () => ({
  governanceReview: mocks.mockGovernanceReview,
}));

describe('useGovernanceReview', () => {
  const fixtureFormData: GovernanceReviewFormValues = {
    allocatorType: 'MDMA',
    dataCap: 100,
    isMDMAAllocatorChecked: false,
    intent: 'approve',
    reason: 'Test reason',
  };

  const fixtureAccount = {
    address: '0x9876543210987654321098765432109876543210',
    wallet: {
      getPubKey: vi.fn(() => 'test-public-key'),
    },
  };

  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      signStateMessage: mocks.mockSignStateMessage.mockResolvedValue('test-signature'),
      account: fixtureAccount,
    });

    // Mock governanceReview to return a proper Response object
    mocks.mockGovernanceReview.mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  it('should call callbacks after mutateAsync is called', async () => {
    const { result } = renderHook(
      () =>
        useGovernanceReview({
          signatureType: SignatureType.ApproveGovernanceReview,
          onSignaturePending: mocks.mockOnSignaturePending,
          onReviewPending: mocks.mockOnReviewPending,
          onSuccess: mocks.mockOnSuccess,
          onError: mocks.mockOnError,
        }),
      { wrapper },
    );

    await result.current.mutateAsync({ id: 'test-app-123', payload: fixtureFormData });

    expect(mocks.mockOnSignaturePending).toHaveBeenCalledTimes(1);
    expect(mocks.mockOnReviewPending).toHaveBeenCalledTimes(1);
    expect(mocks.mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  it('should call governanceReview API with correct data', async () => {
    const { result } = renderHook(
      () =>
        useGovernanceReview({
          signatureType: SignatureType.ApproveGovernanceReview,
          onSignaturePending: mocks.mockOnSignaturePending,
          onReviewPending: mocks.mockOnReviewPending,
          onSuccess: mocks.mockOnSuccess,
          onError: mocks.mockOnError,
        }),
      { wrapper },
    );

    await result.current.mutateAsync({ id: 'test-app-123', payload: fixtureFormData });

    expect(mocks.mockSignStateMessage).toHaveBeenCalledWith(
      `Governance approve test-app-123 100 ${fixtureFormData.allocatorType}`,
    );
    expect(mocks.mockGovernanceReview).toHaveBeenCalledWith(
      SignatureType.ApproveGovernanceReview,
      'test-app-123',
      {
        result: 'approve',
        details: {
          finalDataCap: fixtureFormData.dataCap,
          allocatorType: fixtureFormData.allocatorType,
          isMDMAAllocator: fixtureFormData.isMDMAAllocatorChecked,
          reason: fixtureFormData.reason,
          reviewerAddress: fixtureAccount.address,
          reviewerPublicKey: fixtureAccount.wallet.getPubKey(),
        },
        signature: 'test-signature',
      },
    );
  });

  it('should handle errors correctly', async () => {
    const apiError = new Error('API failed');
    mocks.mockGovernanceReview.mockRejectedValue(apiError);

    const { result } = renderHook(
      () =>
        useGovernanceReview({
          signatureType: SignatureType.ApproveGovernanceReview,
          onSignaturePending: mocks.mockOnSignaturePending,
          onReviewPending: mocks.mockOnReviewPending,
          onSuccess: mocks.mockOnSuccess,
          onError: mocks.mockOnError,
        }),
      { wrapper },
    );

    await expect(
      result.current.mutateAsync({ id: 'test-app-123', payload: fixtureFormData }),
    ).rejects.toThrow('API failed');

    expect(mocks.mockOnError).toHaveBeenCalledWith(apiError);
  });
});
