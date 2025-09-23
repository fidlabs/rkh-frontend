'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Refresh } from '@/types/refresh';

import RefreshGovernanceReviewDialog from './RefreshGovernanceReviewDialog';
interface RefreshGovernanceReviewButtonProps {
  refresh: Refresh;
}

export function RefreshGovernanceReviewButton({ refresh }: RefreshGovernanceReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button className="w-[150px]" onClick={() => setIsOpen(true)}>
        Review
      </Button>
      <RefreshGovernanceReviewDialog open={isOpen} refresh={refresh} onOpenChange={setIsOpen} />
    </>
  );
}
