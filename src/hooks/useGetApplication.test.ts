import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useGetApplications } from '@/hooks/useGetApplications';
import { fetchApplications } from '@/lib/api';
import { createWrapper } from '@/test-utils';
import { DashboardTabs } from '@/components/dashboard/constants';

vi.mock('@/lib/api');

const mockFetchApplications = fetchApplications as Mock;

describe('useGetApplications', () => {
  const wrapper = createWrapper();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state correctly', () => {
    mockFetchApplications.mockResolvedValue({ applications: [], total: 0 });

    const { result } = renderHook(
      () =>
        useGetApplications({
          searchTerm: '',
          activeFilters: [],
          currentPage: 1,
          currentTab: DashboardTabs.NEW_APPLICATIONS,
        }),
      { wrapper },
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it('should fetch applications with correct parameters', async () => {
    const mockData = { applications: [], total: 0 };
    mockFetchApplications.mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        useGetApplications({
          searchTerm: 'test',
          activeFilters: ['filter1'],
          currentPage: 1,
          currentTab: DashboardTabs.NEW_APPLICATIONS,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchApplications).toHaveBeenCalledWith('test', ['filter1'], 1, 10);
    expect(result.current.data).toEqual(mockData);
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockFetchApplications.mockRejectedValue(error);

    const { result } = renderHook(
      () =>
        useGetApplications({
          searchTerm: 'test',
          activeFilters: ['filter1'],
          currentPage: 1,
          currentTab: DashboardTabs.NEW_APPLICATIONS,
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
  });
});
