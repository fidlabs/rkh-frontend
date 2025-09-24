import { useQuery } from '@tanstack/react-query';
import { getRefreshes } from '@/lib/api';
import { PAGE_SIZE } from '@/components/dashboard/constants';
import { Refresh } from '@/types/refresh';

interface UseGetRefreshesResponse {
  data: {
    pagination: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
    };
    results: Refresh[];
  };
  message: string;
  status: string;
}

interface UseGetRefreshesProps {
  searchTerm: string;
  currentPage: number;
  activeFilters: string[];
}

export function useGetRefreshes({ searchTerm, currentPage, activeFilters }: UseGetRefreshesProps) {
  return useQuery<UseGetRefreshesResponse>({
    queryKey: ['refreshes', searchTerm, currentPage, activeFilters],
    queryFn: () => getRefreshes(searchTerm, currentPage, PAGE_SIZE, activeFilters),
    refetchInterval: 1 * 1000 * 60,
  });
}
