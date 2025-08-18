import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2Icon } from 'lucide-react';
import { proposeAddSigner } from '@/lib/multisig-actions';
import { useAccount } from '@/hooks/useAccount';
import { filecoinConfig } from '@/config/filecoin';

interface AddSignerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddSignerDialog({
  isOpen,
  onClose,
  onSuccess,
}: AddSignerDialogProps) {
  const [newSignerAddress, setNewSignerAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; txHash: string } | null>(null);
  
  const accountContext = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSignerAddress.trim()) {
      setError('Please enter a valid Filecoin address');
      return;
    }

    // Basic Filecoin address validation
    if (!newSignerAddress.startsWith('t') && !newSignerAddress.startsWith('f')) {
      setError('Please enter a valid Filecoin address (must start with t or f)');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const result = await proposeAddSigner({
        proposalId: newSignerAddress, // The signer address is passed as proposalId
        msigAddress: 't01027', //JAGTAG this needs to come from logged in context
        accountContext,
      });

      if (result.success) {
        setSuccess({
          message: result.message,
          txHash: result.txHash || 'No transaction hash available'
        });
        onSuccess();
      } else {
        setError(result.error || 'Failed to add signer');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add signer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNewSignerAddress('');
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Signer</DialogTitle>
          <DialogDescription>
            Add a new signer to the multisig. The proposal will need to be approved by existing signers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="signer-address">New Signer Address</Label>
              <Input
                id="signer-address"
                type="text"
                placeholder="t1..."
                value={newSignerAddress}
                onChange={(e) => setNewSignerAddress(e.target.value)}
                disabled={isLoading}
                className="font-mono"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm text-green-600 font-medium mb-2">
                  ✅ {success.message}
                </div>
                <div className="text-xs text-green-700">
                  <strong>Transaction Hash:</strong>
                  <div className="font-mono bg-green-100 p-2 rounded mt-1 break-all">
                    {success.txHash}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            {success ? (
              <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700">
                Close
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !newSignerAddress.trim()}>
                  {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                  Add Signer
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
