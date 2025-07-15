import { useQuery } from '@tanstack/react-query';
import { getRefreshes } from '@/lib/api';
import { PAGE_SIZE } from '@/components/dashboard/constants';
import { Refresh } from '@/types/application';

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
}

export function useGetRefreshes({ searchTerm, currentPage }: UseGetRefreshesProps) {
  return useQuery<UseGetRefreshesResponse>({
    queryKey: ['refreshes', searchTerm, currentPage],
    queryFn: () => getRefreshes(searchTerm, currentPage, PAGE_SIZE),
    refetchInterval: 1 * 1000 * 60,
  });
}
