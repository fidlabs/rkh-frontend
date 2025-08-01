import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PAGE_SIZE } from '@/components/dashboard/constants';
import { TableGenerator } from '@/components/ui/table-generator';
import { useGetRefreshes } from '@/hooks';
import { useState } from 'react';
import { PaginationState } from '@tanstack/react-table';
import { refreshesTableColumns } from './refreshes-table-columns';

interface RefreshesPanelProps {
  searchTerm: string;
}

export function RefreshesPanel({ searchTerm }: RefreshesPanelProps) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading, isError } = useGetRefreshes({
    searchTerm,
    currentPage: paginationState.pageIndex + 1,
  });

  const totalCount = data?.data?.pagination?.totalItems || 0;
  const startIndex = paginationState.pageIndex * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Refreshes</CardTitle>
          <CardDescription data-testid="refresh-table-description">
            Consult and manage Fil+ datacap Refreshes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableGenerator
            data={data?.data?.results || []}
            isLoading={isLoading}
            isError={isError}
            pagination={{
              totalPages,
              paginationState,
              setPaginationState,
            }}
            columns={refreshesTableColumns}
          />
        </CardContent>
        <CardFooter>
          <div className="flex gap-1 text-xs text-muted-foreground">
            Showing
            <strong>
              {startIndex}-{endIndex}
            </strong>
            of
            <strong>{totalCount}</strong>
            refreshes
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
