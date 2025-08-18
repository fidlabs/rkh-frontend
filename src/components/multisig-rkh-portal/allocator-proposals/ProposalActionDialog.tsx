import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AllocatorProposal } from '@/hooks/useAllocatorProposals';
import { formatFilecoinAmount } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';

interface ProposalActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: AllocatorProposal | null;
  action: 'approve' | 'reject';
  onConfirm: (proposalId: number) => Promise<void>;
}

export function ProposalActionDialog({
  isOpen,
  onClose,
  proposal,
  action,
  onConfirm,
}: ProposalActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!proposal) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm(proposal.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const actionText = action === 'approve' ? 'Approve' : 'Reject';
  const actionColor = action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className={`text-${action === 'approve' ? 'green' : 'red'}-600`}>
            {actionText} Proposal #{proposal.id}
          </DialogTitle>
          <DialogDescription>
            Please review the proposal details before {action === 'approve' ? 'approving' : 'rejecting'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Proposal ID</label>
              <div className="font-mono text-sm">{proposal.id}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">To Address</label>
              <div className="font-mono text-sm">{proposal.to}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Value</label>
              <div className="text-sm">{formatFilecoinAmount(proposal.value)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Method</label>
              <div className="text-sm">{proposal.method}</div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Decoded Parameters</label>
            {proposal.decodedParams ? (
              <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                <div><strong>To:</strong> {proposal.decodedParams.To}</div>
                <div><strong>Method:</strong> {proposal.decodedParams.Method}</div>
                {proposal.decodedParams.Params && (
                  <div><strong>Params:</strong> <pre className="mt-1 text-xs">{JSON.stringify(proposal.decodedParams.Params, null, 2)}</pre></div>
                )}
              </div>
            ) : (
              <div className="mt-1 p-3 bg-muted rounded-md text-sm text-muted-foreground">
                Failed to decode parameters
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Approved By</label>
            <div className="mt-1">
              {proposal.approved.length > 0 ? (
                <div className="space-y-1">
                  {proposal.approved.map((signer, index) => (
                    <div key={index} className="font-mono text-sm">{signer}</div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No approvals yet</div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className={actionColor}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            {actionText} Proposal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
