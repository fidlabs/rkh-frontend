import { RefreshAlloactorButton } from './RefreshAlloactorButton'
import { useState } from 'react'
import { RefreshAllocatorDialog } from '@/components/refresh/dialogs/RefreshAllocatorDialog'

export function RefreshAllocatorSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <RefreshAllocatorDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <RefreshAlloactorButton onClick={() => setIsDialogOpen(true)} />
    </>
  )
}
