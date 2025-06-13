import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useStateWaitMsg } from '@/hooks/useStateWaitMsg';
import { getStateWaitMsg } from '@/lib/glif-api';
import { createWrapper } from '@/test-utils';
import { ApiStateWaitMsgResponse } from '@/types/filecoin-client';

vi.mock('@/lib/glif-api');

const mockGetStateWaitMsg = getStateWaitMsg as Mock;
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('useStateWaitMsg', () => {
  const mockOnGetMessage = vi.fn();
  const mockOnGetMessageError = vi.fn();
  const mockOnGetMessageSuccess = vi.fn();
  const wrapper = createWrapper();

  const mockSuccessResponse: ApiStateWaitMsgResponse = {
    data: {
      Height: 12345,
      Message: { '/': 'test-cid' },
      Receipt: {
        EventsRoot: null,
        ExitCode: 0,
        GasUsed: 1000,
        Return: 'success',
      },
      ReturnDec: {
        Applied: true,
        Code: 0,
        Ret: 'success',
      },
      TipSet: [{ '/': 'tipset-cid' }],
    },
    error: '',
    success: true,
  };

  const mockFailureResponse: ApiStateWaitMsgResponse = {
    data: {
      Height: 12345,
      Message: { '/': 'test-cid' },
      Receipt: {
        EventsRoot: null,
        ExitCode: 1,
        GasUsed: 1000,
        Return: 'failed',
      },
      ReturnDec: {
        Applied: true,
        Code: 5,
        Ret: 'failed',
      },
      TipSet: [{ '/': 'tipset-cid' }],
    },
    error: '',
    success: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(
      () =>
        useStateWaitMsg({
          onGetMessage: mockOnGetMessage,
          onGetMessageError: mockOnGetMessageError,
          onGetMessageSuccess: mockOnGetMessageSuccess,
        }),
      { wrapper },
    );

    expect(result.current.isPending).toBe(false);
    expect(result.current.stateWaitMsg).toBe(null);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(typeof result.current.checkTransactionState).toBe('function');
  });

  it('should work without callback props', () => {
    const { result } = renderHook(() => useStateWaitMsg({}), { wrapper });

    expect(result.current.isPending).toBe(false);
    expect(result.current.stateWaitMsg).toBe(null);
  });

  it('should handle successful transaction check', async () => {
    mockGetStateWaitMsg.mockResolvedValue(mockSuccessResponse);

    const { result } = renderHook(
      () =>
        useStateWaitMsg({
          onGetMessage: mockOnGetMessage,
          onGetMessageSuccess: mockOnGetMessageSuccess,
        }),
      { wrapper },
    );

    const transactionCid = 'test-transaction-cid';
    let returnedResponse: ApiStateWaitMsgResponse | undefined;

    await act(async () => {
      returnedResponse = await result.current.checkTransactionState(transactionCid);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockOnGetMessage).toHaveBeenCalledTimes(1);
    expect(mockGetStateWaitMsg).toHaveBeenCalledWith(transactionCid);
    expect(mockOnGetMessageSuccess).toHaveBeenCalledWith(mockSuccessResponse);

    expect(result.current.isPending).toBe(false);
    expect(result.current.stateWaitMsg).toEqual(mockSuccessResponse.data);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(returnedResponse).toEqual(mockSuccessResponse);
  });

  it('should handle string response data', async () => {
    const mockSuccessResponse: ApiStateWaitMsgResponse = {
      data: 'string-response-data',
      error: '',
      success: true,
    };

    mockGetStateWaitMsg.mockResolvedValue(mockSuccessResponse);

    const { result } = renderHook(() => useStateWaitMsg({}), { wrapper });

    await act(async () => {
      await result.current.checkTransactionState('test-cid');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.stateWaitMsg).toBe('string-response-data');
  });

  it('should handle missing transaction CID', async () => {
    const { result } = renderHook(
      () =>
        useStateWaitMsg({
          onGetMessageError: mockOnGetMessageError,
        }),
      { wrapper },
    );

    await expect(result.current.checkTransactionState()).rejects.toThrow(
      'Transaction CID is required',
    );
  });

  it('should handle empty transaction CID in mutation', async () => {
    const { result } = renderHook(
      () =>
        useStateWaitMsg({
          onGetMessageError: mockOnGetMessageError,
        }),
      { wrapper },
    );

    await expect(result.current.checkTransactionState()).rejects.toThrow(
      'Transaction CID is required',
    );
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockGetStateWaitMsg.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useStateWaitMsg({
          onGetMessageError: mockOnGetMessageError,
        }),
      { wrapper },
    );

    await expect(result.current.checkTransactionState('test-cid')).rejects.toThrow('API Error');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockOnGetMessageError).toHaveBeenCalledWith(error);
    expect(result.current.isPending).toBe(false);
    expect(result.current.stateWaitMsg).toBe(null);
    expect(consoleSpy).toHaveBeenCalledWith('Error getting message:', error);
  });

  it('should handle transaction failure with error code', async () => {
    mockGetStateWaitMsg.mockResolvedValue(mockFailureResponse);

    const { result } = renderHook(
      () =>
        useStateWaitMsg({
          onGetMessageError: mockOnGetMessageError,
        }),
      { wrapper },
    );

    await expect(result.current.checkTransactionState('test-cid')).rejects.toThrow(
      'Error sending transaction. Please try again or contact support. Error code: 5',
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
