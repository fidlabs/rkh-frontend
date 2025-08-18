import { useState, useEffect } from 'react';
import { createFilecoinRpcClient, PendingTransaction, DecodedParams } from '@/lib/filecoin-rpc';
import { filecoinConfig } from '@/config/filecoin';

export interface AllocatorProposal {
  id: number;
  to: string;
  value: string;
  method: number;
  params: string;
  approved: string[];
  decodedParams: DecodedParams | null;
}

export interface AllocatorProposalsData {
  proposals: AllocatorProposal[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

export function useAllocatorProposals(msigAddress: string = filecoinConfig.defaultMsigAddress): AllocatorProposalsData {
  const [proposals, setProposals] = useState<AllocatorProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProposals() {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        const client = createFilecoinRpcClient(msigAddress);
        const pendingTransactions = await client.getPendingTransactions();

        // Process and decode each pending transaction
        const processedProposals: AllocatorProposal[] = [];
        
        for (const tx of pendingTransactions) {
          try {
            const decodedParams = await client.decodeParams(tx.Method, tx.Params);
            
            processedProposals.push({
              id: tx.ID,
              to: tx.To,
              value: tx.Value,
              method: tx.Method,
              params: tx.Params,
              approved: tx.Approved,
              decodedParams,
            });
          } catch (decodeError) {
            // If decoding fails, still include the transaction but with null decoded params
            processedProposals.push({
              id: tx.ID,
              to: tx.To,
              value: tx.Value,
              method: tx.Method,
              params: tx.Params,
              approved: tx.Approved,
              decodedParams: null,
            });
          }
        }

        setProposals(processedProposals);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
      } finally {
        setIsLoading(false);
      }
    }

    if (msigAddress) {
      fetchProposals();
    }
  }, [msigAddress]);

  return {
    proposals,
    totalCount: proposals.length,
    isLoading,
    isError,
    error,
  };
}
