export enum RefreshStatus {
  PENDING = 'PENDING',
  DC_ALLOCATED = 'DC_ALLOCATED',
  REJECTED = 'REJECTED',
  SIGNED_BY_RKH = 'SIGNED_BY_RKH',
}

export enum MetapathwayType {
  MDMA = 'MDMA',
  RKH = 'RKH',
}

export interface Refresh {
  githubIssueId: number;
  title: string;
  creator: {
    userId: number;
    name: string;
  };
  assignees:
    | {
        userId: number;
        name: string;
      }[]
    | null;
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
