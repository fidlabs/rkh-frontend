'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogErrorCard,
  DialogHeader,
  DialogLoadingCard,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshAllocatorSuccessStep } from '@/components/refresh/steps';
import { RefreshAllocatorSteps } from '@/components/refresh/steps/constants';
import { useProposeRKHTransaction, useStateWaitMsg, useGetVerifierDataCap } from '@/hooks';
import { MetapathwayType } from '@/types/refresh';
import {
  ChangeDatacapFormStep,
  ChangeDatacapFormValues,
} from '@/components/refresh/steps/ChangeDatacapFormStep';
import { withFormProvider } from '@/lib/hocs/withFormProvider';

interface RkhSignTransactionDialogProps {
  open: boolean;
  address: string;
  dataCap?: number;
  actorId: string;
  onOpenChange: (open: boolean) => void;
}

const RkhSignTransactionDialog = ({
  onOpenChange,
  open,
  address,
  dataCap,
  actorId,
}: RkhSignTransactionDialogProps) => {
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

  const { data: verifierData } = useGetVerifierDataCap(actorId, {
    enabled: !!actorId && open,
  });

  const datacapInPib = useMemo(() => {
    if (!verifierData?.datacap) return '0';
    return (Number(verifierData?.datacap) / 1_125_899_906_842_624).toFixed(2);
  }, [verifierData?.datacap]);

  const onSubmit = useCallback(
    async ({ dataCap, method }: ChangeDatacapFormValues) => {
      if (method === 'add') {
        if (verifierData === undefined) {
          setStep(RefreshAllocatorSteps.ERROR);
          setErrorMessage('Verifier data not found');
          return;
        }

        proposeTransaction({
          address,
          datacap: dataCap,
          additionalDataCap: verifierData?.datacap,
        }).catch(error => {
          console.error('Error proposing verifier:', error);
        });
      } else {
        proposeTransaction({ address, datacap: dataCap }).catch(error => {
          console.error('Error proposing verifier:', error);
        });
      }
    },
    [address, proposeTransaction, verifierData],
  );

  const getBlockNumber = () => {
    return typeof stateWaitMsg === 'object' ? stateWaitMsg?.Height : undefined;
  };

  const stepsConfig = {
    [RefreshAllocatorSteps.FORM]: (
      <ChangeDatacapFormStep
        metapathwayType={MetapathwayType.RKH}
        verifierDataCap={datacapInPib}
        dataCap={dataCap}
        toAddress={address}
        onSubmit={onSubmit}
        onCancel={() => onOpenChange(false)}
      />
    ),
    [RefreshAllocatorSteps.LOADING]: <DialogLoadingCard loadingMessage={loadingMessage} />,
    [RefreshAllocatorSteps.SUCCESS]: (
      <RefreshAllocatorSuccessStep
        messageId={messageId}
        blockNumber={getBlockNumber()}
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
          <DialogTitle className="flex items-center gap-2">Sign as RKH</DialogTitle>
          <DialogDescription className="max-w-[500px]">
            Signing a RKH transaction to refresh DataCap
          </DialogDescription>
        </DialogHeader>
        {stepsConfig[step]}
      </DialogContent>
    </Dialog>
  );
};

export default withFormProvider(RkhSignTransactionDialog);
