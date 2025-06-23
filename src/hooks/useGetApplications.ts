import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchApplications } from '@/lib/api';
import { availableFilters, DashboardTabs, PAGE_SIZE } from '@/components/dashboard/constants';
import { useEffect } from 'react';

interface UseGetApplicationsProps {
  searchTerm: string;
  activeFilters: string[];
  currentPage: number;
  currentTab: DashboardTabs;
}

export function useGetApplications({
  searchTerm,
  activeFilters,
  currentPage,
  currentTab,
}: UseGetApplicationsProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      [DashboardTabs.COMPLETED_APPLICATIONS, DashboardTabs.NEW_APPLICATIONS].includes(currentTab)
    ) {
      queryClient.invalidateQueries({
        queryKey: ['applications'],
      });
    }

    return () => {
      queryClient.cancelQueries();
    };
  }, [
    currentTab,
    searchTerm,
    activeFilters,
    currentPage,
    queryClient.invalidateQueries,
    queryClient.cancelQueries,
  ]);

  return useQuery({
    queryKey: ['applications', searchTerm, activeFilters, currentPage],
    queryFn: () =>
      fetchApplications(
        searchTerm,
        activeFilters.length ? activeFilters : availableFilters[currentTab],
        currentPage,
        PAGE_SIZE,
      ),
    refetchInterval: 1 * 1000 * 60,
  });
}
