import { useMutation } from '@tanstack/react-query';
import { getStateWaitMsg } from '@/lib/glif-api';
import { ApiStateWaitMsgResponse } from '@/types/filecoin-client';

interface UseStateWaitMsgProps {
  onGetMessage?: () => void;
  onGetMessageError?: (error: unknown) => void;
  onGetMessageSuccess?: (message: ApiStateWaitMsgResponse) => void;
}

interface CheckTransactionParams {
  transactionCid: string;
}

export const useStateWaitMsg = ({
  onGetMessage,
  onGetMessageError,
  onGetMessageSuccess,
}: UseStateWaitMsgProps = {}) => {
  const mutation = useMutation({
    mutationKey: ['checkTransactionState'],
    mutationFn: async ({ transactionCid }: CheckTransactionParams) => {
      if (!transactionCid) {
        throw new Error('Error sending transaction. Please try again or contact support.');
      }

      onGetMessage?.();
      const response = await getStateWaitMsg(transactionCid);

      if (
        typeof response.data === 'object' &&
        response.data.ReturnDec.Applied &&
        response.data.ReturnDec.Code !== 0
      ) {
        throw new Error(
          `Error sending transaction. Please try again or contact support. Error code: ${response.data.ReturnDec.Code}`,
        );
      }

      return response;
    },
    onSuccess: (response: ApiStateWaitMsgResponse) => {
      onGetMessageSuccess?.(response);
    },
    onError: (error: unknown) => {
      console.error('Error getting message:', error);
      onGetMessageError?.(error);
    },
    retry: (failureCount, error) => {
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (
          message.includes('network') ||
          message.includes('timeout') ||
          message.includes('too long')
        ) {
          return failureCount < 5;
        }
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const checkTransactionState = async (transactionCid: string) => {
    if (!transactionCid) {
      throw new Error('Transaction CID is required');
    }

    return mutation.mutateAsync({ transactionCid });
  };

  return {
    checkTransactionState,
    isPending: mutation.isPending,
    stateWaitMsg: mutation.data?.data || null,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
};
