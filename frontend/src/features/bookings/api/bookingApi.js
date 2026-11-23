import { api } from '@/lib/api';

export const createBooking = async (data) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const fetchMyBookings = async (status) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const response = await api.get(`/bookings/mine?${params.toString()}`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
};