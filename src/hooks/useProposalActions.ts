import { useState } from 'react';
import { createFilecoinRpcClient } from '@/lib/filecoin-rpc';
import { filecoinConfig } from '@/config/filecoin';
import { 
  approvePendingTransaction,
  cancelPendingTransaction,
  proposeAddSigner,
  rejectAddSigner,
} from '@/lib/multisig-actions';
import { useAccount } from './useAccount';

export interface ProposalActionResult {
  success: boolean;
  message: string;
  error?: string;
}

export interface ProposalActionParams {
  proposalId: number;
  method: number;
}

export function useProposalActions() {
  const [isLoading, setIsLoading] = useState(false);
  const accountContext = useAccount();

  const approveProposal = async (proposalId: number, method: number): Promise<{ success: boolean; message: string; txHash?: string; error?: string }> => {
    setIsLoading(true);
    try {
      // All approval methods use the same generic function since they all call f080.Method3 (Approve)
      const result = await approvePendingTransaction({
        proposalId,
        msigAddress: accountContext.account?.parentMsigAddress || '',
        accountContext,
      });

      if (!result.success) {
        throw new Error(result.error || 'Approval failed');
      }

      return result;
      
    } catch (error) {
      console.error('Failed to approve proposal:', error);
      throw new Error(`Failed to approve proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const rejectProposal = async (proposalId: number, method: number): Promise<{ success: boolean; message: string; txHash?: string; error?: string }> => {
    setIsLoading(true);
    try {
      // All rejection methods use the same generic function since they all call f080.Method4 (Cancel)
      const result = await cancelPendingTransaction({
        proposalId,
        msigAddress: accountContext.account?.parentMsigAddress || '',
        accountContext,
      });

      if (!result.success) {
        throw new Error(result.error || 'Rejection failed');
      }

      return result;
      
    } catch (error) {
      console.error('Failed to reject proposal:', error);
      throw new Error(`Failed to reject proposal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    approveProposal,
    rejectProposal,
    isLoading,
  };
}
