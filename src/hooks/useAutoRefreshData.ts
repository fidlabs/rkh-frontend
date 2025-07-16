import { Application } from '@/types/application';
import { useState, useEffect, useCallback } from 'react';

export function useAutoRefreshData(
  fetchFunction: () => Promise<{
    applications: Application[];
    totalCount: number;
  }>,
  refreshInterval: number,
) {
  const [data, setData] = useState<{
    applications: Application[];
    totalCount: number;
  }>({ applications: [], totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchFunction();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [loadData, refreshInterval]);

  return { ...data, isLoading, error, refetch: loadData };
}
