import { CircleCheck, Copy } from 'lucide-react';
import { DialogFooter, DialogSuccessCard } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useToast } from '@/components/ui/use-toast';

interface RefreshAllocatorSuccessStepProps {
  messageId?: string | null;
  blockNumber?: number | null;
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
    await navigator.clipboard.writeText(String(blockNumber || ''));
    toast({
      title: 'Copied to clipboard',
      description: 'Block number has been copied to your clipboard.',
    });
  };

  return (
    <DialogSuccessCard onClose={onClose}>
      {messageId ? (
        <div data-testid="transaction-id-section" className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span>Transaction ID</span>
            <Copy data-testid="copy-transaction-id" size="16px" onClick={handleCopyTransactionId} />
          </div>
          <span className="text-muted-foreground break-all">{messageId}</span>
        </div>
      ) : null}

      {blockNumber ? (
        <div data-testid="block-number-section" className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span>Block number</span>
            <Copy data-testid="copy-block-number" size="16px" onClick={handleCopyBlockNumber} />
          </div>
          <span className="flex items-center gap-2 text-muted-foreground">{blockNumber}</span>
        </div>
      ) : null}
    </DialogSuccessCard>
  );
}
