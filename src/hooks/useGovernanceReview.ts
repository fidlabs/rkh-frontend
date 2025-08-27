import { useMutation } from '@tanstack/react-query';
import { useAccount } from './useAccount';
import { useCallback } from 'react';
import { governanceReview } from '@/lib/api';
import { GovernanceReviewFormValues } from '@/components/governance-review/GovernanceReviewForm';

interface UseGovernanceReviewProps {
  onSignaturePending?: () => void;
  onReviewPending?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useGovernanceReview = ({
  onSignaturePending,
  onReviewPending,
  onSuccess,
  onError,
}: UseGovernanceReviewProps) => {
  const { signStateMessage, account } = useAccount();

  const handleGovernanceReview = useCallback(
    async (id: string, data: GovernanceReviewFormValues) => {
      try {
        onSignaturePending?.();
        const signature = await signStateMessage(
          `Governance ${data.intent} ${id} ${data.dataCap} ${data.allocatorType}`,
        );

        const pubKey =
          account?.wallet?.getPubKey() || Buffer.from('0x0000000000000000000000000000000000000000');
        const safePubKey = pubKey?.toString('base64');

        const reviewData = {
          result: data.intent,
          details: {
            finalDataCap: data.dataCap,
            allocatorType: data.allocatorType,
            reason: data.reason || 'No reason given',
            reviewerAddress: account?.address || '0x0000000000000000000000000000000000000000',
            reviewerPublicKey: safePubKey,
            isMDMAAllocator: data.isMDMAAllocatorChecked,
          },
          signature: signature,
        };

        onReviewPending?.();
        await governanceReview(id, reviewData);
        onSuccess?.();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      }
    },
    [
      signStateMessage,
      account?.address,
      account?.wallet,
      onSignaturePending,
      onReviewPending,
      onSuccess,
      onError,
    ],
  );

  return useMutation({
    mutationKey: ['handleGovernanceReview'],
    mutationFn: ({ id, payload }: { id: string; payload: GovernanceReviewFormValues }) =>
      handleGovernanceReview(id, payload),
  });
};
