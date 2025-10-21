import { useState } from 'react';
import { TableGenerator } from '@/components/ui/table-generator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAllocatorProposals } from '@/hooks/useAllocatorProposals';
import { createAllocatorProposalsTableColumns } from './allocator-proposals-table-columns';
import { ProposalActionDialog } from './ProposalActionDialog';
import { useProposalActions } from '@/hooks/useProposalActions';
import { AllocatorProposal } from '@/hooks/useAllocatorProposals';

interface AllocatorProposalsPanelProps {}

export function AllocatorProposalsPanel({}: AllocatorProposalsPanelProps) {
  const [selectedProposal, setSelectedProposal] = useState<AllocatorProposal | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { proposals, totalCount, isLoading, isError } = useAllocatorProposals();
  const { approveProposal, rejectProposal } = useProposalActions();

  const handleApprove = (proposal: AllocatorProposal) => {
    setSelectedProposal(proposal);
    setDialogAction('approve');
    setIsDialogOpen(true);
  };

  const handleReject = (proposal: AllocatorProposal) => {
    setSelectedProposal(proposal);
    setDialogAction('reject');
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedProposal(null);
    setDialogAction(null);
  };

  const handleConfirmAction = async (proposalId: number) => {
    if (!selectedProposal)
      return { success: false, message: 'No proposal selected', error: 'No proposal selected' };

    try {
      if (dialogAction === 'approve') {
        const result = await approveProposal(true, proposalId, selectedProposal.method);
        return result;
      } else if (dialogAction === 'reject') {
        const result = await rejectProposal(true, proposalId, selectedProposal.method);
        return result;
      }
      return { success: false, message: 'Unknown action', error: 'Unknown action' };
    } catch (error) {
      return {
        success: false,
        message: 'Action failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>RKH & Allocator Proposals</CardTitle>
          <CardDescription>
            Review and manage allocator proposals requiring multisig approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableGenerator
            isLoading={isLoading}
            isError={isError}
            data={proposals}
            columns={createAllocatorProposalsTableColumns(handleApprove, handleReject)}
          />
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Total: <strong>{totalCount}</strong> proposals
          </div>
        </CardFooter>
      </Card>

      <ProposalActionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        proposal={selectedProposal}
        action={dialogAction || 'approve'}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}
