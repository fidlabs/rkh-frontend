export type RefreshStatus = 'PENDING' | 'DC_ALLOCATED' | 'REJECTED' | 'SIGNED_BY_RKH';

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
  metapathwayType?: 'MDMA' | 'RKH';
  refreshStatus: RefreshStatus;
  dataCap: number;
  msigAddress: string;
  maAddress: `0x${string}`;
  rkhPhase?: {
    approvals: string[];
    messageId: number;
  };
}
