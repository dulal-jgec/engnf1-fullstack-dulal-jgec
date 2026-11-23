import { api } from '@/lib/api';

export const fetchResources = async (filters) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.type) params.append('type', filters.type);
  
  const response = await api.get(`/resources?${params.toString()}`);
  return response.data;
};