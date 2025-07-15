import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RkhSignTransactionDialog } from '@/components/refresh/dialogs';

interface RkhSignTransactionButtonProps {
  address: string;
}

export function RkhSignTransactionButton({ address }: RkhSignTransactionButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <span className="sm:whitespace-nowrap">RKH Sign</span>
      </Button>
      <RkhSignTransactionDialog
        address={address}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
