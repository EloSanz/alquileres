import { useQuery } from '@tanstack/react-query';
import { useApi, checkAuthError } from '../contexts/ApiContext';

export interface ServiceCategory {
  id: number;
  name: string;
  label: string;
}

export const useServiceCategories = () => {
  const api = useApi();

  const query = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const response = await (api.api as any)['service-categories'].get();
      if (response.error) {
        if (checkAuthError(response.error)) throw new Error('Authentication required');
        throw new Error((response.error.value as any)?.message || 'Failed to fetch service categories');
      }
      return response.data.data as ServiceCategory[];
    },
    staleTime: Infinity,
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
  };
};
