'use client';

import { overrideKYC } from '@/lib/api';
import { useEffect, useState } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount as useAccountWagmi,
  useSwitchChain,
} from 'wagmi';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAccount } from '@/hooks';
import { Application } from '@/types/application';

interface OverrideKYCButtonProps {
  application: Application;
}

export default function OverrideKYCButton({ application }: OverrideKYCButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { account, signStateMessage } = useAccount();
  const { toast } = useToast();
  const [approvalSecret, setApprovalSecret] = useState('');
  const [overrideReason, setOverrideReason] = useState('No reason given');

  const { isPending, error: isError, data: hash, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setIsSubmitting(false);
      setApprovalSecret('');
      setOverrideReason('No reason given');
    }
    setIsOpen(open);
  };

  useEffect(() => {
    if (isConfirming) {
      toast({
        title: 'Transaction submitted',
        description: `${hash}`,
        variant: 'default',
      });
    }

    if (isError) {
      toast({
        title: 'Error',
        description: 'Failed to submit transaction',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  }, [isError, isConfirming, hash, toast]);

  const submitOverride = async () => {
    if (!account?.address || !account?.wallet) {
      toast({
        title: 'Error',
        description: 'No account or wallet available',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const signature = await signStateMessage(`KYC Override for ${application.id}`);
      const pubKey =
        account.wallet.getPubKey() || Buffer.from('0x0000000000000000000000000000000000000000');
      const safePubKey = pubKey?.toString('base64');

      const data = {
        reason: overrideReason || 'No reason given',
        reviewerAddress: account.address,
        reviewerPublicKey: safePubKey,
        signature: signature,
      };

      const response = await overrideKYC(application.id, data);

      if (response.ok) {
        // Success - API returned 200
        toast({
          title: 'Success',
          description: 'KYC override submitted successfully',
          variant: 'default',
        });
        handleOpenChange(false);
      } else {
        // Non-200 response - treat as error
        const errorMessage = `API request failed with status ${response.status}`;
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to submit KYC override:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit KYC override',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <Button className="w-[150px]" onClick={() => setIsOpen(true)}>
        Override KYC
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Override KYC</DialogTitle>
          <DialogDescription>
            Override KYC checks for this application on behalf of the Governance Team.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center items-center p-8">
          {isSubmitting && (
            <div className="flex flex-col items-center space-y-4">
              <svg
                className="lucide lucide-loader-circle h-8 w-8 animate-spin"
                fill="none"
                height="24"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <p>Submitting KYC override...</p>
            </div>
          )}

          {!isSubmitting && (
            <div className="flex justify-center flex-col gap-2">
              <Label>
                {`Overriding KYC for ${application.name} for ${application.datacap} PiBs.`}
              </Label>
              <Label>
                {
                  'Please confirm your Ledger is still connected then confirm PiB amount and allocator type to approve.'
                }
              </Label>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-col">
          <div className="flex center-items justify-center">
            <Input
              type="text"
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              placeholder="Give a short reason"
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button className="w-[150px]" disabled={isSubmitting} onClick={submitOverride}>
            {isSubmitting ? 'Submitting...' : 'APPROVE'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
