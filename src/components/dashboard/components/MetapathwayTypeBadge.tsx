import React from 'react';
import { cn } from '@/lib/utils';
import { MetapathwayType } from '@/types/refresh';
import { Badge } from '@/components/ui/badge';

interface MetapathwayTypeBadgeProps {
  metapathwayType: MetapathwayType;
}

const metapathwayColors: Record<MetapathwayType, string> = {
  MDMA: 'bg-blue-500',
  ORMA: 'bg-violet-400',
  AMA: 'bg-green-600',
  RKH: 'bg-gray-700',
};

const metapathwayNames: Record<MetapathwayType, string> = {
  MDMA: 'MDMA',
  ORMA: 'ORMA',
  AMA: 'AMA',
  RKH: 'RKH',
};

export function MetapathwayTypeBadge({ metapathwayType }: MetapathwayTypeBadgeProps) {
  return (
    <Badge
      className={cn(
        'text-xs font-semibold',
        metapathwayColors[metapathwayType] || 'bg-gray-600',
        'ring-2 ring-offset-2 ring-offset-white ring-gray-300',
      )}
    >
      {metapathwayNames[metapathwayType]}
    </Badge>
  );
}
