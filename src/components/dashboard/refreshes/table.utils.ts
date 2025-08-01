import { Refresh } from '@/types/refresh';
import { Row } from '@tanstack/react-table';

export const isWaitingForRkhSign = (row: Row<Refresh>): boolean => {
  const { refreshStatus, metapathwayType } = row.original;

  return metapathwayType === 'RKH' && refreshStatus === 'PENDING';
};

export const isWaitingForRkhApprove = (row: Row<Refresh>): boolean => {
  const { refreshStatus, rkhPhase, metapathwayType } = row.original;

  return (
    metapathwayType === 'RKH' && refreshStatus === 'SIGNED_BY_RKH' && !!rkhPhase?.approvals?.length
  );
};

export const isWaitingForMAApprove = (row: Row<Refresh>): boolean => {
  const { refreshStatus, metapathwayType } = row.original;

  return metapathwayType === 'MDMA' && refreshStatus === 'PENDING';
};

export const isAllocated = (row: Row<Refresh>): boolean => {
  const { refreshStatus, transactionCid } = row.original;

  return refreshStatus === 'DC_ALLOCATED' && !!transactionCid;
};
