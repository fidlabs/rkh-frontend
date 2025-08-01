export enum DashboardTabs {
  NEW_APPLICATIONS = 'NEW',
  COMPLETED_APPLICATIONS = 'COMPLETED',
  REFRESHES = 'REFRESHES',
}

export const availableFilters: Record<DashboardTabs, string[]> = {
  [DashboardTabs.NEW_APPLICATIONS]: [
    'KYC_PHASE',
    'GOVERNANCE_REVIEW_PHASE',
    'RKH_APPROVAL_PHASE',
    'APPROVED',
    'META_APPROVAL_PHASE',
  ],
  [DashboardTabs.COMPLETED_APPLICATIONS]: ['DC_ALLOCATED', 'REJECTED'], // FIXME backend typo
  [DashboardTabs.REFRESHES]: [],
};

export const PAGE_SIZE = 10;
