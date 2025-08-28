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
import { Application } from '@/types/application';
import { GovernanceReviewForm, GovernanceReviewFormValues } from './GovernanceReviewForm';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { withFormProvider } from '@/lib/hocs/withFormProvider';
import { useGovernanceReview } from '@/hooks/useGovernanceReview';
import { useToast } from '@/components/ui/use-toast';

interface ApproveGovernanceReviewDialogProps {
  application: Application;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

enum GovApproveSteps {
  FORM = 'FORM',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

const ApproveGovernanceReviewDialog = ({
  application,
  open,
  onOpenChange,
}: ApproveGovernanceReviewDialogProps) => {
  const [step, setStep] = useState<GovApproveSteps>(GovApproveSteps.FORM);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { toast } = useToast();

  const { mutateAsync: governanceReview, reset } = useGovernanceReview({
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
      // Show success toast
      toast({
        title: 'Success',
        description: 'Governance review submitted successfully!',
        variant: 'default',
      });
      // Auto-close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    },
    onError: error => {
      setStep(GovApproveSteps.ERROR);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit governance review',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (open) {
      setStep(GovApproveSteps.FORM);
      setLoadingMessage('');
      setErrorMessage('');
      reset();
    }
  }, [open, reset]);

  const submitReview = useCallback(
    (data: GovernanceReviewFormValues) => governanceReview({ id: application.id, payload: data }),
    [governanceReview, application.id],
  );

  const steps: Record<GovApproveSteps, React.ReactNode> = {
    [GovApproveSteps.FORM]: (
      <GovernanceReviewForm application={application} onSubmit={submitReview} />
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
          <DialogTitle>Approve Application</DialogTitle>
          <DialogDescription>
            Approve Application on behalf of the Governance Team.
          </DialogDescription>
        </DialogHeader>
        {steps[step]}
      </DialogContent>
    </Dialog>
  );
};

export default withFormProvider(ApproveGovernanceReviewDialog);
