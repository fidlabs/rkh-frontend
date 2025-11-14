import React from 'react';
import { cn } from '@/lib/utils';
import { Application, ApplicationStatus } from '@/types/application';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ApplicationStatusBadgeProps {
  application: Application;
}

const phaseColors: Record<ApplicationStatus, string> = {
  KYC_PHASE: 'bg-blue-600',
  GOVERNANCE_REVIEW_PHASE: 'bg-yellow-600',
  RKH_APPROVAL_PHASE: 'bg-orange-600',
  META_APPROVAL_PHASE: 'bg-orange-800', // TODO do we want different colors for the different meta allocator types?
  DC_ALLOCATED: 'bg-green-600',
  APPROVED: 'bg-green-600',
  REJECTED: 'bg-red-600',
  IN_REFRESSH: 'bg-gray-600',
};

const phaseDescriptions: Record<ApplicationStatus, string> = {
  KYC_PHASE: 'Awaiting Know Your Customer verification. Go to Github to proceed',
  GOVERNANCE_REVIEW_PHASE: 'Application in review by governance team',
  RKH_APPROVAL_PHASE: 'Awaiting Root Key Holder approval',
  META_APPROVAL_PHASE: 'Awaiting approval on Meta Allocator smart contract',
  DC_ALLOCATED: 'Datacap Allocated',
  APPROVED: 'Approved',
  REJECTED: 'Application rejected',
  IN_REFRESSH: 'In Refresh',
};

const phaseNames: Record<ApplicationStatus, string> = {
  KYC_PHASE: 'KYC',
  GOVERNANCE_REVIEW_PHASE: 'Gov Review',
  RKH_APPROVAL_PHASE: 'RKH Approval ',
  META_APPROVAL_PHASE: 'MDMA Approval',
  DC_ALLOCATED: 'DC Allocated',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  IN_REFRESSH: 'In Refresh',
};

const phaseLabel = (application: Application) => {
  if (application.status === 'META_APPROVAL_PHASE') {
    // Pathway shouldn't change so 1st instruction should always be right
    const firstInstruction = application.applicationInstructions?.[0];
    const method = firstInstruction?.method || 'META';
    return `${method} Approval`;
  }

  return phaseNames[application.status];
};

export function ApplicationStatusBadge({ application }: ApplicationStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        'text-xs font-semibold',
        phaseColors[application.status],
        'ring-2 ring-offset-2 ring-offset-white ring-gray-300',
      )}
    >
      {phaseLabel(application)}
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-4 h-4 text-white ml-2" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{phaseDescriptions[application.status]}</p>
        </TooltipContent>
      </Tooltip>
    </Badge>
  );
}
