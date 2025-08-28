import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useMetaAllocatorTransaction } from './useMetaAllocatorTransaction';

import { createWrapper } from '@/test-utils';

const mocks = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
  mockUseAccountWagmi: vi.fn(),
  mockUseSwitchChain: vi.fn(),
  mockUseFilecoinPublicClient: vi.fn(),
  mockGetSafeKit: vi.fn(),
  mockIsFilecoinAddress: vi.fn(),
  mockEncodeFunctionData: vi.fn(),
  mockSigningTools: {
    default: {
      generateMnemonic: vi.fn(() => 'test mnemonic'),
      generateKeyPair: vi.fn(() => ({
        privateKey: 'test-private-key',
        publicKey: 'test-public-key',
      })),
    },
    transactionSerialize: vi.fn(() => 'mock-serialized-transaction'),
  },
  mockOnSubmitSafeTransaction: vi.fn(),
  mockOnSubmitSafeTransactionSuccess: vi.fn(),
  mockOnSubmitSafeTransactionError: vi.fn(),
  mockOnConvertingAddress: vi.fn(),
  mockOnSignSafeTransaction: vi.fn(),
  mockOnExecuteSafeTransaction: vi.fn(),
  mockSafeKit: {
    createTransaction: vi.fn(),
    signTransaction: vi.fn(),
    executeTransaction: vi.fn(),
  },
  mockSwitchChain: vi.fn(),
  mockClient: {
    request: vi.fn(),
  },
  mockConnector: {
    getProvider: vi.fn(),
  },
}));

vi.mock('@/hooks/useAccount', () => ({
  useAccount: mocks.mockUseAccount,
}));

vi.mock('@zondax/filecoin-signing-tools/js', () => mocks.mockSigningTools);

vi.mock('wagmi', () => ({
  useAccount: mocks.mockUseAccountWagmi,
  useSwitchChain: mocks.mockUseSwitchChain,
}));

vi.mock('@/hooks/use-filecoin-public-client', () => ({
  useFilecoinPublicClient: mocks.mockUseFilecoinPublicClient,
}));

vi.mock('@/lib/safe', () => ({
  getSafeKit: mocks.mockGetSafeKit,
}));

vi.mock('@/types/filecoin', () => ({
  isFilecoinAddress: mocks.mockIsFilecoinAddress,
}));

vi.mock('viem/utils', () => ({
  encodeFunctionData: mocks.mockEncodeFunctionData,
}));

