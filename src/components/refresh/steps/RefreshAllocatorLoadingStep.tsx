import { Loader2 } from 'lucide-react';

interface RefreshAllocatorLoadingStep {
  loadingMessage?: string | null;
}

export function RefreshAllocatorLoadingStep({ loadingMessage }: RefreshAllocatorLoadingStep) {
  const message = loadingMessage || 'Loading...';

  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p data-testid="loading-message">{message}</p>
    </div>
  );
}
