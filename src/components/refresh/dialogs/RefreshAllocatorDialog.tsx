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
import { useRKHTransaction } from '@/hooks/useRKHTransaction';
import {
  RefreshAllocatorErrorStep,
  RefreshAllocatorFormStep,
  RefreshAllocatorLoadingStep,
  RefreshAllocatorSuccessStep,
} from '@/components/refresh/steps';
import { RefreshAllocatorSteps } from '@/components/refresh/steps/constants';

interface RefreshAllocatorButtonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefreshAllocatorDialog({ onOpenChange, open }: RefreshAllocatorButtonProps) {
  const [step, setStep] = useState(RefreshAllocatorSteps.FORM);
  const { proposeTransaction, errorMessage, messageId } = useRKHTransaction({
    onProposeTransaction: () => setStep(RefreshAllocatorSteps.LOADING),
    onProposeTransactionFailed: () => setStep(RefreshAllocatorSteps.ERROR),
    onProposeTransactionSuccess: () => setStep(RefreshAllocatorSteps.SUCCESS),
  });

  const onSubmit = async ({ allocatorAddress, dataCap }: FormFields) =>
    proposeTransaction({ address: allocatorAddress, datacap: dataCap });

  const stepsConfig = {
    [RefreshAllocatorSteps.FORM]: (
      <RefreshAllocatorFormStep onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
    ),
    [RefreshAllocatorSteps.LOADING]: <RefreshAllocatorLoadingStep />,
    [RefreshAllocatorSteps.SUCCESS]: (
      <RefreshAllocatorSuccessStep
        messageId={messageId}
        blockNumber="123123123"
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
    if (open) setStep(RefreshAllocatorSteps.FORM);
  }, [open]);

  return (
    <Dialog data-testid="refresh-allocator-dialog" open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Refresh Allocator</DialogTitle>
          <DialogDescription>
            Signing a RKH transaction to assign DataCap to an allocator without the full application
            process. This will not update the Allocator JSON automatically!
          </DialogDescription>
        </DialogHeader>
        {stepsConfig[step]}
      </DialogContent>
    </Dialog>
  );
}
