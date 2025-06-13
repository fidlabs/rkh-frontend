import { useAccount } from '@/hooks/useAccount';
import { useCallback, useState } from 'react';
import { Application } from '@/types/application';

interface UseRKHTransactionProps {
  onProposeTransaction: () => void;
  onProposeTransactionFailed: () => void;
  onProposeTransactionSuccess: () => void;
}

export function useRKHTransaction({
  onProposeTransaction,
  onProposeTransactionFailed,
  onProposeTransactionSuccess,
}: UseRKHTransactionProps) {
  const { proposeAddVerifier } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);

  const proposeTransaction = useCallback(
    async ({ address, datacap }: Pick<Application, 'address' | 'datacap'>) => {
      setIsPending(true);
      setErrorMessage(null);
      setMessageId(null);

      onProposeTransaction();

      try {
        const messageId = await proposeAddVerifier(address, datacap);

        setMessageId(messageId);
        onProposeTransactionSuccess();
      } catch (error) {
        console.error('Error proposing verifier:', error);
        if (error instanceof Error) setErrorMessage(error.message);

        onProposeTransactionFailed();
      } finally {
        setIsPending(false);
      }
    },
    [
      proposeAddVerifier,
      onProposeTransaction,
      onProposeTransactionFailed,
      onProposeTransactionSuccess,
    ],
  );

  return { proposeTransaction, isPending, messageId, errorMessage };
}
