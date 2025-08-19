import { ColumnDef } from '@tanstack/react-table';
import { Signer } from '@/hooks/useSignerManagement';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';

export const createSignerManagementTableColumns = (
  onRevoke: (signerAddress: string) => void
): ColumnDef<Signer>[] => [
  {
    accessorKey: 'address',
    header: 'Signer Address',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue('address')}
      </div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <div className={`text-sm ${isActive ? 'text-green-600' : 'text-red-600'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const signer = row.original;
      
      return (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onRevoke(signer.address)}
            title="Revoke Signer"
            disabled={!signer.isActive}
          >
            <Trash2Icon className="h-4 w-4 mr-1" />
            Revoke
          </Button>
        </div>
      );
    },
  },
];
