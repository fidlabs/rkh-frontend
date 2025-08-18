import { useState } from 'react';
import { PaginationState } from '@tanstack/react-table';
import { TableGenerator } from '@/components/ui/table-generator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PAGE_SIZE } from '../constants';
import { useAllocatorProposals } from '@/hooks/useAllocatorProposals';
import { createAllocatorProposalsTableColumns } from './allocator-proposals-table-columns';
import { ProposalActionDialog } from './ProposalActionDialog';
import { useProposalActions } from '@/hooks/useProposalActions';
import { AllocatorProposal } from '@/hooks/useAllocatorProposals';

interface AllocatorProposalsPanelProps {}

export function AllocatorProposalsPanel({}: AllocatorProposalsPanelProps) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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
    if (dialogAction === 'approve') {
      await approveProposal(proposalId);
    } else if (dialogAction === 'reject') {
      await rejectProposal(proposalId);
    }
  };

  const startIndex = paginationState.pageIndex * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <Card className="mb-4">
      <CardHeader>
        <CardTitle>Allocator Proposals</CardTitle>
        <CardDescription>Review and manage allocator proposals requiring multisig approval.</CardDescription>
      </CardHeader>
      <CardContent>
        <TableGenerator
          isLoading={isLoading}
          isError={isError}
          data={proposals}
          pagination={{
            totalPages,
            paginationState,
            setPaginationState,
          }}
          columns={createAllocatorProposalsTableColumns(handleApprove, handleReject)}
        />
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing{' '}
          <strong>
            {startIndex}-{endIndex}
          </strong>{' '}
          of <strong>{totalCount}</strong> proposals
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
