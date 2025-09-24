'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogErrorCard,
  DialogHeader,
  DialogLoadingCard,
  DialogSuccessCard,
  DialogTitle,
} from '@/components/ui/dialog';
import { Refresh } from '@/types/refresh';
import { RefreshGovernanceReviewFormValues } from './RefreshGovernanceReviewForm';
import { withFormProvider } from '@/lib/hocs/withFormProvider';
import { useGovernanceReview } from '@/hooks/useGovernanceReview';
import { useToast } from '@/components/ui/use-toast';
import { RefreshGovernanceReviewForm } from './RefreshGovernanceReviewForm';
import { SignatureType } from '@/types/governance-review';

interface ApproveGovernanceReviewDialogProps {
  refresh: Refresh;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

enum GovApproveSteps {
  FORM = 'FORM',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

const RefreshGovernanceReviewDialog = ({
  refresh,
  open,
  onOpenChange,
}: ApproveGovernanceReviewDialogProps) => {
  const [step, setStep] = useState<GovApproveSteps>(GovApproveSteps.FORM);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  const { mutateAsync: governanceReview, reset } = useGovernanceReview({
    signatureType: SignatureType.RefreshReview,
    onSignaturePending: () => {
      setStep(GovApproveSteps.LOADING);
      setLoadingMessage('Signing message, please check your Ledger...');
    },
    onReviewPending: () => {
      setStep(GovApproveSteps.LOADING);
      setLoadingMessage('Submitting review...');
    },
    onSuccess: () => {
      setStep(GovApproveSteps.SUCCESS);

      toast({
        title: 'Success',
        description: 'Governance review submitted successfully!',
        variant: 'default',
      });
    },
    onError: error => {
      setStep(GovApproveSteps.ERROR);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit governance review',
        variant: 'destructive',
      });
    },
  });

  const handleCloseWithDelay = useCallback(() => {
    if (step === GovApproveSteps.SUCCESS) {
      return setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    }
  }, [onOpenChange, step]);

  useEffect(() => {
    const timeout = handleCloseWithDelay();

    return () => timeout && clearTimeout(timeout);
  }, [handleCloseWithDelay]);

  useEffect(() => {
    if (open) {
      setStep(GovApproveSteps.FORM);
      setLoadingMessage('');
      setErrorMessage('');
      reset();
    }
  }, [open, reset]);

  const submitReview = useCallback(
    (data: RefreshGovernanceReviewFormValues) =>
      governanceReview({
        id: refresh.githubIssueId.toString(),
        payload: {
          ...data,
          allocatorType: refresh.metapathwayType || '',
          reason: '',
          isMDMAAllocatorChecked: false,
        },
      }),
    [governanceReview, refresh.githubIssueId, refresh.metapathwayType],
  );

  const steps: Record<GovApproveSteps, React.ReactNode> = {
    [GovApproveSteps.FORM]: (
      <RefreshGovernanceReviewForm refresh={refresh} onSubmit={submitReview} />
    ),
    [GovApproveSteps.LOADING]: <DialogLoadingCard loadingMessage={loadingMessage} />,
    [GovApproveSteps.SUCCESS]: (
      <DialogSuccessCard onClose={() => onOpenChange(false)}>
        <span className="text-center">Review submitted successfully!</span>
      </DialogSuccessCard>
    ),
    [GovApproveSteps.ERROR]: (
      <DialogErrorCard
        errorMessage={errorMessage}
        onGoBack={() => setStep(GovApproveSteps.FORM)}
        onClose={() => onOpenChange(false)}
      />
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Refresh</DialogTitle>
          <DialogDescription>Approve Refresh on behalf of the Governance Team.</DialogDescription>
        </DialogHeader>
        {steps[step]}
      </DialogContent>
    </Dialog>
  );
};

export default withFormProvider(RefreshGovernanceReviewDialog);
