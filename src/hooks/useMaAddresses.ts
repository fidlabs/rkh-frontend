import { useQuery } from '@tanstack/react-query';
import { MetaAllocator } from '@/types/ma';
import { MaAddressesResponse } from '@/types/ma';
import { fetchMaAddresses } from '@/lib/api';

export const useMaAddresses = () => {
  return useQuery<MaAddressesResponse, Error, MetaAllocator[]>({
    queryKey: ['ma-addresses'],
    queryFn: () => fetchMaAddresses(),
    select: response => response.data,
  });
};
