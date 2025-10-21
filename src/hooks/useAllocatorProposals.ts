import { useState, useEffect } from 'react';
import { createFilecoinRpcProxyClient } from '@/lib/filecoin-rpc-proxy';
import { PendingTransaction, DecodedParams } from '@/lib/filecoin-rpc';
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

export function useAllocatorProposals(
  msigAddress: string = filecoinConfig.defaultMsigAddress,
): AllocatorProposalsData {
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

        const client = createFilecoinRpcProxyClient(msigAddress);

        let pendingTransactions;
        try {
          pendingTransactions = await client.getPendingTransactions();
        } catch (rpcError) {
          console.error('useAllocatorProposals: RPC call failed:', rpcError);
          throw rpcError;
        }

        // Process and decode each pending transaction
        const processedProposals: AllocatorProposal[] = [];

        for (const tx of pendingTransactions) {
          let decodedParams;
          let realTo;
          let realMethod;
          try {
            if (msigAddress === 'f080') {
              // For multisig proposals to f080, the outer params contain an inner message
              // We need to decode the inner message's params to get the actual proposal details
              console.log('RKH path!')
              console.log(tx)
              decodedParams = await client.decodeParams(tx.To, tx.Method, tx.Params);
              realTo = tx.To;
              realMethod = tx.Method;
            } else {
              console.log('my msig path!')
              console.log(tx)
              const innerTx = await client.decodeParams(tx.To, tx.Method, tx.Params);
              console.log(innerTx)
              decodedParams = await client.decodeParams(innerTx.To, innerTx.Method, innerTx.Params);
              realTo = innerTx.To;
              realMethod = innerTx.Method;
            }

            processedProposals.push({
              id: tx.ID,
              to: realTo,
              value: tx.Value,
              method: realMethod,
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
