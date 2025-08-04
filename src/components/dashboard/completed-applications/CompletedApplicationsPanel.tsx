'use client';

import { DashboardTabs, PAGE_SIZE } from '@/components/dashboard/constants';
import { useState } from 'react';
import { PaginationState } from '@tanstack/react-table';
import { useGetApplications } from '@/hooks';
import { TableGenerator } from '@/components/ui/table-generator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { completedApplicationsTableColumns } from './completed-applications-table-columns';

interface CompletedApplicationsPanelProps {
  searchTerm: string;
  activeFilters: string[];
}

export function CompletedApplicationsPanel({
  searchTerm,
  activeFilters,
}: CompletedApplicationsPanelProps) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { data, isLoading, isError } = useGetApplications({
    searchTerm,
    activeFilters,
    currentTab: DashboardTabs.COMPLETED_APPLICATIONS,
    currentPage: paginationState.pageIndex + 1,
  });

  const totalCount = data?.totalCount || 0;
  const startIndex = paginationState.pageIndex * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Completed Applications</CardTitle>
        <CardDescription>Consult and manage Fil+ program applications.</CardDescription>
      </CardHeader>
      <CardContent>
        <TableGenerator
          data={data?.applications || []}
          isLoading={isLoading}
          isError={isError}
          pagination={{
            totalPages,
            paginationState,
            setPaginationState,
          }}
          columns={completedApplicationsTableColumns}
        />
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing{' '}
          <strong>
            {startIndex}-{endIndex}
          </strong>{' '}
          of <strong>{totalCount}</strong> applications
        </div>
      </CardFooter>
    </Card>
  );
}
