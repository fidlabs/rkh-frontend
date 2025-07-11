import { useQuery } from '@tanstack/react-query';
import { fetchApplications } from '@/lib/api';
import { availableFilters, DashboardTabs, PAGE_SIZE } from '@/components/dashboard/constants';

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
