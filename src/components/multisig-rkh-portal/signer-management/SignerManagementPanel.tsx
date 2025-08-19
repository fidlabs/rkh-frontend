import { useState } from 'react';
import { TableGenerator } from '@/components/ui/table-generator';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useSignerManagement } from '@/hooks/useSignerManagement';
import { createSignerManagementTableColumns } from './signer-management-table-columns';
import { AddSignerDialog } from './AddSignerDialog';
import { proposeRemoveSigner } from '@/lib/multisig-actions';
import { useAccount } from '@/hooks/useAccount';
import { toast } from '@/components/ui/use-toast';

interface SignerManagementPanelProps {}

export function SignerManagementPanel({}: SignerManagementPanelProps) {
  const [isAddSignerDialogOpen, setIsAddSignerDialogOpen] = useState(false);

  const { signers, threshold, totalCount, isLoading, isError } = useSignerManagement();
  const accountContext = useAccount();

  const handleRevokeSigner = async (signerAddress: string) => {
    try {
      if (!accountContext.account?.parentMsigAddress) {
        toast({
          title: "Error",
          description: "No parent multisig address found. Please ensure you're connected as an indirect root key holder.",
          variant: "destructive",
        });
        return;
      }

      const result = await proposeRemoveSigner({
        proposalId: signerAddress,
        msigAddress: accountContext.account.parentMsigAddress,
        accountContext,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Successfully proposed removal of signer ${signerAddress}`,
        });
        // Optionally refresh the signer list here
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to propose signer removal",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to propose signer removal: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Root Key Holders Management</CardTitle>
              <CardDescription>
                Manage multisig signers and their permissions. 
                {threshold > 0 && ` Current threshold: ${threshold} approvals required.`}
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddSignerDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Signer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
                  <TableGenerator
          isLoading={isLoading}
          isError={isError}
          data={signers}
          columns={createSignerManagementTableColumns(handleRevokeSigner)}
        />
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Total: <strong>{totalCount}</strong> signers
          </div>
        </CardFooter>
      </Card>

      <AddSignerDialog
        isOpen={isAddSignerDialogOpen}
        onClose={() => setIsAddSignerDialogOpen(false)}
        onSuccess={() => {
          setIsAddSignerDialogOpen(false);
          // Optionally refresh the signer list here
        }}
      />
    </>
  );
}
