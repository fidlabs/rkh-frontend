import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useApproveRKHTransaction } from './useApproveRKHTransaction';
import { useAccount } from '@/hooks';
import { createWrapper } from '@/test-utils';

vi.mock('@/hooks');

const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const mockUseAccount = useAccount as Mock;

describe('useApproveRKHTransaction', () => {
  const mockAcceptVerifierProposal = vi.fn();
  const mockOnApproveTransaction = vi.fn();
  const mockOnApproveTransactionFailed = vi.fn();
  const mockOnApproveTransactionSuccess = vi.fn();
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseAccount.mockReturnValue({
      acceptVerifierProposal: mockAcceptVerifierProposal,
    });
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(
      () =>
        useApproveRKHTransaction({
          onApproveTransaction: mockOnApproveTransaction,
          onApproveTransactionFailed: mockOnApproveTransactionFailed,
          onApproveTransactionSuccess: mockOnApproveTransactionSuccess,
        }),
      { wrapper },
    );

    expect(result.current.isPending).toBe(false);
    expect(result.current.messageId).toBe(null);
    expect(typeof result.current.approveTransaction).toBe('function');
  });

  it('should work without callback props', () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useApproveRKHTransaction({}), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.messageId).toBe(null);
  });

  it('should handle successful transaction approval', async () => {
    const mockMessageId = 'test-message-id-456';
    mockAcceptVerifierProposal.mockResolvedValue(mockMessageId);

    const { result } = renderHook(
      () =>
        useApproveRKHTransaction({
          onApproveTransaction: mockOnApproveTransaction,
          onApproveTransactionSuccess: mockOnApproveTransactionSuccess,
        }),
      { wrapper },
    );

    const transactionData = {
      address: 'test-address',
      datacap: 100,
      fromAccount: 'test-from-account',
      transactionId: 123,
    };

    let returnedMessageId: string | undefined;

    await act(async () => {
      returnedMessageId = await result.current.approveTransaction(transactionData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockOnApproveTransaction).toHaveBeenCalledTimes(1);
    expect(mockAcceptVerifierProposal).toHaveBeenCalledWith(
      'test-address',
      100,
      'test-from-account',
      123,
    );
    expect(mockOnApproveTransactionSuccess).toHaveBeenCalledWith(mockMessageId);

    expect(result.current.isPending).toBe(false);
    expect(result.current.messageId).toBe(mockMessageId);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(returnedMessageId).toBe(mockMessageId);
  });

  it('should handle Error instance correctly', async () => {
    const errorMessage = 'Transaction failed';
    const error = new Error(errorMessage);
    mockAcceptVerifierProposal.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useApproveRKHTransaction({
          onApproveTransactionFailed: mockOnApproveTransactionFailed,
        }),
      { wrapper },
    );

    await act(async () => {
      try {
        await result.current.approveTransaction({
          address: 'test-address',
          datacap: 100,
          fromAccount: 'test-from-account',
          transactionId: 123,
        });
      } catch (e) {}
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockOnApproveTransactionFailed).toHaveBeenCalledWith(error);
    expect(result.current.isPending).toBe(false);
    expect(result.current.messageId).toBe(null);
    expect(result.current.isSuccess).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Error proposing verifier:', error);
  });
});
