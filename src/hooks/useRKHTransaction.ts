import { useAccount } from '@/hooks/useAccount';
import { useCallback, useState } from 'react';
import { Application } from '@/types/application';
import { useToast } from '@/components/ui/use-toast';

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
  const { toast } = useToast();

  const proposeTransaction = useCallback(
    async ({ address, datacap }: Pick<Application, 'address' | 'datacap'>) => {
      setIsPending(true);
      onProposeTransaction();

      try {
        const messageId = await proposeAddVerifier(address, datacap);
        toast({
          title: 'RKH Transaction Proposed',
          description: `Transaction proposed with message id: ${messageId}`,
        });
        onProposeTransactionSuccess();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to propose verifier',
          variant: 'destructive',
        });
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

  return { proposeTransaction, isPending };
}
