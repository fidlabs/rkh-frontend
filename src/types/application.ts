//FIXME there is a backend typo associated with IN_REFRESH status, it should be investigated before changing (database model and migrations)
export type ApplicationStatus =
  | 'KYC_PHASE'
  | 'GOVERNANCE_REVIEW_PHASE'
  | 'RKH_APPROVAL_PHASE'
  | 'APPROVED'
  | 'META_APPROVAL_PHASE'
  | 'DC_ALLOCATED'
  | 'REJECTED'
  | 'IN_REFRESSH'; // backend typo

export interface Application {
  id: string;
  number: number;
  name: string;
  organization: string;
  address: string;
  github: string;
  country: string;
  region: string;
  type: string;
  datacap: number;

  actorId?: string;

  // STATUS
  status: ApplicationStatus;

  // SUBMISSION PHASE
  githubPrNumber: string;
  githubPrLink: string;

  // KYC PHASE
  // ---

  // GOVERNANCE REVIEW PHASE
  applicationInstructions?: {
    method: string;
    startTimestamp: number;
    endTimestamp: number;
    allocatedTimestamp: number;
    status: string;
    datacap_amount: number;
    isMDMAAllocator?: boolean;
    isMetaAllocator?: boolean;
  }[];

  // KHK APPROVAL PHASE
  rkhApprovals?: string[];
  rkhApprovalsThreshold?: number;
  rkhMessageId?: number;
}

export interface ApplicationsResponse {
  applications: Application[];
  totalCount: number;
}
