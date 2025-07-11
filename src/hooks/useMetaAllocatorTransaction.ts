import { isFilecoinAddress } from '@/types/filecoin';
import { encodeFunctionData } from 'viem/utils';
import { MetaTransactionData, OperationType, TransactionResult } from '@safe-global/types-kit';
import { useAccount as useAccountWagmi, useSwitchChain } from 'wagmi';
import { useFilecoinPublicClient } from '@/hooks/use-filecoin-public-client';
import { useState } from 'react';
import { getSafeKit } from '@/lib/safe';

const addAllowanceContractAbi = [
  {
    type: 'function',
    name: 'addAllowance',
    inputs: [
      {
        name: 'allocator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

interface MetaAllocatorTransaction {
  onSubmitSafeTransaction?: () => void;
  onSubmitSafeTransactionSuccess?: (result: TransactionResult) => void;
  onSignSafeTransaction?: () => void;
  onExecuteSafeTransaction?: () => void;
  onConvertingAddress?: () => void;
  onSubmitSafeTransactionError?: (error: unknown) => void;
}

interface SubmitSafeTransactionParams {
  address: string;
  datacap: number;
  metaAllocatorContractAddress: `0x${string}`;
}

export const useMetaAllocatorTransaction = ({
  onSubmitSafeTransaction,
  onSubmitSafeTransactionSuccess,
  onSubmitSafeTransactionError,
  onConvertingAddress,
  onSignSafeTransaction,
  onExecuteSafeTransaction,
}: MetaAllocatorTransaction) => {
  const { connector } = useAccountWagmi();
  const { chains, switchChain } = useSwitchChain();
  const client = useFilecoinPublicClient();
  const [isPending, setIsPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const submitSafeTransaction = async ({
    address,
    datacap,
    metaAllocatorContractAddress,
  }: SubmitSafeTransactionParams) => {
    setIsPending(true);
    onSubmitSafeTransaction?.();

    switchChain({
      chainId: chains[0].id,
    });

    const provider = await connector?.getProvider();
    const safeKit = await getSafeKit(provider);

    let txAddress = address;
    let maAddress = metaAllocatorContractAddress;

    if (isFilecoinAddress(txAddress)) {
      try {
        onConvertingAddress?.();
        const converted = await client?.request({
          method: 'Filecoin.FilecoinAddressToEthAddress',
          params: [txAddress],
        });
        txAddress = converted as `0x${string}`;
      } catch (error) {
        onSubmitSafeTransactionError?.(
          error instanceof Error
            ? error
            : new Error('An unknown error occurred whilst converting to Ethereum address.'),
        );
        setIsPending(false);
        return;
      }
    }

    if (isFilecoinAddress(maAddress)) {
      try {
        onConvertingAddress?.();
        const converted = await client?.request({
          method: 'Filecoin.FilecoinAddressToEthAddress',
          params: [maAddress],
        });
        maAddress = converted as `0x${string}`;
      } catch (error) {
        onSubmitSafeTransactionError?.(
          error instanceof Error
            ? error
            : new Error('An unknown error occurred whilst converting to Ethereum address.'),
        );
        setIsPending(false);
        return;
      }
    }

    if (
      txAddress.length != 42 ||
      maAddress.length != 42 ||
      !txAddress.startsWith('0x') ||
      !maAddress.startsWith('0x')
    ) {
      onSubmitSafeTransactionError?.(new Error('Could not convert to Ethereum address.'));
      setIsPending(false);
      return;
    }

    // 1PiB is 2^50
    const fullDataCap = BigInt(datacap * 1_125_899_906_842_624);
    const data = encodeFunctionData({
      abi: addAllowanceContractAbi,
      functionName: 'addAllowance',
      args: [txAddress as `0x${string}`, fullDataCap],
    });

    const safeTransactionData: MetaTransactionData = {
      to: maAddress,
      value: '0',
      data: data,
      operation: OperationType.Call,
    };

    try {
      const safeTransaction = await safeKit.createTransaction({
        transactions: [safeTransactionData],
      });

      onSignSafeTransaction?.();
      const signedSafeTransaction = await safeKit.signTransaction(safeTransaction);

      onExecuteSafeTransaction?.();
      const executeTxResponse = await safeKit.executeTransaction(signedSafeTransaction);
      setTxHash(executeTxResponse.hash);
      onSubmitSafeTransactionSuccess?.(executeTxResponse);
    } catch (error) {
      onSubmitSafeTransactionError?.(error);
    }

    setIsPending(false);
  };

  return { submitSafeTransaction, isPending, txHash };
};
