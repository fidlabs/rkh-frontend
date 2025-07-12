import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MetaAllocatorSignTransactionDialog } from '@/components/refresh/dialogs';

interface MetaAllocatorSignTransactionButtonProps {
  address: string;
  maAddress: `0x${string}`;
}

export function MetaAllocatorSignTransactionButton({
  address,
  maAddress,
}: MetaAllocatorSignTransactionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <span className="sm:whitespace-nowrap">Approve</span>
      </Button>
      <MetaAllocatorSignTransactionDialog
        address={address}
        maAddress={maAddress}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
