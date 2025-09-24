import { MetaAllocatorName } from './ma';

export enum RefreshStatus {
  PENDING = 'PENDING',
  DC_ALLOCATED = 'DC_ALLOCATED',
  REJECTED = 'REJECTED',
  SIGNED_BY_RKH = 'SIGNED_BY_RKH',
  APPROVED = 'APPROVED',
}

export enum MetapathwayType {
  MDMA = MetaAllocatorName.MDMA,
  ORMA = MetaAllocatorName.ORMA,
  AMA = MetaAllocatorName.AMA,
  RKH = 'RKH',
}

interface User {
  userId: number;
  name: string;
}

export interface Refresh {
  githubIssueId: number;
  githubIssueNumber: number;
  title: string;
  creator: User;
  assignees: User[] | null;
  labels: string[] | null;
  state: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  closedAt: Date | null;
  jsonNumber: string;
  metapathwayType?: MetapathwayType;
  transactionCid?: string;
  refreshStatus: RefreshStatus;
  dataCap: number;
  msigAddress: string;
  maAddress: `0x${string}`;
  rkhPhase?: {
    approvals: string[];
    messageId: number;
  };
}
