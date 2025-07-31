'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { FormFields } from '@/components/refresh/dialogs/RefreshAllocatorValidationRules';
import {
  RefreshAllocatorErrorStep,
  RefreshAllocatorFormStep,
  RefreshAllocatorLoadingStep,
  RefreshAllocatorSuccessStep,
} from '@/components/refresh/steps';
import { RefreshAllocatorSteps } from '@/components/refresh/steps/constants';
import { useProposeRKHTransaction, useStateWaitMsg } from '@/hooks';

interface RefreshAllocatorButtonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefreshAllocatorDialog({ onOpenChange, open }: RefreshAllocatorButtonProps) {
  const [step, setStep] = useState(RefreshAllocatorSteps.FORM);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { checkTransactionState, stateWaitMsg } = useStateWaitMsg({
    onGetMessage: () => {
      setStep(RefreshAllocatorSteps.LOADING);
      setLoadingMessage('Checking the block number please wait... Do not close this window.');
    },
    onGetMessageError: error => {
      setStep(RefreshAllocatorSteps.ERROR);
      if (error instanceof Error) setErrorMessage(error.message);
    },
    onGetMessageSuccess: () => {
      setStep(RefreshAllocatorSteps.SUCCESS);
    },
  });

  const { proposeTransaction, messageId } = useProposeRKHTransaction({
    onProposeTransaction: () => {
      setStep(RefreshAllocatorSteps.LOADING);
      setLoadingMessage('Proposing transaction. Please check your Ledger.');
    },
    onProposeTransactionFailed: error => {
      setStep(RefreshAllocatorSteps.ERROR);
      if (error instanceof Error) setErrorMessage(error.message);
    },
    onProposeTransactionSuccess: (messageId: string) => checkTransactionState(messageId),
  });

  const onSubmit = async ({ allocatorAddress, dataCap }: FormFields) =>
    proposeTransaction({ address: allocatorAddress, datacap: dataCap }).catch(error => {
      console.error('Error proposing verifier:', error);
    });

  const getBlockNumber = () => {
    return typeof stateWaitMsg === 'object' ? stateWaitMsg?.Height : undefined;
  };

  const stepsConfig = {
    [RefreshAllocatorSteps.FORM]: (
      <RefreshAllocatorFormStep onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
    ),
    [RefreshAllocatorSteps.LOADING]: (
      <RefreshAllocatorLoadingStep loadingMessage={loadingMessage} />
    ),
    [RefreshAllocatorSteps.SUCCESS]: (
      <RefreshAllocatorSuccessStep
        messageId={messageId}
        blockNumber={getBlockNumber()}
        onClose={() => onOpenChange(false)}
      />
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
          <DialogTitle className="flex items-center gap-2">Refresh Allocator</DialogTitle>
          <DialogDescription className="max-w-[500px]">
            Signing a RKH transaction to assign DataCap to an allocator without the full application
            process. This will not update the Allocator JSON automatically!
          </DialogDescription>
        </DialogHeader>
        {stepsConfig[step]}
      </DialogContent>
    </Dialog>
  );
}
