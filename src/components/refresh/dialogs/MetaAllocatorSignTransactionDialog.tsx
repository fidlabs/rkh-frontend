'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogErrorCard,
  DialogLoadingCard,
  DialogConfirmationCard,
  DialogSuccessCard,
} from '@/components/ui/dialog';
import { useCallback, useEffect, useState } from 'react';
import { RefreshAllocatorSuccessStep, SetDatacapFormStep } from '@/components/refresh/steps';
import { RefreshAllocatorSteps } from '@/components/refresh/steps/constants';
import { useMetaAllocatorTransaction, useMetaAllocatorReject } from '@/hooks';
import { MetapathwayType } from '@/types/refresh';
import { withFormProvider } from '@/lib/hocs/withFormProvider';
import { SetDatacapFormValues } from '@/components/refresh/steps/SetDatacapFormStep';
import { SignatureType } from '@/types/governance-review';
import { toast } from '@/components/ui/use-toast';

interface MetaAllocatorSignTransactionDialogProps {
  metapathwayType: MetapathwayType;
  githubIssueNumber: number;
  open: boolean;
  address: string;
  maAddress: `0x${string}`;
  dataCap?: number;
  onOpenChange: (open: boolean) => void;
}

const MetaAllocatorSignTransactionDialog = ({
  githubIssueNumber,
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

  const { mutateAsync: reject } = useMetaAllocatorReject({
    signatureType: SignatureType.MetaAllocatorReject,
    onReviewPending: () => {
      setStep(RefreshAllocatorSteps.LOADING);
      setLoadingMessage('Submitting reject...');
    },
    onSuccess: () => {
      setStep(RefreshAllocatorSteps.REJECTION_SUCCESS);

      toast({
        title: 'Success',
        description: 'MetaAllocator reject submitted successfully!',
        variant: 'default',
      });
    },
    onError: error => {
      setStep(RefreshAllocatorSteps.ERROR);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');

      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to submit MetaAllocator reject',
        variant: 'destructive',
      });
    },
  });

  const onMetaAllocatorSubmit = useCallback(
    async ({ dataCap }: SetDatacapFormValues) => {
      if (Number(dataCap) === 0) {
        setStep(RefreshAllocatorSteps.REJECTION_CONFIRMATION);
      } else {
        submitSafeTransaction({
          address,
          datacap: dataCap,
          metaAllocatorContractAddress: maAddress,
        });
      }
    },
    [address, submitSafeTransaction, maAddress],
  );

  const onMetaAllocatorReject = useCallback(async () => {
    reject({
      id: String(githubIssueNumber),
      payload: {
        dataCap: 0,
        allocatorType: metapathwayType,
        isMDMAAllocatorChecked: false,
        intent: 'reject',
        reason: '',
      },
    });
  }, [githubIssueNumber, metapathwayType, reject]);

  const handleCloseWithDelay = useCallback(() => {
    if ([RefreshAllocatorSteps.REJECTION_SUCCESS, RefreshAllocatorSteps.SUCCESS].includes(step)) {
      return setTimeout(() => onOpenChange(false), 1500);
    }
  }, [onOpenChange, step]);

  useEffect(() => {
    const timeout = handleCloseWithDelay();

    return () => timeout && clearTimeout(timeout);
  }, [handleCloseWithDelay]);

  const stepsConfig = {
    [RefreshAllocatorSteps.FORM]: (
      <SetDatacapFormStep
        rejectable
        metapathwayType={metapathwayType}
        dataCap={dataCap}
        onSubmit={onMetaAllocatorSubmit}
        onCancel={() => onOpenChange(false)}
      />
    ),
    [RefreshAllocatorSteps.REJECTION_CONFIRMATION]: (
      <DialogConfirmationCard
        message="Are you sure you want to reject this MetaAllocator transaction?"
        onConfirm={onMetaAllocatorReject}
        onGoBack={() => setStep(RefreshAllocatorSteps.FORM)}
      />
    ),
    [RefreshAllocatorSteps.REJECTION_SUCCESS]: (
      <DialogSuccessCard onClose={() => onOpenChange(false)}>
        <p>Refresh rejected successfully!</p>
      </DialogSuccessCard>
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
