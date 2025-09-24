import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MetaAllocatorSignTransactionDialog } from '@/components/refresh/dialogs';

interface MetaAllocatorSignTransactionButtonProps {
  address: string;
  maAddress: `0x${string}`;
  dataCap: number;
}

export function MetaAllocatorSignTransactionButton({
  address,
  maAddress,
  dataCap,
}: MetaAllocatorSignTransactionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button className="w-[150px]" onClick={() => setIsDialogOpen(true)}>
        <span className="sm:whitespace-nowrap">Approve</span>
      </Button>
      <MetaAllocatorSignTransactionDialog
        address={address}
        maAddress={maAddress}
        dataCap={dataCap}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
