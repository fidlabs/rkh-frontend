import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useProposeRKHTransaction } from './useProposeRKHTransaction';
import { useAccount } from '@/hooks';
import { createWrapper } from '@/test-utils';

vi.mock('@/hooks');

const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockUseAccount = useAccount as Mock;

describe('useProposeRKHTransaction', () => {
  const mockProposeAddVerifier = vi.fn();
  const mockOnProposeTransaction = vi.fn();
  const mockOnProposeTransactionFailed = vi.fn();
  const mockOnProposeTransactionSuccess = vi.fn();
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAccount.mockReturnValue({
      proposeAddVerifier: mockProposeAddVerifier,
    });
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(
      () =>
        useProposeRKHTransaction({
          onProposeTransaction: mockOnProposeTransaction,
          onProposeTransactionFailed: mockOnProposeTransactionFailed,
          onProposeTransactionSuccess: mockOnProposeTransactionSuccess,
        }),
      { wrapper },
    );

    expect(result.current.isPending).toBe(false);
    expect(result.current.messageId).toBe(null);
    expect(typeof result.current.proposeTransaction).toBe('function');
  });

  it('should work without callback props', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useProposeRKHTransaction({}), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.messageId).toBe(null);
  });

  it('should handle successful transaction proposal', async () => {
    const mockMessageId = 'test-message-id-123';
    mockProposeAddVerifier.mockResolvedValue(mockMessageId);

    const { result } = renderHook(
      () =>
        useProposeRKHTransaction({
          onProposeTransaction: mockOnProposeTransaction,
          onProposeTransactionSuccess: mockOnProposeTransactionSuccess,
        }),
      { wrapper },
    );

    const transactionData = {
      address: 'test-address',
      datacap: 100,
    };

    let returnedMessageId: string | undefined;

    await act(async () => {
      returnedMessageId = await result.current.proposeTransaction(transactionData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockOnProposeTransaction).toHaveBeenCalledTimes(1);
    expect(mockProposeAddVerifier).toHaveBeenCalledWith('test-address', 100);
    expect(mockOnProposeTransactionSuccess).toHaveBeenCalledWith(mockMessageId);

    expect(result.current.isPending).toBe(false);
    expect(result.current.messageId).toBe(mockMessageId);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(returnedMessageId).toBe(mockMessageId);
  });

  it('should handle Error instance correctly', async () => {
    const errorMessage = 'Transaction failed';
    const error = new Error(errorMessage);
    mockProposeAddVerifier.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useProposeRKHTransaction({
          onProposeTransactionFailed: mockOnProposeTransactionFailed,
        }),
      { wrapper },
    );

    await act(async () => {
      try {
        await result.current.proposeTransaction({
          address: 'test-address',
          datacap: 100,
        });
      } catch (e) {}
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockOnProposeTransactionFailed).toHaveBeenCalledWith(error);
    expect(result.current.isPending).toBe(false);
    expect(result.current.messageId).toBe(null);
    expect(result.current.isSuccess).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Error proposing verifier:', error);
  });
});
