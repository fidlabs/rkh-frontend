'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { FormFields } from '@/components/refresh/dialogs/RefreshAllocatorValidationRules';
import { useRKHTransaction } from '@/hooks/useRKHTransaction';
import {
  RefreshAllocatorErrorStep,
  RefreshAllocatorFormStep,
  RefreshAllocatorLoadingStep,
  RefreshAllocatorSuccessStep,
} from '@/components/refresh/steps';
import { RefreshAllocatorSteps } from '@/components/refresh/steps/constants';

interface RefreshAlloactorButtonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefreshAllocatorDialog({ onOpenChange, open }: RefreshAlloactorButtonProps) {
  const [step, setStep] = useState(RefreshAllocatorSteps.FORM);
  const { proposeTransaction } = useRKHTransaction({
    onProposeTransaction: () => setStep(RefreshAllocatorSteps.LOADING),
    onProposeTransactionFailed: () => setStep(RefreshAllocatorSteps.ERROR),
    onProposeTransactionSuccess: () => setStep(RefreshAllocatorSteps.SUCCESS),
  });

  const handleOpenChange = (open: boolean) => {
    if (open) setStep(RefreshAllocatorSteps.FORM);
    onOpenChange(open);
  };

  const onSubmit = async ({ allocatorAddress, dataCap }: FormFields) =>
    proposeTransaction({ address: allocatorAddress, datacap: dataCap });

  const stepsConfig = {
    [RefreshAllocatorSteps.FORM]: (
      <RefreshAllocatorFormStep onSubmit={onSubmit} onCancel={() => handleOpenChange(false)} />
    ),
    [RefreshAllocatorSteps.LOADING]: <RefreshAllocatorLoadingStep />,
    [RefreshAllocatorSteps.SUCCESS]: (
      <RefreshAllocatorSuccessStep onClose={() => handleOpenChange(false)} />
    ),
    [RefreshAllocatorSteps.ERROR]: (
      <RefreshAllocatorErrorStep
        onGoBack={() => setStep(RefreshAllocatorSteps.FORM)}
        onClose={() => handleOpenChange(false)}
      />
    ),
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Refresh Allocator</DialogTitle>
        </DialogHeader>
        {stepsConfig[step]}
      </DialogContent>
    </Dialog>
  );
}
