import { X } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React from 'react';

interface RefreshAllocatorErrorStep {
  onGoBack: () => void;
  onClose: () => void;
}

export function RefreshAllocatorErrorStep({ onGoBack, onClose }: RefreshAllocatorErrorStep) {
  return (
    <>
      <div className="flex pt-4 pb-6">
        <X className="text-red-500" /> Something went wrong!
      </div>

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
