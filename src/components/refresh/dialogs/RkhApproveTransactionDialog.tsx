'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCallback, useEffect, useState } from 'react';
import {
  ApproveTransactionDetailsStep,
  RefreshAllocatorErrorStep,
  RefreshAllocatorLoadingStep,
  RefreshAllocatorSuccessStep,
} from '@/components/refresh/steps';
import { RefreshAllocatorSteps } from '@/components/refresh/steps/constants';
import { useApproveRKHTransaction } from '@/hooks';

interface RkhApproveTransactionDialogProps {
  open: boolean;
  address: string;
  transactionId: number;
  datacap: number;
  fromAccount: string;
  onOpenChange: (open: boolean) => void;
}

export function RkhApproveTransactionDialog({
  onOpenChange,
  open,
  address,
  transactionId,
  datacap,
  fromAccount,
}: RkhApproveTransactionDialogProps) {
  const [step, setStep] = useState(RefreshAllocatorSteps.FORM);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { approveTransaction, messageId } = useApproveRKHTransaction({
    onApproveTransaction: () => {
      setStep(RefreshAllocatorSteps.LOADING);
      setLoadingMessage('Proposing transaction. Please check your Ledger.');
    },
    onApproveTransactionFailed: error => {
      setStep(RefreshAllocatorSteps.ERROR);
      if (error instanceof Error) setErrorMessage(error.message);
    },
    onApproveTransactionSuccess: () => {
      setStep(RefreshAllocatorSteps.SUCCESS);
    },
  });

  const onSubmit = useCallback(
    async () =>
      approveTransaction({ address, datacap, fromAccount, transactionId }).catch(error => {
        console.error('Error approving transaction:', error);
      }),
    [address, approveTransaction, datacap, fromAccount, transactionId],
  );

  const stepsConfig = {
    [RefreshAllocatorSteps.FORM]: (
      <ApproveTransactionDetailsStep
        dataCap={datacap}
        fromAddress={fromAccount}
        toAddress={address}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
      />
    ),
    [RefreshAllocatorSteps.LOADING]: (
      <RefreshAllocatorLoadingStep loadingMessage={loadingMessage} />
    ),
    [RefreshAllocatorSteps.SUCCESS]: (
      <RefreshAllocatorSuccessStep messageId={messageId} onClose={() => onOpenChange(false)} />
    ),
    [RefreshAllocatorSteps.ERROR]: (
      <RefreshAllocatorErrorStep
        errorMessage={errorMessage}
        onGoBack={() => setStep(RefreshAllocatorSteps.FORM)}
        onClose={() => onOpenChange(false)}
      />
    ),
  };

  useEffect(() => {
    if (open) {
      setStep(RefreshAllocatorSteps.FORM);
      setLoadingMessage(null);
      setErrorMessage(null);
    }
  }, [open]);

  return (
    <Dialog data-testid="refresh-allocator-dialog" open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Approve as RKH</DialogTitle>
          <DialogDescription className="max-w-[500px]">
            Approving a RKH transaction to refresh DataCap
          </DialogDescription>
        </DialogHeader>
        {stepsConfig[step]}
      </DialogContent>
    </Dialog>
  );
}
