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
import { allocatorProposalsTableColumns } from './allocator-proposals-table-columns';

interface AllocatorProposalsPanelProps {}

export function AllocatorProposalsPanel({}: AllocatorProposalsPanelProps) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { proposals, totalCount, isLoading, isError } = useAllocatorProposals();
  const startIndex = paginationState.pageIndex * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
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
