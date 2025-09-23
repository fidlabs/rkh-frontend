import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RkhApproveTransactionDialog } from '@/components/refresh/dialogs/RkhApproveTransactionDialog';

interface RkhSignTransactionButtonProps {
  address: string;
  transactionId: number;
  datacap: number;
  fromAccount: string;
}

export function RkhApproveTransactionButton({
  address,
  transactionId,
  datacap,
  fromAccount,
}: RkhSignTransactionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button className="w-[150px]" onClick={() => setIsDialogOpen(true)}>
        <span className="sm:whitespace-nowrap">RKH Approve</span>
      </Button>
      <RkhApproveTransactionDialog
        address={address}
        transactionId={transactionId}
        datacap={datacap}
        fromAccount={fromAccount}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
