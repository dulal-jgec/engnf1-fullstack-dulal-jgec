import { useQuery } from '@tanstack/react-query';
import { fetchResources } from '../api/resourceApi';

export const useResources = (filters) => {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => fetchResources(filters),
    keepPreviousData: true,
  });
};