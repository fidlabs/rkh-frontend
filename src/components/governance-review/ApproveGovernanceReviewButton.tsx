'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Application } from '@/types/application';

import ApproveGovernanceReviewDialog from './ApproveGovernanceReviewDialog';
interface ApproveGovernanceReviewButtonProps {
  application: Application;
}

export default function ApproveGovernanceReviewButton({
  application,
}: ApproveGovernanceReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button className="w-[150px]" onClick={() => setIsOpen(true)}>
        Approve
      </Button>
      <ApproveGovernanceReviewDialog
        open={isOpen}
        application={application}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
