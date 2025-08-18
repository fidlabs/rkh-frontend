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
import { useSignerManagement } from '@/hooks/useSignerManagement';
import { signerManagementTableColumns } from './signer-management-table-columns';

interface SignerManagementPanelProps {}

export function SignerManagementPanel({}: SignerManagementPanelProps) {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { signers, threshold, totalCount, isLoading, isError } = useSignerManagement();
  const startIndex = paginationState.pageIndex * PAGE_SIZE + 1;
  const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalCount);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Signer Management</CardTitle>
        <CardDescription>
          Manage multisig signers and their permissions. 
          {threshold > 0 && ` Current threshold: ${threshold} approvals required.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TableGenerator
          isLoading={isLoading}
          isError={isError}
          data={signers}
          pagination={{
            totalPages,
            paginationState,
            setPaginationState,
          }}
          columns={signerManagementTableColumns}
        />
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing{' '}
          <strong>
            {startIndex}-{endIndex}
          </strong>{' '}
          of <strong>{totalCount}</strong> signers
        </div>
      </CardFooter>
    </Card>
  );
}
