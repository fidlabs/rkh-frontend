import { ColumnDef } from '@tanstack/react-table';
import { Refresh, RefreshStatus } from '@/types/application';
import { Button } from '@/components/ui/button';
import React from 'react';
import Link from 'next/link';
import { AccountRole } from '@/types/account';
import { RkhSignTransactionButton } from '@/components/refresh/RkhSignTransactionButton';
import { MetaAllocatorSignTransactionButton } from '@/components/refresh/MetaAllocatorSignTransactionButton';
import { RkhApproveTransactionButton } from '@/components/refresh/RkhApproveTransactionButton';
import { RefreshStatusBadge } from '@/components/dashboard/panels/refreshes/components/RefreshStatusBadge';

interface RefreshesTableColumnsProps {
  role?: AccountRole;
}

type GetRefreshColumn = (props: RefreshesTableColumnsProps) => ColumnDef<Refresh>[];

const renderOptionally = <T,>(condition: boolean, children: ColumnDef<T>) =>
  condition ? [children] : [];

export const refreshesTableColumns: GetRefreshColumn = ({ role }) => [
  {
    accessorKey: 'githubIssueNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Issue
          {column.getIsSorted() === 'asc' ? ' ▲' : ' ▼'}
        </Button>
      );
    },
    cell: ({ row }) => {
      const issueNumber = row.getValue('githubIssueNumber') as string;

      return (
        <Link
          href={`https://github.com/RafalMagrys/Allocator-Governance/issues/${issueNumber}`}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          #{issueNumber}
        </Link>
      );
    },
  },
  {
    accessorKey: 'jsonNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          AllocatorJson
          {column.getIsSorted() === 'asc' ? ' ▲' : ' ▼'}
        </Button>
      );
    },
    cell: ({ row }) => {
      const jsonNumber = row.getValue('jsonNumber') as string;

      return (
        <Link
          href={`https://github.com/RafalMagrys/Allocator-Registry/blob/main/Allocators/${jsonNumber}.json`}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          {jsonNumber}
        </Link>
      );
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

      return (
        <Link
          href={`https://github.com/${creator.name}`}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          {creator.name}
        </Link>
      );
    },
  },
  {
    accessorKey: 'refreshStatus',
    header: 'Status',
    cell: ({ row }) => {
      const refreshStatus = row.getValue('refreshStatus') as RefreshStatus;

      return <RefreshStatusBadge refreshStatus={refreshStatus} />;
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
  ...renderOptionally<Refresh>(role === AccountRole.METADATA_ALLOCATOR, {
    enableHiding: false,
    header: ' ',
    accessorKey: 'msigAddress',
    cell: ({ row }) => {
      const refresh = row.original;
      const hasSigners = !!refresh?.rkhPhase?.approvals?.length;
      const address = row.getValue('msigAddress') as string;

      if (refresh.metapathwayType !== 'RKH') return null;
      if (!hasSigners) return <RkhSignTransactionButton address={address} />;

      const signer = refresh.rkhPhase.approvals.at(0) as string;
      const transactionId = refresh.rkhPhase.messageId;
      const dataCap = refresh.dataCap;

      return (
        <RkhApproveTransactionButton
          address={address}
          fromAccount={signer}
          transactionId={transactionId}
          datacap={dataCap}
        />
      );
    },
  }),
  ...renderOptionally<Refresh>(role === AccountRole.ROOT_KEY_HOLDER, {
    enableHiding: false,
    header: ' ',
    accessorKey: 'maAddress',
    cell: ({ row }) => {
      const refresh = row.original;
      const msigAddress = refresh.msigAddress;
      const maAddress = row.getValue('maAddress') as `0x${string}`;

      if (refresh.metapathwayType !== 'MDMA' || !maAddress) return null;

      return <MetaAllocatorSignTransactionButton address={msigAddress} maAddress={maAddress} />;
    },
  }),
];