const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('useMetaAllocatorTransaction', () => {
  const fixtureProvider = {};
  const fixtureSafeAddress = '0x1234567890123456789012345678901234567890';
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccount.mockReturnValue({
      selectedMetaAllocator: {
        ethSafeAddress: fixtureSafeAddress,
      },
    });

    mocks.mockUseAccountWagmi.mockReturnValue({
      connector: mocks.mockConnector,
    });

    mocks.mockUseSwitchChain.mockReturnValue({
      chains: [{ id: 314 }],
      switchChain: mocks.mockSwitchChain,
    });

    mocks.mockUseFilecoinPublicClient.mockReturnValue(mocks.mockClient);

    mocks.mockConnector.getProvider.mockResolvedValue(fixtureProvider);
    mocks.mockGetSafeKit.mockResolvedValue(mocks.mockSafeKit);
    mocks.mockIsFilecoinAddress.mockReturnValue(false);
    mocks.mockEncodeFunctionData.mockReturnValue('0x123456');

    mocks.mockSafeKit.createTransaction.mockResolvedValue({ id: 'safe-tx-123' });
    mocks.mockSafeKit.signTransaction.mockResolvedValue({ id: 'signed-tx-123' });
    mocks.mockSafeKit.executeTransaction.mockResolvedValue({
      hash: '0xabcdef123456789',
      status: 'success',
    });
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransaction: mocks.mockOnSubmitSafeTransaction,
          onSubmitSafeTransactionSuccess: mocks.mockOnSubmitSafeTransactionSuccess,
          onSubmitSafeTransactionError: mocks.mockOnSubmitSafeTransactionError,
          onConvertingAddress: mocks.mockOnConvertingAddress,
          onSignSafeTransaction: mocks.mockOnSignSafeTransaction,
          onExecuteSafeTransaction: mocks.mockOnExecuteSafeTransaction,
        }),
      { wrapper },
    );

    expect(result.current.isPending).toBe(false);
    expect(result.current.txHash).toBe(null);
    expect(result.current.blockNumber).toBe(null);
    expect(typeof result.current.submitSafeTransaction).toBe('function');
  });

  it('should work without callback props', () => {
    const { result } = renderHook(() => useMetaAllocatorTransaction({}), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.txHash).toBe(null);
    expect(result.current.blockNumber).toBe(null);
    expect(typeof result.current.submitSafeTransaction).toBe('function');
  });

  it('should handle successful transaction with Ethereum addresses', async () => {
    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransaction: mocks.mockOnSubmitSafeTransaction,
          onSubmitSafeTransactionSuccess: mocks.mockOnSubmitSafeTransactionSuccess,
          onSignSafeTransaction: mocks.mockOnSignSafeTransaction,
          onExecuteSafeTransaction: mocks.mockOnExecuteSafeTransaction,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mocks.mockOnSubmitSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.mockSwitchChain).toHaveBeenCalledWith({ chainId: 314 });
    expect(mocks.mockGetSafeKit).toHaveBeenCalledWith(fixtureProvider, fixtureSafeAddress);
    expect(mocks.mockEncodeFunctionData).toHaveBeenCalledWith({
      abi: expect.any(Array),
      functionName: 'addAllowance',
      args: [transactionParams.address, BigInt(100 * 1_125_899_906_842_624)],
    });
    expect(mocks.mockSafeKit.createTransaction).toHaveBeenCalled();
    expect(mocks.mockOnSignSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.mockSafeKit.signTransaction).toHaveBeenCalled();
    expect(mocks.mockOnExecuteSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.mockSafeKit.executeTransaction).toHaveBeenCalled();
    expect(mocks.mockOnSubmitSafeTransactionSuccess).toHaveBeenCalledWith(
      {
        hash: '0xabcdef123456789',
        status: 'success',
      },
      null,
    );
    expect(result.current.txHash).toBe('0xabcdef123456789');
    expect(result.current.blockNumber).toBe(null);
  });

  it('should handle successful transaction with Filecoin address conversion', async () => {
    mocks.mockIsFilecoinAddress
      .mockReturnValueOnce(true) // for address
      .mockReturnValueOnce(true); // for metaAllocatorContractAddress

    mocks.mockClient.request
      .mockResolvedValueOnce('0x1234567890123456789012345678901234567890') // converted address
      .mockResolvedValueOnce('0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'); // converted contract address

    const transactionParams = {
      address: 'f1abc123def456',
      datacap: 50,
      metaAllocatorContractAddress: 'f1def456abc123' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransaction: mocks.mockOnSubmitSafeTransaction,
          onSubmitSafeTransactionSuccess: mocks.mockOnSubmitSafeTransactionSuccess,
          onConvertingAddress: mocks.mockOnConvertingAddress,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mocks.mockOnConvertingAddress).toHaveBeenCalledTimes(2);
    expect(mocks.mockClient.request).toHaveBeenCalledTimes(2);
    expect(mocks.mockClient.request).toHaveBeenNthCalledWith(1, {
      method: 'Filecoin.FilecoinAddressToEthAddress',
      params: ['f1abc123def456'],
    });
    expect(mocks.mockClient.request).toHaveBeenNthCalledWith(2, {
      method: 'Filecoin.FilecoinAddressToEthAddress',
      params: ['f1def456abc123'],
    });
    expect(mocks.mockOnSubmitSafeTransactionSuccess).toHaveBeenCalled();
  });

  it('should handle address conversion error', async () => {
    mocks.mockIsFilecoinAddress.mockReturnValueOnce(true);

    const conversionError = new Error('Conversion failed');
    mocks.mockClient.request.mockRejectedValue(conversionError);

    const transactionParams = {
      address: 'f1abc123def456',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mocks.mockOnSubmitSafeTransactionError,
          onConvertingAddress: mocks.mockOnConvertingAddress,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mocks.mockOnConvertingAddress).toHaveBeenCalledTimes(1);
    expect(mocks.mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(conversionError);
    expect(mocks.mockSafeKit.createTransaction).not.toHaveBeenCalled();
  });

  it('should handle unknown conversion error', async () => {
    mocks.mockIsFilecoinAddress.mockReturnValueOnce(true);
    mocks.mockClient.request.mockRejectedValue('Unknown error');

    const transactionParams = {
      address: 'f1abc123def456',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mocks.mockOnSubmitSafeTransactionError,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mocks.mockOnSubmitSafeTransactionError).toHaveBeenCalledWith('Unknown error');
  });

  it('should handle invalid address validation error', async () => {
    // Mock conversion that returns invalid address
    mocks.mockIsFilecoinAddress.mockReturnValueOnce(true);
    mocks.mockClient.request.mockResolvedValue('invalid-address'); // Not 42 chars or doesn't start with 0x

    const transactionParams = {
      address: 'f1abc123def456',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mocks.mockOnSubmitSafeTransactionError,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mocks.mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(
      new Error('Could not convert to Ethereum address.'),
    );
    expect(mocks.mockSafeKit.createTransaction).not.toHaveBeenCalled();
  });

  it('should handle safe transaction creation error', async () => {
    const transactionError = new Error('Transaction creation failed');
    mocks.mockSafeKit.createTransaction.mockRejectedValue(transactionError);

    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mocks.mockOnSubmitSafeTransactionError,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mocks.mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(transactionError);
    expect(result.current.txHash).toBe(null);
  });

  it('should handle safe transaction signing error', async () => {
    const signingError = new Error('Transaction signing failed');
    mocks.mockSafeKit.signTransaction.mockRejectedValue(signingError);

    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mocks.mockOnSubmitSafeTransactionError,
          onSignSafeTransaction: mocks.mockOnSignSafeTransaction,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mocks.mockOnSignSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(signingError);
    expect(result.current.txHash).toBe(null);
  });

  it('should handle safe transaction execution error', async () => {
    const executionError = new Error('Transaction execution failed');
    mocks.mockSafeKit.executeTransaction.mockRejectedValue(executionError);

    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mocks.mockOnSubmitSafeTransactionError,
          onExecuteSafeTransaction: mocks.mockOnExecuteSafeTransaction,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mocks.mockOnExecuteSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(executionError);
    expect(result.current.txHash).toBe(null);
  });

  it('should calculate datacap correctly', async () => {
    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 5,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(() => useMetaAllocatorTransaction({}), { wrapper });

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    // 5 PiB = 5 * 2^50 = 5 * 1_125_899_906_842_624
    const expectedDatacap = BigInt(5 * 1_125_899_906_842_624);

    expect(mocks.mockEncodeFunctionData).toHaveBeenCalledWith({
      abi: expect.any(Array),
      functionName: 'addAllowance',
      args: [transactionParams.address, expectedDatacap],
    });
  });

  it('should fetch transaction receipt', async () => {
    const fixtureReceiptResponse = {
      blockNumber: 12345,
    };
    const fixtureExecuteTransactionResponse = {
      hash: '0xabcdef123456789',
      status: 'success',
      transactionResponse: {
        wait: vi.fn().mockResolvedValue(fixtureReceiptResponse),
      },
    };

    mocks.mockSafeKit.executeTransaction.mockResolvedValue(fixtureExecuteTransactionResponse);

    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransaction: mocks.mockOnSubmitSafeTransaction,
          onSubmitSafeTransactionSuccess: mocks.mockOnSubmitSafeTransactionSuccess,
          onSignSafeTransaction: mocks.mockOnSignSafeTransaction,
          onExecuteSafeTransaction: mocks.mockOnExecuteSafeTransaction,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mocks.mockOnSubmitSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.mockSwitchChain).toHaveBeenCalledWith({ chainId: 314 });
    expect(mocks.mockGetSafeKit).toHaveBeenCalledWith(fixtureProvider, fixtureSafeAddress);
    expect(mocks.mockEncodeFunctionData).toHaveBeenCalledWith({
      abi: expect.any(Array),
      functionName: 'addAllowance',
      args: [transactionParams.address, BigInt(100 * 1_125_899_906_842_624)],
    });
    expect(mocks.mockSafeKit.createTransaction).toHaveBeenCalled();
    expect(mocks.mockOnSignSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.mockSafeKit.signTransaction).toHaveBeenCalled();
    expect(mocks.mockOnExecuteSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.mockSafeKit.executeTransaction).toHaveBeenCalled();
    expect(mocks.mockOnSubmitSafeTransactionSuccess).toHaveBeenCalledWith(
      fixtureExecuteTransactionResponse,
      fixtureReceiptResponse,
    );
    expect(result.current.txHash).toBe('0xabcdef123456789');
    expect(result.current.blockNumber).toBe(fixtureReceiptResponse.blockNumber);
  });
});
