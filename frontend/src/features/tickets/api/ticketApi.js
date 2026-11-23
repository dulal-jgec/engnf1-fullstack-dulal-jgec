import { api } from '@/lib/api';

export const fetchTickets = async (filters) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.category) params.append('category', filters.category);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.q) params.append('q', filters.q);
  params.append('page', filters.page || 1);
  params.append('limit', '10');

  const response = await api.get(`/tickets?${params.toString()}`);
  return response.data;
};

export const fetchStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const updateTicket = async ({ id, data }) => {
  const response = await api.patch(`/tickets/${id}`, data, {
    headers: { 'X-Agent': 'admin@triagesync.test' }
  });
  return response.data;
};

export const fetchTicketDetails = async (id) => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};