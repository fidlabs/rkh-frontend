import { useMutation } from '@tanstack/react-query';
import { useAccount } from '@/hooks';

interface UseApproveRKHTransactionProps {
  onApproveTransaction?: () => void;
  onApproveTransactionFailed?: (error: unknown) => void;
  onApproveTransactionSuccess?: (messageId: string) => void;
}

interface ApproveTransactionParams {
  address: string;
  datacap: number;
  fromAccount: string;
  transactionId: number;
}

export function useApproveRKHTransaction({
  onApproveTransaction,
  onApproveTransactionFailed,
  onApproveTransactionSuccess,
}: UseApproveRKHTransactionProps = {}) {
  const { acceptVerifierProposal } = useAccount();

  const mutation = useMutation({
    mutationKey: ['proposeTransaction'],
    mutationFn: async ({
      address,
      datacap,
      fromAccount,
      transactionId,
    }: ApproveTransactionParams) => {
      onApproveTransaction?.();
      const messageId = await acceptVerifierProposal(address, datacap, fromAccount, transactionId);
      return messageId;
    },
    onSuccess: (messageId: string) => {
      onApproveTransactionSuccess?.(messageId);
    },
    onError: (error: unknown) => {
      console.error('Error proposing verifier:', error);
      onApproveTransactionFailed?.(error);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('network')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const approveTransaction = async (params: ApproveTransactionParams) => {
    return mutation.mutateAsync({
      address: params.address,
      datacap: params.datacap,
      fromAccount: params.fromAccount,
      transactionId: params.transactionId,
    });
  };

  return {
    approveTransaction,
    isPending: mutation.isPending,
    messageId: mutation.data || null,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
}
