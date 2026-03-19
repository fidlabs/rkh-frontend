import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountContext, type AccountContextType } from '@/contexts/AccountContext';
import { useGetVerifierDataCap } from './useGetVerifierDataCap';

const mockCheckActorDataCap = vi.fn();

const mockAccountContext: AccountContextType = {
  account: null,
  selectedMetaAllocator: null,
  connectors: {},
  connect: vi.fn(),
  disconnect: vi.fn(),
  loadPersistedAccount: vi.fn(),
  signStateMessage: vi.fn(),
  proposeAddVerifier: vi.fn(),
  acceptVerifierProposal: vi.fn(),
  checkActorDataCap: mockCheckActorDataCap,
};

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(AccountContext.Provider, { value: mockAccountContext }, children),
    );
}

describe('useGetVerifierDataCap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch datacap for a given actorId', async () => {
    const mockData = { datacap: 1000, verifier: 'f01234' };
    mockCheckActorDataCap.mockResolvedValue(mockData);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useGetVerifierDataCap('f01234'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockCheckActorDataCap).toHaveBeenCalledWith('f01234');
  });

  it('should not fetch when actorId is empty', () => {
    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useGetVerifierDataCap(''), {
      wrapper,
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockCheckActorDataCap).not.toHaveBeenCalled();
  });

  it('should handle API errors', async () => {
    const apiError = new Error('Failed to fetch datacap');
    mockCheckActorDataCap.mockRejectedValue(apiError);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useGetVerifierDataCap('f09999'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(apiError);
  });

  it('should use the correct query key', async () => {
    mockCheckActorDataCap.mockResolvedValue({ datacap: 500, verifier: 'f05678' });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(AccountContext.Provider, { value: mockAccountContext }, children),
      );

    renderHook(() => useGetVerifierDataCap('f05678'), { wrapper });

    await waitFor(() => {
      const queryState = queryClient.getQueryState(['checkActorDataCap', 'f05678']);
      expect(queryState).toBeDefined();
    });
  });

  it('should throw when used outside AccountProvider', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    expect(() => {
      renderHook(() => useGetVerifierDataCap('f01234'), { wrapper });
    }).toThrow('useAccountRole must be used within an AccountProvider');
  });

  it('should pass additional query options via params', async () => {
    mockCheckActorDataCap.mockResolvedValue({ datacap: 200, verifier: 'f03333' });

    const wrapper = createTestWrapper();
    const { result } = renderHook(
      () =>
        useGetVerifierDataCap('f03333', {
          enabled: false,
        }),
      { wrapper },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockCheckActorDataCap).not.toHaveBeenCalled();
  });
});
