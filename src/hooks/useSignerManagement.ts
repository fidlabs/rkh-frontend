import { useState, useEffect } from 'react';
import { createFilecoinRpcClient, FilecoinState } from '@/lib/filecoin-rpc';

export interface Signer {
  address: string;
  isActive: boolean;
}

export interface SignerManagementData {
  signers: Signer[];
  threshold: number;
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
}

export function useSignerManagement(): SignerManagementData {
  const [signers, setSigners] = useState<Signer[]>([]);
  const [threshold, setThreshold] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSigners() {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        const client = createFilecoinRpcClient('t080'); // F080 multisig
        const state = await client.getState();

        const signerList: Signer[] = state.Signers.map(address => ({
          address,
          isActive: true, // All signers in the state are active
        }));

        setSigners(signerList);
        setThreshold(state.NumApprovalsThreshold);
      } catch (err) {
        setIsError(true);
        setError(err instanceof Error ? err.message : 'Failed to fetch signers');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSigners();
  }, []);

  return {
    signers,
    threshold,
    totalCount: signers.length,
    isLoading,
    isError,
    error,
  };
}
