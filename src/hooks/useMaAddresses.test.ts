import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMaAddresses } from '@/hooks/useMaAddresses';
import { createWrapper } from '@/test-utils';

const mocks = vi.hoisted(() => ({
  mockFetchMaAddresses: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  fetchMaAddresses: mocks.mockFetchMaAddresses,
}));

describe('useMaAddresses', () => {
  const wrapper = createWrapper();

  afterEach(() => {
    vi.clearAllMocks();

    mocks.mockFetchMaAddresses.mockResolvedValue({
      data: [],
      message: '',
      status: '',
    });
  });

  it('should return loading state when fetching', () => {
    const { result } = renderHook(() => useMaAddresses(), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should return empty array when no data is fetched', async () => {
    const { result } = renderHook(() => useMaAddresses(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('should return data when fetched', async () => {
    const { result } = renderHook(() => useMaAddresses(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mocks.mockFetchMaAddresses).toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mocks.mockFetchMaAddresses.mockRejectedValue(error);

    const { result } = renderHook(() => useMaAddresses(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});
