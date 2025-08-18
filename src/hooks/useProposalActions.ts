import { useState } from 'react';
import { createFilecoinRpcClient } from '@/lib/filecoin-rpc';
import { filecoinConfig } from '@/config/filecoin';
import { 
  approveAddVerifierIndirect,
  rejectAddVerifierIndirect,
  approveAddSignerIndirect,
  rejectAddSignerIndirect,
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

export function useProposalActions(msigAddress: string = filecoinConfig.defaultMsigAddress) {
  const [isLoading, setIsLoading] = useState(false);
  const accountContext = useAccount();

  const approveProposal = async (proposalId: number, method: number): Promise<{ success: boolean; message: string; txHash?: string; error?: string }> => {
    setIsLoading(true);
    try {
      let result;

      if (method === 2) {
        // Method 2: AddVerifierIndirect
        result = await approveAddVerifierIndirect({
          proposalId,
          msigAddress,
          accountContext,
        });
      } else if (method === 5) {
        // Method 5: AddSignerIndirect
        result = await approveAddSignerIndirect({
          proposalId,
          msigAddress,
          accountContext,
        });
      } else {
        throw new Error(`Unsupported method ${method} for approval`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Approval failed');
      }

      console.log('Proposal approved successfully:', result.message);
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
      let result;

      if (method === 2) {
        // Method 2: AddVerifierIndirect
        result = await rejectAddVerifierIndirect({
          proposalId,
          msigAddress,
          accountContext,
        });
      } else if (method === 5) {
        // Method 5: AddSignerIndirect
        result = await rejectAddSignerIndirect({
          proposalId,
          msigAddress,
          accountContext,
        });
      } else {
        throw new Error(`Unsupported method ${method} for rejection`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Rejection failed');
      }

      console.log('Proposal rejected successfully:', result.message);
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
