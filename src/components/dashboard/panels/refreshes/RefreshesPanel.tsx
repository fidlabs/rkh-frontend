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
import { refreshesTableColumns } from '@/components/dashboard/panels/refreshes/refreshes-table-columns';
import { useAccountRole, useGetRefreshes } from '@/hooks';
import { useState } from 'react';
import { PaginationState } from '@tanstack/react-table';

interface RefreshPanelProps {
  title: string;
  description: string;
}

export function RefreshesPanel({ title, description }: RefreshPanelProps) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading } = useGetRefreshes({
    searchTerm: '',
    currentPage: paginationState.pageIndex + 1,
  });
  const role = useAccountRole();

  const totalCount = data?.data?.pagination?.totalItems || 0;
  const startIndex = paginationState.pageIndex * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !data?.data?.results ? null : (
            <TableGenerator
              data={data?.data?.results}
              pagination={{
                totalPages,
                paginationState,
                setPaginationState,
              }}
              columns={refreshesTableColumns({ role })}
            />
          )}
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
