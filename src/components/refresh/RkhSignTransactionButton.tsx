import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RkhSignTransactionDialog } from '@/components/refresh/dialogs';

interface RkhSignTransactionButtonProps {
  address: string;
  dataCap: number;
}

export function RkhSignTransactionButton({ address, dataCap }: RkhSignTransactionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button className="w-[150px]" onClick={() => setIsDialogOpen(true)}>
        <span className="sm:whitespace-nowrap">RKH Sign</span>
      </Button>
      <RkhSignTransactionDialog
        address={address}
        dataCap={dataCap}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
