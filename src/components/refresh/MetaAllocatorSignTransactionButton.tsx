import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MetaAllocatorSignTransactionDialog from '@/components/refresh/dialogs/MetaAllocatorSignTransactionDialog';
import { MetapathwayType } from '@/types/refresh';

interface MetaAllocatorSignTransactionButtonProps {
  address: string;
  maAddress: `0x${string}`;
  dataCap: number;
  metapathwayType: MetapathwayType;
}

export function MetaAllocatorSignTransactionButton({
  address,
  maAddress,
  dataCap,
  metapathwayType,
}: MetaAllocatorSignTransactionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button className="w-[150px]" onClick={() => setIsDialogOpen(true)}>
        <span className="sm:whitespace-nowrap">Approve</span>
      </Button>
      <MetaAllocatorSignTransactionDialog
        metapathwayType={metapathwayType}
        address={address}
        maAddress={maAddress}
        dataCap={dataCap}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
