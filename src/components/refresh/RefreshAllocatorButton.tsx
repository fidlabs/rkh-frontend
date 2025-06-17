'use client';

import { Button } from '@/components/ui/button';

interface RefreshAllocatorButtonProps {
  onClick?: () => void;
}

export function RefreshAllocatorButton({ onClick }: RefreshAllocatorButtonProps) {
  return (
    <Button variant="outline" onClick={onClick}>
      <span className="sm:whitespace-nowrap">Refresh Allocator</span>
    </Button>
  );
}
