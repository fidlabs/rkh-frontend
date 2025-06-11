'use client';

import { Button } from '@/components/ui/button';

interface RefreshAlloactorButtonProps {
  onClick?: () => void;
}

export function RefreshAlloactorButton({ onClick }: RefreshAlloactorButtonProps) {
  return (
    <Button variant="outline" onClick={onClick}>
      <span className="sm:whitespace-nowrap">Refresh Alloactor</span>
    </Button>
  );
}
