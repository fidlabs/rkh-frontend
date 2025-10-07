'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogErrorCard,
  DialogLoadingCard,
} from '@/components/ui/dialog';
import { useCallback, useEffect, useState } from 'react';
import { RefreshAllocatorSuccessStep, SetDatacapFormStep } from '@/components/refresh/steps';
import { RefreshAllocatorSteps } from '@/components/refresh/steps/constants';
import { useMetaAllocatorTransaction } from '@/hooks';
import { MetapathwayType } from '@/types/refresh';
import { withFormProvider } from '@/lib/hocs/withFormProvider';
import { SetDatacapFormValues } from '@/components/refresh/steps/SetDatacapFormStep';

interface MetaAllocatorSignTransactionDialogProps {
  metapathwayType: MetapathwayType;
  open: boolean;
  address: string;
  maAddress: `0x${string}`;
  dataCap?: number;
  onOpenChange: (open: boolean) => void;
}

const MetaAllocatorSignTransactionDialog = ({
  metapathwayType,
  onOpenChange,
  open,
  address,
  maAddress,
  dataCap,
}: MetaAllocatorSignTransactionDialogProps) => {
  const [step, setStep] = useState(RefreshAllocatorSteps.FORM);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { submitSafeTransaction, txHash, blockNumber } = useMetaAllocatorTransaction({
    onSubmitSafeTransaction: () => {
      setStep(RefreshAllocatorSteps.LOADING);
      setLoadingMessage('Signing transaction. Please wait...');
    },
    onConvertingAddress: () => {
      setStep(RefreshAllocatorSteps.LOADING);
      setLoadingMessage('Converting address to ETH adress. Please wait...');
    },
    onSignSafeTransaction: () => {
      setStep(RefreshAllocatorSteps.LOADING);
      setLoadingMessage('Signing transaction. Please check your MetaMask.');
    },
    onExecuteSafeTransaction: () => {
      setStep(RefreshAllocatorSteps.LOADING);
      setLoadingMessage('Executing transaction. Please confrim on your MetaMask.');
    },
    onFetchTransactionReceipt: () => {
      setStep(RefreshAllocatorSteps.LOADING);
      setLoadingMessage('Fetching transaction receipt. Please wait...');
    },
    onSubmitSafeTransactionError: error => {
      setStep(RefreshAllocatorSteps.ERROR);
      setErrorMessage(
        error instanceof Error ? error.message : 'Unknown error. Please try again later.',
      );
    },
    onSubmitSafeTransactionSuccess: () => {
      setStep(RefreshAllocatorSteps.SUCCESS);
    },
  });

  const onSubmit = useCallback(
    async ({ dataCap }: SetDatacapFormValues) =>
      submitSafeTransaction({ address, datacap: dataCap, metaAllocatorContractAddress: maAddress }),
    [address, submitSafeTransaction, maAddress],
  );

  const stepsConfig = {
    [RefreshAllocatorSteps.FORM]: (
      <SetDatacapFormStep
        metapathwayType={metapathwayType}
        dataCap={dataCap}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
      />
    ),
    [RefreshAllocatorSteps.LOADING]: <DialogLoadingCard loadingMessage={loadingMessage} />,
    [RefreshAllocatorSteps.SUCCESS]: (
      <RefreshAllocatorSuccessStep
        blockNumber={blockNumber}
        messageId={txHash}
        onClose={() => onOpenChange(false)}
      />
    ),
    [RefreshAllocatorSteps.ERROR]: (
      <DialogErrorCard
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
          <DialogTitle className="flex items-center gap-2">Approve as MetaAllocator</DialogTitle>
          <DialogDescription className="max-w-[500px]">
            Approve a Meta Allocator transaction to refresh DataCap
          </DialogDescription>
        </DialogHeader>
        {stepsConfig[step]}
      </DialogContent>
    </Dialog>
  );
};

export default withFormProvider(MetaAllocatorSignTransactionDialog);
