import { Check } from 'lucide-react'
import { DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import React from 'react'

interface RefreshAllocatorSuccessStepProps {
  onClose: () => void
}

export function RefreshAllocatorSuccessStep({ onClose }: RefreshAllocatorSuccessStepProps) {
  return (
    <>
      <div className="flex pt-4 pb-6">
        <Check className="text-green-600" /> Allocator refreshed successfully!
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  )
}
