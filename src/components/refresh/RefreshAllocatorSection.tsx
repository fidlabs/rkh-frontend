import { RefreshAllocatorButton } from './RefreshAllocatorButton';
import { useState } from 'react';
import { RefreshAllocatorDialog } from '@/components/refresh/dialogs/RefreshAllocatorDialog';

export function RefreshAllocatorSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <RefreshAllocatorDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <RefreshAllocatorButton onClick={() => setIsDialogOpen(true)} />
    </>
  );
}
