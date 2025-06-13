import { CircleXIcon } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';

interface RefreshAllocatorErrorStep {
  errorMessage?: string | null;
  onGoBack: () => void;
  onClose: () => void;
}

export function RefreshAllocatorErrorStep({
  onGoBack,
  onClose,
  errorMessage,
}: RefreshAllocatorErrorStep) {
  const message = errorMessage || 'An unknown error occurred.';

  return (
    <>
      <div className="flex flex-col items-center pt-4 pb-4 min-w-48 text-xl text-red-500">
        <CircleXIcon size="60px" /> Error
      </div>

      <div className="text-sm pb-4 text-center">{message}</div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onGoBack}>
          Go back
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
}
