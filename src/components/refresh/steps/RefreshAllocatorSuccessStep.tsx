import { CircleCheck, Copy } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useToast } from '@/components/ui/use-toast';

interface RefreshAllocatorSuccessStepProps {
  messageId?: string | null;
  blockNumber?: string | null;
  onClose: () => void;
}

export function RefreshAllocatorSuccessStep({
  onClose,
  messageId,
  blockNumber,
}: RefreshAllocatorSuccessStepProps) {
  const { toast } = useToast();

  const handleCopyTransactionId = async () => {
    await navigator.clipboard.writeText(messageId || '');
    toast({
      title: 'Copied to clipboard',
      description: 'TxID has been copied to your clipboard.',
    });
  };

  const handleCopyBlockNumber = async () => {
    await navigator.clipboard.writeText(blockNumber || '');
    toast({
      title: 'Copied to clipboard',
      description: 'Block number has been copied to your clipboard.',
    });
  };

  return (
    <>
      <div
        data-testid="success-header"
        className="flex flex-col items-center pt-4 pb-4 min-w-48 text-xl text-green-600"
      >
        <CircleCheck size="60px" /> Success!
      </div>

      {messageId ? (
        <div data-testid="transaction-id-section" className="flex flex-col gap-2 text-sm w-60">
          <span>Transaction ID:</span>
          <span className="flex items-center gap-2 text-muted-foreground">
            {messageId}
            <Copy data-testid="copy-transaction-id" size="16px" onClick={handleCopyTransactionId} />
          </span>
        </div>
      ) : null}

      {blockNumber ? (
        <div data-testid="block-number-section" className="flex flex-col gap-2 text-sm">
          <span>Block number:</span>
          <span className="flex items-center gap-2 text-muted-foreground">
            {blockNumber} <Copy data-testid="copy-block-number" onClick={handleCopyBlockNumber} />
          </span>
        </div>
      ) : null}

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
}
