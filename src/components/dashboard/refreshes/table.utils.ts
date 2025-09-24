import { MetaAllocatorName } from '@/types/ma';
import { Refresh, RefreshStatus } from '@/types/refresh';
import { Row } from '@tanstack/react-table';

export const isWaitingForGovernanceReview = (row: Row<Refresh>): boolean => {
  const { refreshStatus } = row.original;

  return refreshStatus === RefreshStatus.PENDING;
};

export const isWaitingForRkhSign = (row: Row<Refresh>): boolean => {
  const { refreshStatus, metapathwayType } = row.original;

  return metapathwayType === 'RKH' && refreshStatus === RefreshStatus.APPROVED;
};

export const isWaitingForRkhApprove = (row: Row<Refresh>): boolean => {
  const { refreshStatus, rkhPhase, metapathwayType } = row.original;

  return (
    metapathwayType === 'RKH' &&
    refreshStatus === RefreshStatus.SIGNED_BY_RKH &&
    !!rkhPhase?.approvals?.length
  );
};

export const isWaitingForMAApprove = (row: Row<Refresh>): boolean => {
  const { refreshStatus, metapathwayType } = row.original;

  return (
    Object.values(MetaAllocatorName).includes(metapathwayType as unknown as MetaAllocatorName) &&
    refreshStatus === RefreshStatus.APPROVED
  );
};

export const isAllocated = (row: Row<Refresh>): boolean => {
  const { refreshStatus, transactionCid } = row.original;

  return refreshStatus === RefreshStatus.DC_ALLOCATED && !!transactionCid;
};
