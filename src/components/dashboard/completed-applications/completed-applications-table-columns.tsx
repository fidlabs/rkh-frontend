import { ColumnDef } from '@tanstack/react-table';
import { Application } from '@/types/application';
import { ApplicationStatusBadge } from '../components/ApplicationStatusBadge';
import { createGithubAccountUrl } from '@/lib/factories/create-github-account-url';
import { Link } from '@/components/ui/link';
import { createFilfoxAddressUrl } from '@/lib/factories/create-filfox-address-url';
import { ApplicationActions } from '../components/ApplicationActions';

export const completedApplicationsTableColumns: ColumnDef<Application>[] = [
  {
    accessorKey: 'githubPrNumber',
    header: '#',
    cell: ({ row }) => {
      const githubPrNumber = row.getValue('githubPrNumber') as string | number | undefined;
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
    header: 'Allocated DataCap',
    cell: ({ row }) => {
      const phase = row.original.status;

      if (phase === 'DC_ALLOCATED') {
        return `${row.getValue('datacap')} PiB`;
      }

      return '-';
    },
  },
  {
    accessorKey: 'status',
    header: 'Phase',
    cell: ({ row }) => <ApplicationStatusBadge application={row.original} />,
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => (
      <Link variant="filled" href={createFilfoxAddressUrl(row.original.address)} target="_blank">
        View on Filfox
      </Link>
    ),
  },
  {
    accessorKey: 'actions',
    header: '',
    cell: ({ row }) => <ApplicationActions application={row.original} />,
    enableHiding: false,
  },
];
