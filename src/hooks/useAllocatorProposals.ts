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
  console.log('useAllocatorProposals: hook called with msigAddress:', msigAddress);
  const [proposals, setProposals] = useState<AllocatorProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProposals() {
      console.log('useAllocatorProposals: fetchProposals called with msigAddress:', msigAddress);
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        const client = createFilecoinRpcClient(msigAddress);
        console.log('useAllocatorProposals: client created, fetching pending transactions...');
        
        let pendingTransactions;
        try {
          pendingTransactions = await client.getPendingTransactions();
          console.log('useAllocatorProposals: got pending transactions:', pendingTransactions);
        } catch (rpcError) {
          console.error('useAllocatorProposals: RPC call failed:', rpcError);
          throw rpcError;
        }

        // Process and decode each pending transaction
        const processedProposals: AllocatorProposal[] = [];
        console.log('useAllocatorProposals: processing', pendingTransactions.length, 'transactions');
        
        for (const tx of pendingTransactions) {
          console.log('useAllocatorProposals: processing transaction ID:', tx.ID, 'Method:', tx.Method, 'Params:', tx.Params);
          console.log('useAllocatorProposals: transaction object:', JSON.stringify(tx, null, 2));
          try {
            // First decode the outer params (the proposal to the multisig)
            // Use the actual method from the transaction, not hardcoded 2
            const decodedParams = await client.decodeParams(tx.To, tx.Method, tx.Params);
            console.log('decodedParams ...', decodedParams);
            // For multisig proposals, the outer params contain an inner message
            // We need to decode the inner message's params to get the actual proposal details
            
            processedProposals.push({
              id: tx.ID,
              to: tx.To,
              value: tx.Value,
              method: tx.Method,
              params: tx.Params,
              approved: tx.Approved,
              decodedParams: decodedParams, // Prefer inner params if available
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
