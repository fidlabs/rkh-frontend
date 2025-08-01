import { ColumnDef } from '@tanstack/react-table';
import { Application } from '@/types/application';
import React from 'react';
import { ApplicationStatusBadge } from '../components/ApplicationStatusBadge';
import { ApplicationActionButton } from '../components/ApplicationActionButton';
import { ApplicationActions } from '../components/ApplicationActions';
import { createGithubAccountUrl } from '@/lib/factories/create-github-account-url';
import { Link } from '@/components/ui/link';

export const newApplicationsTableColumns: ColumnDef<Application>[] = [
  {
    accessorKey: 'githubPrNumber',
    header: '#',
    cell: ({ row }) => {
      const githubPrNumber = row.getValue('githubPrNumber') as number;
      const githubPrLink = row.original.githubPrLink;

      return githubPrNumber ? (
        <Link variant="underline" href={githubPrLink} target="_blank">
          {githubPrNumber}
        </Link>
      ) : (
        row.original.id
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.getValue('name'),
  },
  {
    accessorKey: 'github',
    header: 'Github',
    cell: ({ row }) => {
      const github = row.getValue('github') as string;
      return (
        <Link variant="underline" href={createGithubAccountUrl(github)} target="_blank">
          {github}
        </Link>
      );
    },
  },
  {
    accessorKey: 'datacap',
    header: 'DataCap',
    cell: ({ row }) => `${row.getValue('datacap')} PiB`,
  },
  {
    accessorKey: 'status',
    header: 'Phase',
    cell: ({ row }) => <ApplicationStatusBadge application={row.original} />,
  },
  {
    accessorKey: 'action',
    header: ' ',
    cell: ({ row }) => <ApplicationActionButton application={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: 'actions',
    header: '',
    cell: ({ row }) => <ApplicationActions application={row.original} />,
    enableHiding: false,
  },
];
