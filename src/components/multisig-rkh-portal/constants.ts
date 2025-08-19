export enum MultisigRkhPortalTabs {
  SIGNER_MANAGEMENT = 'SIGNER_MANAGEMENT',
  ALLOCATOR_PROPOSALS = 'ALLOCATOR_PROPOSALS',
  MY_PROPOSALS = 'MY_PROPOSALS',
}

export const availableFilters: Record<MultisigRkhPortalTabs, string[]> = {
  [MultisigRkhPortalTabs.SIGNER_MANAGEMENT]: [],
  [MultisigRkhPortalTabs.ALLOCATOR_PROPOSALS]: [],
  [MultisigRkhPortalTabs.MY_PROPOSALS]: [],
};
