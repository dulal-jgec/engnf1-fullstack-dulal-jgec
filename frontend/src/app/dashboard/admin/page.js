'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminStats, fetchAllBookings, updateBookingStatus } from '@/features/admin/api/adminApi';
import { Loader2, CheckCircle, XCircle, Box } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['adminStats'], queryFn: fetchAdminStats });
  const { data: bookings, isLoading: bookingsLoading } = useQuery({ queryKey: ['adminBookings'], queryFn: fetchAllBookings });
  const [rejectNote, setRejectNote] = useState('');

  const statusMutation = useMutation({
    mutationFn: updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Booking status updated.');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Action failed')
  });

  const handleReject = (id) => {
    if (!rejectNote) return toast.error('Rejection note is required');
    statusMutation.mutate({ id, action: 'reject', note: rejectNote });
    setRejectNote('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Analytics</h1>
        <p className="text-slate-500 font-medium mt-1">System overview and booking approvals.</p>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-sky-500">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Resources</p>
            <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.activeResources}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-400">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Bookings</p>
            <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.bookingsByStatus?.PENDING || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Approved Bookings</p>
            <p className="text-4xl font-extrabold text-slate-800 mt-2">{stats.bookingsByStatus?.APPROVED || 0}</p>
          </div>
        </div>
      )}

      {/* Booking Approvals Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Booking Approvals</h2>
        </div>
        {bookingsLoading ? (
          <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-500" /></div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings?.data?.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800">{b.purpose}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {new Date(b.startTime).toLocaleString()} <br/> to {new Date(b.endTime).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      b.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {b.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => statusMutation.mutate({ id: b.id, action: 'approve' })}
                          className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <div className="flex items-center">
                          <input 
                            type="text" 
                            placeholder="Note..." 
                            className="w-24 border border-slate-300 p-1.5 rounded-l-lg text-xs"
                            onChange={(e) => setRejectNote(e.target.value)}
                          />
                          <button 
                            onClick={() => handleReject(b.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-r-lg"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}