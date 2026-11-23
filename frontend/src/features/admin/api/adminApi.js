import { api } from '@/lib/api';

export const fetchAdminStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const fetchAllBookings = async () => {
  const res = await api.get('/bookings');
  return res.data;
};

export const updateBookingStatus = async ({ id, action, note }) => {
  // action = 'approve' | 'reject'
  const payload = action === 'reject' ? { decisionNote: note } : {};
  const res = await api.patch(`/bookings/${id}/${action}`, payload);
  return res.data;
};