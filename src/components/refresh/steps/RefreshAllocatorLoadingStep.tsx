import { Loader2 } from 'lucide-react'

export function RefreshAllocatorLoadingStep() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p>Connecting to Ledger...</p>
    </div>
  )
}
