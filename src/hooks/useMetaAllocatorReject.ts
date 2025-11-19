import { useMutation } from '@tanstack/react-query';
import { useAccount } from '@/hooks';
import { useCallback } from 'react';
import { governanceReview } from '@/lib/api';
import { GovernanceReviewFormValues } from '@/components/governance-review/GovernanceReviewForm';
import { SignStateMessageMethodFactory } from '@/lib/factories/sign-state-message-factory';
import { SignatureType } from '@/types/governance-review';

interface UseMetaAllocatorRejectProps {
  signatureType: SignatureType;
  onSignaturePending?: () => void;
  onReviewPending?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * use case hook to reject refresh as metaallocator using EVM signature
 */
export const useMetaAllocatorReject = ({
  signatureType,
  onSignaturePending,
  onReviewPending,
  onSuccess,
  onError,
}: UseMetaAllocatorRejectProps) => {
  const { account, signStateMessage } = useAccount();

  const handleMetaAllocatorReject = useCallback(
    async (id: string, data: GovernanceReviewFormValues) => {
      try {
        onSignaturePending?.();
        const signature = await signStateMessage(
          SignStateMessageMethodFactory.create(signatureType as SignatureType)({
            result: 'reject',
            id,
            finalDataCap: 0,
            allocatorType: data.allocatorType,
          }),
        );

        const reviewData = {
          result: 'reject',
          details: {
            finalDataCap: '0',
            allocatorType: data.allocatorType,
            reason: data.reason || 'No reason given',
            reviewerAddress:
              account?.address?.toLowerCase() || '0x0000000000000000000000000000000000000000',
            reviewerPublicKey: Buffer.from('0x0').toString('base64'),
            isMDMAAllocator: data.isMDMAAllocatorChecked,
          },
          signature: signature,
        };

        onReviewPending?.();

        const response = await governanceReview(signatureType, id, reviewData);

        if (response.ok) {
          onSuccess?.();
        } else {
          const errorMessage = `Failed to submit MetaAllocator reject, status: ${response.status}`;
          onError?.(new Error(errorMessage));
        }
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [account?.address, onReviewPending, onSuccess, onError, signatureType],
  );

  return useMutation({
    mutationKey: ['handleMetaAllocatorReject'],
    mutationFn: ({ id, payload }: { id: string; payload: GovernanceReviewFormValues }) =>
      handleMetaAllocatorReject(id, payload),
  });
};
