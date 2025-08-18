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
import { useMyProposals } from '@/hooks/useMyProposals';
import { allocatorProposalsTableColumns } from '../allocator-proposals/allocator-proposals-table-columns';

interface MyProposalsPanelProps {}

export function MyProposalsPanel({}: MyProposalsPanelProps) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { proposals, totalCount, isLoading, isError } = useMyProposals();
  const startIndex = paginationState.pageIndex * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>My Proposals</CardTitle>
        <CardDescription>Manage outstanding proposals for your RKH Org multisig.</CardDescription>
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
          columns={allocatorProposalsTableColumns}
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
  );
}
