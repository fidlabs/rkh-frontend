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
import { useAccount } from '@/hooks/useAccount';
import { useMyProposals } from '@/hooks/useMyProposals';
import { createAllocatorProposalsTableColumns } from '../allocator-proposals/allocator-proposals-table-columns';
import { ProposalActionDialog } from '../allocator-proposals/ProposalActionDialog';
import { useProposalActions } from '@/hooks/useProposalActions';
import { AllocatorProposal } from '@/hooks/useMyProposals';

interface MyProposalsPanelProps {}

export function MyProposalsPanel({}: MyProposalsPanelProps) {
  const [selectedProposal, setSelectedProposal] = useState<AllocatorProposal | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const accountContext = useAccount();
  const { proposals, totalCount, isLoading, isError } = useMyProposals();
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
        const result = await approveProposal(false, proposalId, selectedProposal.method);
        return result;
      } else if (dialogAction === 'reject') {
        const result = await rejectProposal(false, proposalId, selectedProposal.method);
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

  const fullTitle = `Open Proposals for msig ${accountContext.account?.parentMsigAddress || '<unknown>'}`;
  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{fullTitle}</CardTitle>
          <CardDescription>Manage outstanding proposals for your RKH Org multisig.</CardDescription>
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
