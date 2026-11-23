import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTickets, fetchStats, updateTicket } from '../api/ticketApi';
import { toast } from 'sonner';

export const useTickets = (filters) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => fetchTickets(filters),
    keepPreviousData: true,
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });
};

// Instant Optimistic UI with Rollback
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTicket,
    // 1. OPTIMISTIC UPDATE
    onMutate: async (newTicketData) => {
      // Outgoing refetches cancel koro
      await queryClient.cancelQueries({ queryKey: ['tickets'] });

      // Previous data snapshot koro (rollback er jonno)
      const previousTickets = queryClient.getQueryData(['tickets']);

      // Sathe sathe UI update koro
      queryClient.setQueryData(['tickets'], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((ticket) =>
            ticket.id === newTicketData.id
              ? { ...ticket, ...newTicketData.data, isHumanOverride: true }
              : ticket
          ),
        };
      });

      return { previousTickets };
    },
    // 2. ROLLBACK ON ERROR
    onError: (err, newTicketData, context) => {
      if (context?.previousTickets) {
        queryClient.setQueryData(['tickets'], context.previousTickets);
      }
      toast.error(err.response?.data?.error?.message || 'Update failed. Rolled back.');
    },
    // 3. REFETCH TO ENSURE CONSISTENCY
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Ticket updated successfully');
    },
  });
};

export const useTicketDetails = (id) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicketDetails(id),
    enabled: !!id, // Jodi id thake tobei fetch korbe
  });
};