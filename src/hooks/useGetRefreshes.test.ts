import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useGetRefreshes } from '@/hooks/useGetRefreshes';
import { getRefreshes } from '@/lib/api';
import { createWrapper } from '@/test-utils';

vi.mock('@/lib/api');

const mockGetRefreshes = getRefreshes as Mock;

describe('useGetRefreshes', () => {
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state correctly', () => {
    const mockData = {
      data: {
        pagination: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 0,
          totalPages: 0,
        },
        results: [],
      },
      message: 'Success',
      status: 'ok',
    };
    mockGetRefreshes.mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        useGetRefreshes({
          searchTerm: '',
          currentPage: 1,
          activeFilters: [],
        }),
      { wrapper },
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it('should fetch refreshes with correct parameters', async () => {
    const mockData = {
      data: {
        pagination: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 5,
          totalPages: 1,
        },
        results: [
          {
            _id: 'test-id',
            title: 'Test Refresh',
            creator: { name: 'test-user' },
          },
        ],
      },
      message: 'Success',
      status: 'ok',
    };
    mockGetRefreshes.mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        useGetRefreshes({
          searchTerm: 'test',
          currentPage: 2,
          activeFilters: [],
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetRefreshes).toHaveBeenCalledWith('test', 2, 10, []);
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockGetRefreshes.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useGetRefreshes({
          searchTerm: 'test',
          currentPage: 1,
          activeFilters: [],
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});
