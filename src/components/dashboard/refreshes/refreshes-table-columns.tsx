import { ColumnDef } from '@tanstack/react-table';
import { Refresh, RefreshStatus } from '@/types/refresh';
import React from 'react';
import { createAllocatorGovernanceIssueUrl, createAllocatorRegistryJsonUrl } from '@/lib/factories';
import { RefreshStatusBadge } from '../components/RefreshStatusBadge';
import { TableSortableHeader } from '@/components/ui/table';
import { Link } from '@/components/ui/link';
import { RefreshTableActions } from './refresh-table-actions';

export const refreshesTableColumns: ColumnDef<Refresh>[] = [
  {
    accessorKey: 'githubIssueNumber',
    header: ({ column }) => {
      return <TableSortableHeader column={column}>Issue</TableSortableHeader>;
    },
    cell: ({ row }) => {
      const issueNumber = row.getValue('githubIssueNumber') as number;

      return <Link href={createAllocatorGovernanceIssueUrl(issueNumber)}>#{issueNumber}</Link>;
    },
  },
  {
    accessorKey: 'jsonNumber',
    header: ({ column }) => (
      <TableSortableHeader column={column}>AllocatorJson</TableSortableHeader>
    ),
    cell: ({ row }) => {
      const jsonNumber = row.getValue('jsonNumber') as string;

      return <Link href={createAllocatorRegistryJsonUrl(jsonNumber)}>{jsonNumber}</Link>;
    },
  },
  {
    accessorKey: 'title',
    header: 'Name',
    cell: ({ row }) => {
      const title = row.getValue('title') as string;

      return <div className="font-medium">{title}</div>;
    },
  },
  {
    accessorKey: 'creator',
    header: 'Github',
    cell: ({ row }) => {
      const creator = row.getValue('creator') as Refresh['creator'];

      return <Link href={`https://github.com/${creator.name}`}>{creator.name}</Link>;
    },
  },
  {
    accessorKey: 'refreshStatus',
    header: 'Status',
    cell: ({ row }) => {
      const refreshStatus = row.getValue('refreshStatus') as RefreshStatus;

      return refreshStatus ? <RefreshStatusBadge refreshStatus={refreshStatus} /> : null;
    },
  },
  {
    accessorKey: 'dataCap',
    header: 'DataCap',
    cell: ({ row }) => {
      const dataCap = row.getValue('dataCap') as string;

      return <div className="flex justify-center">{dataCap ? `${dataCap} PiB` : '...'}</div>;
    },
  },
  {
    accessorKey: 'actions',
    header: ' ',
    cell: ({ row }) => <RefreshTableActions row={row} />,
  },
];
