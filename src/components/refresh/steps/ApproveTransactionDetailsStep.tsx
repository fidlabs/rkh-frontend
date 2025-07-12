'use client';

import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';

interface ApproveTransactionDetailsStepProps {
  toAddress?: string;
  fromAddress?: string;
  dataCap?: number;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ApproveTransactionDetailsStep({
  toAddress,
  fromAddress,
  dataCap,
  onSubmit,
  onCancel,
}: ApproveTransactionDetailsStepProps) {
  return (
    <>
      <div className="pt-4 pb-6">
        {fromAddress ? (
          <div className="flex flex-col gap-2 pb-6">
            <span>From:</span>
            <span className="text-muted-foreground break-all">{fromAddress}</span>
          </div>
        ) : null}

        {toAddress ? (
          <div className="flex flex-col gap-2 pb-6">
            <span>To:</span>
            <span className="text-muted-foreground break-all">{toAddress}</span>
          </div>
        ) : null}

        {dataCap ? (
          <div className="flex flex-col gap-2 pb-6">
            <span>DataCap:</span>
            <span className="text-muted-foreground break-all">{`${dataCap} PiB`}</span>
          </div>
        ) : null}
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit()}>Approve</Button>
      </DialogFooter>
    </>
  );
}
