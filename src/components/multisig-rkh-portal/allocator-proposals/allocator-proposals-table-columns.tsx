import { ColumnDef } from '@tanstack/react-table';
import { AllocatorProposal } from '@/hooks/useAllocatorProposals';
import { Button } from '@/components/ui/button';
import { CheckIcon, XIcon } from 'lucide-react';

// Helper function to convert method numbers to readable names
function getMethodName(method: number): string {
  const methodNames: Record<number, string> = {
    0: 'Send',
    1: 'Constructor',
    2: 'ProposeVerifier',
    3: 'Approve',
    4: 'Cancel',
    5: 'AddSigner',
    6: 'RemoveSigner',
    7: 'SwapSigner',
    8: 'ChangeThreshold',
    9: 'LockBalance',
    10: 'UnlockBalance',
  };
  
  return methodNames[method] || `Method ${method}`;
}

// This function will be passed from the parent component
export const createAllocatorProposalsTableColumns = (
  onApprove: (proposal: AllocatorProposal) => void,
  onReject: (proposal: AllocatorProposal) => void
): ColumnDef<AllocatorProposal>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="font-mono">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'to',
    header: 'To Address',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue('to')}
      </div>
    ),
  },

  {
    accessorKey: 'method',
    header: 'Method',
    cell: ({ row }) => {
      const method = row.getValue('method') as number;
      return (
        <div className="font-mono text-sm">
          {getMethodName(method)}
        </div>
      );
    },
  },
  {
    accessorKey: 'decodedParams',
    header: 'Proposal Details',
    cell: ({ row }) => {
      const decodedParams = row.getValue('decodedParams') as any;
      
      if (!decodedParams) {
        return <div className="text-muted-foreground text-sm">Failed to decode</div>;
      }
      console.log('render decodedParams ...', decodedParams);
      // Display the decoded params in a neat, compact format
      if (decodedParams && typeof decodedParams === 'object') {
        const paramEntries = Object.entries(decodedParams);
        
        return (
          <div className="text-xs space-y-1">
            {paramEntries.map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> 
                <span className="font-mono ml-1">
                  {typeof value === 'string' && value.startsWith('t') ? value : String(value)}
                </span>
              </div>
            ))}
          </div>
        );
      }
      
      // Fallback if no params or unexpected structure
      return (
        <div className="text-xs text-muted-foreground">
          No params available
        </div>
      );
    },
  },
  {
    accessorKey: 'approved',
    header: 'Approved By',
    cell: ({ row }) => {
      const approved = row.getValue('approved') as string[];
      return (
        <div className="text-xs">
          {approved.length > 0 ? (
            <div className="space-y-1">
              {approved.map((signer, index) => (
                <div key={index} className="font-mono">{signer}</div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">None</div>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const proposal = row.original;
      
      return (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => onApprove(proposal)}
            title="Approve"
          >
            <CheckIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onReject(proposal)}
            title="Reject"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];


