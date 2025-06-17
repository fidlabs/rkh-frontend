import { useMutation } from '@tanstack/react-query';
import { useAccount } from '@/hooks/useAccount';
import { Application } from '@/types/application';

interface UseRKHTransactionProps {
  onProposeTransaction?: () => void;
  onProposeTransactionFailed?: (error: unknown) => void;
  onProposeTransactionSuccess?: (messageId: string) => void;
}

interface ProposeTransactionParams {
  address: string;
  datacap: number;
}

export function useRKHTransaction({
  onProposeTransaction,
  onProposeTransactionFailed,
  onProposeTransactionSuccess,
}: UseRKHTransactionProps = {}) {
  const { proposeAddVerifier } = useAccount();

  const mutation = useMutation({
    mutationKey: ['proposeTransaction'],
    mutationFn: async ({ address, datacap }: ProposeTransactionParams) => {
      onProposeTransaction?.();
      const messageId = await proposeAddVerifier(address, datacap);
      return messageId;
    },
    onSuccess: (messageId: string) => {
      onProposeTransactionSuccess?.(messageId);
    },
    onError: (error: unknown) => {
      console.error('Error proposing verifier:', error);
      onProposeTransactionFailed?.(error);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('network')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const proposeTransaction = async (params: Pick<Application, 'address' | 'datacap'>) => {
    return mutation.mutateAsync({
      address: params.address,
      datacap: params.datacap,
    });
  };

  return {
    proposeTransaction,
    isPending: mutation.isPending,
    messageId: mutation.data || null,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
}
