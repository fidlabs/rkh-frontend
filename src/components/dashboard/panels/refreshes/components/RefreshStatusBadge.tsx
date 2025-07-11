import React from 'react';
import { cn } from '@/lib/utils';
import { RefreshStatus } from '@/types/application';
import { Badge } from '@/components/ui/badge';

interface RefreshStatusBadgeProps {
  refreshStatus: RefreshStatus;
}

const phaseColors: Record<RefreshStatus, string> = {
  DC_ALLOCATED: 'bg-green-600',
  PENDING: 'bg-gray-600',
};

const phaseNames: Record<RefreshStatus, string> = {
  DC_ALLOCATED: 'DC Allocated',
  PENDING: 'Pending',
};

export function RefreshStatusBadge({ refreshStatus }: RefreshStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'text-xs font-semibold',
        phaseColors[refreshStatus],
        'ring-2 ring-offset-2 ring-offset-white ring-gray-300',
      )}
    >
      {phaseNames[refreshStatus]}
    </Badge>
  );
}
