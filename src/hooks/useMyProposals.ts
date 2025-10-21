import { useAllocatorProposals } from './useAllocatorProposals';
import { useAccount } from '@/hooks/useAccount';

// Reuse the exact same logic but with different msig address
export function useMyProposals() {
  const accountContext = useAccount();
  return useAllocatorProposals(accountContext?.account?.parentMsigAddress || '');
}

// Re-export the types for convenience
export type { AllocatorProposal, AllocatorProposalsData } from './useAllocatorProposals';
