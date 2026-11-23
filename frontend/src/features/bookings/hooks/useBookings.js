import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking, fetchMyBookings, cancelBooking } from '../api/bookingApi';
import { toast } from 'sonner';

export const useMyBookings = (status) => {
  return useQuery({
    queryKey: ['myBookings', status],
    queryFn: () => fetchMyBookings(status),
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      toast.success('Booking requested successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Booking failed.');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      toast.success('Booking cancelled.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Cancellation failed.');
    },
  });
};