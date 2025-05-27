import React from 'react';
import { cn } from '@/lib/utils';
import { Application, ApplicationStatus } from '@/types/application';
import { CheckCircle2, AlertCircle, Clock, XCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ApplicationStatusBarProps {
  application: Application;
}

const phases: ApplicationStatus[] = [
  "KYC_PHASE",
  "GOVERNANCE_REVIEW_PHASE",
  "RKH_APPROVAL_PHASE",
  "META_APPROVAL_PHASE",
  "APPROVED",
  "DC_ALLOCATED",
  "REJECTED",
];

const phaseColors: Record<ApplicationStatus, string> = {
  KYC_PHASE: 'bg-blue-600',
  GOVERNANCE_REVIEW_PHASE: 'bg-yellow-600',
  RKH_APPROVAL_PHASE: 'bg-orange-600',
  META_APPROVAL_PHASE: 'bg-orange-600',
  DC_ALLOCATED: 'bg-green-600',
  APPROVED: 'bg-green-600',
  REJECTED: 'bg-red-600',
};

const phaseDescriptions: Record<ApplicationStatus, string> = {
  KYC_PHASE: 'Know Your Customer verification process',
  GOVERNANCE_REVIEW_PHASE: 'Application review by governance committee',
  RKH_APPROVAL_PHASE: 'Final approval by RKH',
  META_APPROVAL_PHASE: 'Meta approval phase',
  DC_ALLOCATED: 'Received DC',
  APPROVED: 'Application approved',
  REJECTED: 'Application rejected',
};

const phaseNames: Record<ApplicationStatus, string> = {
  KYC_PHASE: 'KYC',
  GOVERNANCE_REVIEW_PHASE: 'Review',
  RKH_APPROVAL_PHASE: 'RKH Approval',
  META_APPROVAL_PHASE: 'Meta approval',
  DC_ALLOCATED: 'DC Allocated',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function ApplicationStatusBar({ application }: ApplicationStatusBarProps) {
  const currentPhaseIndex = phases.indexOf(application.status);

  const getPhaseProgress = (index: number) => {
    if (index < currentPhaseIndex) return 1;
    if (index > currentPhaseIndex) return 0;
    return { color: 'text-blue-600', icon: AlertCircle, progress: 0.5 };
  };

  return (
    <div className="flex flex-col space-y-3 w-full min-w-[200px]">
      <div className="hidden sm:block relative w-full bg-gray-200 rounded-full h-2">
        {phases.map((p, index) => (
          <React.Fragment key={p}>
            <div
              className={cn(
                "absolute h-2 rounded-full",
                index <= currentPhaseIndex ? phaseColors[p] : 'bg-gray-300'
              )}
              style={{
                left: `${(index / (phases.length - 1)) * 100}%`,
                width: `${100 / (phases.length - 1)}%`,
                transform: `scaleX(${getPhaseProgress(index)})`,
                transformOrigin: 'left',
                transition: 'transform 0.3s ease-in-out'
              }}
            ></div>
            {index === currentPhaseIndex && (
              <div
                className="absolute -top-7 -translate-x-1/2"
                style={{ left: `${(index / (phases.length - 1)) * 100}%` }}
              >
                <Badge 
                  className={cn(
                    "text-xs font-semibold",
                    phaseColors[p],
                  )}
                >
                  {phaseNames[p]}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild className="ml-2">
                        <HelpCircle className="w-4 h-4 text-white" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{phaseDescriptions[application.status]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Badge>
              </div>
            )}
            <div
              className={cn(
                "absolute top-1/2 w-3 h-3 rounded-full -translate-y-1/2 border-2 border-white",
                index <= currentPhaseIndex ? phaseColors[p] : 'bg-gray-300'
              )}
              style={{ left: `calc(${(index / (phases.length - 1)) * 100}% - 6px)` }}
            ></div>
          </React.Fragment>
        ))}
      </div>
      <div className="sm:hidden flex justify-center">
        <Badge 
          className={cn(
            "text-xs font-semibold",
            phaseColors[application.status],
            'ring-2 ring-offset-2 ring-offset-white ring-gray-300'
          )}
        >
          {phaseNames[application.status]}
          <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild className="ml-2">
                        <HelpCircle className="w-4 h-4 text-white" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{phaseDescriptions[application.status]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
        </Badge>
      </div>
    </div>
  );
}
