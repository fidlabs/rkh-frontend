import { useAllocatorProposals } from './useAllocatorProposals';

// Reuse the exact same logic but with different msig address
export function useMyProposals() {
  return useAllocatorProposals('t22zjjoqeqi2h7vmf7xfwb5bzxhkh7vb5yrddvfay');
}

// Re-export the types for convenience
export type { AllocatorProposal, AllocatorProposalsData } from './useAllocatorProposals';
