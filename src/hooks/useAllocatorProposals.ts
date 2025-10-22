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

        // Fetch and cache pending transactions for RKH
        let rkhPending: Map<number, PendingTransaction> = new Map();
        if (msigAddress !== 'f080' && msigAddress !== 't080') {
          const f080Client = createFilecoinRpcProxyClient('f080');
          try {
            const txs = await f080Client.getPendingTransactions();
            rkhPending = new Map(txs.map(item => [item.ID, item]));
          } catch (rpcError) {
            console.error('useAllocatorProposals: RPC call to f080 failed:', rpcError);
            console.error('Params will not decode properly without this data.');
            throw rpcError;
          }
        }

        // Process and decode each pending transaction
        const processedProposals: AllocatorProposal[] = [];

        for (const tx of pendingTransactions) {
          let decodedParams = null;
          let realTo = '';
          let realMethod = 0;
          try {
            if (msigAddress === 'f080' || msigAddress === 't080') {
              // For multisig proposals to f080, the outer params contain an inner message
              // We need to decode the inner message's params to get the actual proposal details
              decodedParams = await client.decodeParams(tx.To, tx.Method, tx.Params);
              realTo = tx.To;
              realMethod = tx.Method;
            } else {
              // For the member msigs it's a bit more complex: the proposals and rejections might
              // reference f080 pending proposals by number (if approving/rejecting one that's
              // already in the f080 list), or it might actually have params (if it's a fresh
              // proposal-to-propose something) so we first need to check which case we're in.
              if (tx.To === 'f080' || tx.To === 't080') {
                const innerTx = await client.decodeParams(tx.To, tx.Method, tx.Params);
                console.log(innerTx);

                // If it has an ID field, it's referencing an existing f080 proposal
                if (innerTx.ID) {
                  // Look up the referenced f080 transaction for friendly params
                  const rkhTx = rkhPending.get(innerTx.ID);
                  if (!rkhTx) {
                    throw new Error(`Referenced RKH proposal ID ${innerTx.ID} not found`);
                  }
                  decodedParams = await client.decodeParams(rkhTx.To, rkhTx.Method, rkhTx.Params);
                  decodedParams.ID = innerTx.ID; // For display and x-ref only
                  realTo = tx.To;
                  realMethod = tx.Method;
                } else {
                  // Otherwise it's a fresh proposal, so decode directly
                  if (!innerTx.To || !innerTx.Method) {
                    throw new Error('Unhandled transaction format in inner proposal');
                  }
                  decodedParams = await client.decodeParams(
                    innerTx.To,
                    innerTx.Method,
                    innerTx.Params,
                  );
                  realTo = innerTx.To;
                  realMethod = innerTx.Method;
                }
              } else {
                // In this case we're looking at a direct proposal to our own msig,
                // or some other destination that we can't (necessarily) resolve further.
                decodedParams = await client.decodeParams(tx.To, tx.Method, tx.Params);
                realTo = tx.To;
                realMethod = tx.Method;
              }
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
