import React from 'react';
import { cn } from '@/lib/utils';
import { RefreshStatus } from '@/types/refresh';
import { Badge } from '@/components/ui/badge';

interface RefreshStatusBadgeProps {
  refreshStatus: RefreshStatus;
}

const phaseColors: Record<RefreshStatus, string> = {
  DC_ALLOCATED: 'bg-green-600',
  PENDING: 'bg-gray-600',
  SIGNED_BY_RKH: 'bg-orange-600',
  REJECTED: 'bg-red-600',
};

const phaseNames: Record<RefreshStatus, string> = {
  DC_ALLOCATED: 'DC Allocated',
  PENDING: 'Pending',
  SIGNED_BY_RKH: 'Signed by RKH',
  REJECTED: 'Rejected',
};

export function RefreshStatusBadge({ refreshStatus }: RefreshStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'text-xs font-semibold',
        phaseColors[refreshStatus] || 'bg-gray-600',
        'ring-2 ring-offset-2 ring-offset-white ring-gray-300',
      )}
    >
      {phaseNames[refreshStatus || 'PENDING']}
    </Badge>
  );
}
