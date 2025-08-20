import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useMetaAllocatorTransaction } from './useMetaAllocatorTransaction';

import { createWrapper } from '@/test-utils';

const mocks = vi.hoisted(() => ({
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
  const mockConnector = {
    getProvider: vi.fn(),
  };
  const mockSwitchChain = vi.fn();
  const mockClient = {
    request: vi.fn(),
  };
  const mockSafeKit = {
    createTransaction: vi.fn(),
    signTransaction: vi.fn(),
    executeTransaction: vi.fn(),
  };
  const mockProvider = {};

  const mockOnSubmitSafeTransaction = vi.fn();
  const mockOnSubmitSafeTransactionSuccess = vi.fn();
  const mockOnSubmitSafeTransactionError = vi.fn();
  const mockOnConvertingAddress = vi.fn();
  const mockOnSignSafeTransaction = vi.fn();
  const mockOnExecuteSafeTransaction = vi.fn();

  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mockUseAccountWagmi.mockReturnValue({
      connector: mockConnector,
    });

    mocks.mockUseSwitchChain.mockReturnValue({
      chains: [{ id: 314 }],
      switchChain: mockSwitchChain,
    });

    mocks.mockUseFilecoinPublicClient.mockReturnValue(mockClient);

    mockConnector.getProvider.mockResolvedValue(mockProvider);
    mocks.mockGetSafeKit.mockResolvedValue(mockSafeKit);
    mocks.mockIsFilecoinAddress.mockReturnValue(false);
    mocks.mockEncodeFunctionData.mockReturnValue('0x123456');

    mockSafeKit.createTransaction.mockResolvedValue({ id: 'safe-tx-123' });
    mockSafeKit.signTransaction.mockResolvedValue({ id: 'signed-tx-123' });
    mockSafeKit.executeTransaction.mockResolvedValue({
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
          onSubmitSafeTransaction: mockOnSubmitSafeTransaction,
          onSubmitSafeTransactionSuccess: mockOnSubmitSafeTransactionSuccess,
          onSubmitSafeTransactionError: mockOnSubmitSafeTransactionError,
          onConvertingAddress: mockOnConvertingAddress,
          onSignSafeTransaction: mockOnSignSafeTransaction,
          onExecuteSafeTransaction: mockOnExecuteSafeTransaction,
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
          onSubmitSafeTransaction: mockOnSubmitSafeTransaction,
          onSubmitSafeTransactionSuccess: mockOnSubmitSafeTransactionSuccess,
          onSignSafeTransaction: mockOnSignSafeTransaction,
          onExecuteSafeTransaction: mockOnExecuteSafeTransaction,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockOnSubmitSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 314 });
    expect(mocks.mockGetSafeKit).toHaveBeenCalledWith(mockProvider);
    expect(mocks.mockEncodeFunctionData).toHaveBeenCalledWith({
      abi: expect.any(Array),
      functionName: 'addAllowance',
      args: [transactionParams.address, BigInt(100 * 1_125_899_906_842_624)],
    });
    expect(mockSafeKit.createTransaction).toHaveBeenCalled();
    expect(mockOnSignSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mockSafeKit.signTransaction).toHaveBeenCalled();
    expect(mockOnExecuteSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mockSafeKit.executeTransaction).toHaveBeenCalled();
    expect(mockOnSubmitSafeTransactionSuccess).toHaveBeenCalledWith(
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

    mockClient.request
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
          onSubmitSafeTransaction: mockOnSubmitSafeTransaction,
          onSubmitSafeTransactionSuccess: mockOnSubmitSafeTransactionSuccess,
          onConvertingAddress: mockOnConvertingAddress,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockOnConvertingAddress).toHaveBeenCalledTimes(2);
    expect(mockClient.request).toHaveBeenCalledTimes(2);
    expect(mockClient.request).toHaveBeenNthCalledWith(1, {
      method: 'Filecoin.FilecoinAddressToEthAddress',
      params: ['f1abc123def456'],
    });
    expect(mockClient.request).toHaveBeenNthCalledWith(2, {
      method: 'Filecoin.FilecoinAddressToEthAddress',
      params: ['f1def456abc123'],
    });
    expect(mockOnSubmitSafeTransactionSuccess).toHaveBeenCalled();
  });

  it('should handle address conversion error', async () => {
    mocks.mockIsFilecoinAddress.mockReturnValueOnce(true);

    const conversionError = new Error('Conversion failed');
    mockClient.request.mockRejectedValue(conversionError);

    const transactionParams = {
      address: 'f1abc123def456',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mockOnSubmitSafeTransactionError,
          onConvertingAddress: mockOnConvertingAddress,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockOnConvertingAddress).toHaveBeenCalledTimes(1);
    expect(mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(conversionError);
    expect(mockSafeKit.createTransaction).not.toHaveBeenCalled();
  });

  it('should handle unknown conversion error', async () => {
    mocks.mockIsFilecoinAddress.mockReturnValueOnce(true);
    mockClient.request.mockRejectedValue('Unknown error');

    const transactionParams = {
      address: 'f1abc123def456',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mockOnSubmitSafeTransactionError,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockOnSubmitSafeTransactionError).toHaveBeenCalledWith('Unknown error');
  });

  it('should handle invalid address validation error', async () => {
    // Mock conversion that returns invalid address
    mocks.mockIsFilecoinAddress.mockReturnValueOnce(true);
    mockClient.request.mockResolvedValue('invalid-address'); // Not 42 chars or doesn't start with 0x

    const transactionParams = {
      address: 'f1abc123def456',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mockOnSubmitSafeTransactionError,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(
      new Error('Could not convert to Ethereum address.'),
    );
    expect(mockSafeKit.createTransaction).not.toHaveBeenCalled();
  });

  it('should handle safe transaction creation error', async () => {
    const transactionError = new Error('Transaction creation failed');
    mockSafeKit.createTransaction.mockRejectedValue(transactionError);

    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mockOnSubmitSafeTransactionError,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(transactionError);
    expect(result.current.txHash).toBe(null);
  });

  it('should handle safe transaction signing error', async () => {
    const signingError = new Error('Transaction signing failed');
    mockSafeKit.signTransaction.mockRejectedValue(signingError);

    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mockOnSubmitSafeTransactionError,
          onSignSafeTransaction: mockOnSignSafeTransaction,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockOnSignSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(signingError);
    expect(result.current.txHash).toBe(null);
  });

  it('should handle safe transaction execution error', async () => {
    const executionError = new Error('Transaction execution failed');
    mockSafeKit.executeTransaction.mockRejectedValue(executionError);

    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransactionError: mockOnSubmitSafeTransactionError,
          onExecuteSafeTransaction: mockOnExecuteSafeTransaction,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockOnExecuteSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mockOnSubmitSafeTransactionError).toHaveBeenCalledWith(executionError);
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

    mockSafeKit.executeTransaction.mockResolvedValue(fixtureExecuteTransactionResponse);

    const transactionParams = {
      address: '0x1234567890123456789012345678901234567890',
      datacap: 100,
      metaAllocatorContractAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}`,
    };

    const { result } = renderHook(
      () =>
        useMetaAllocatorTransaction({
          onSubmitSafeTransaction: mockOnSubmitSafeTransaction,
          onSubmitSafeTransactionSuccess: mockOnSubmitSafeTransactionSuccess,
          onSignSafeTransaction: mockOnSignSafeTransaction,
          onExecuteSafeTransaction: mockOnExecuteSafeTransaction,
        }),
      { wrapper },
    );

    await act(async () => {
      await result.current.submitSafeTransaction(transactionParams);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(mockOnSubmitSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mockSwitchChain).toHaveBeenCalledWith({ chainId: 314 });
    expect(mocks.mockGetSafeKit).toHaveBeenCalledWith(mockProvider);
    expect(mocks.mockEncodeFunctionData).toHaveBeenCalledWith({
      abi: expect.any(Array),
      functionName: 'addAllowance',
      args: [transactionParams.address, BigInt(100 * 1_125_899_906_842_624)],
    });
    expect(mockSafeKit.createTransaction).toHaveBeenCalled();
    expect(mockOnSignSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mockSafeKit.signTransaction).toHaveBeenCalled();
    expect(mockOnExecuteSafeTransaction).toHaveBeenCalledTimes(1);
    expect(mockSafeKit.executeTransaction).toHaveBeenCalled();
    expect(mockOnSubmitSafeTransactionSuccess).toHaveBeenCalledWith(
      fixtureExecuteTransactionResponse,
      fixtureReceiptResponse,
    );
    expect(result.current.txHash).toBe('0xabcdef123456789');
    expect(result.current.blockNumber).toBe(fixtureReceiptResponse.blockNumber);
  });
});
