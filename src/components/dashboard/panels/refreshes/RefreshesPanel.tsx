import { Application } from '@/types/application';
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

interface RefreshPanelProps {
  title: string;
  description: string;
  applications: Application[];
  totalCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function RefreshesPanel({
  totalCount,
  currentPage,
  onPageChange,
  title,
  description,
}: RefreshPanelProps) {
  const { data, isLoading } = useGetRefreshes({
    searchTerm: '',
    currentPage,
  });
  const role = useAccountRole();
  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount);

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || !data?.data?.results ? null : (
            <TableGenerator data={data?.data?.results} columns={refreshesTableColumns({ role })} />
          )}
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
    </>
  );
}
