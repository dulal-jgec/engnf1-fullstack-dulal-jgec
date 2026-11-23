'use client';
import { useState } from 'react';
import { useMyBookings, useCancelBooking } from '@/features/bookings/hooks/useBookings';
import { Loader2, Calendar, Clock, XCircle } from 'lucide-react';

export default function MyBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = useMyBookings(statusFilter);
  const cancelMutation = useCancelBooking();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Bookings</h1>
          <p className="text-slate-500 font-medium mt-1">View and manage your resource reservations.</p>
        </div>
        <select 
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-sky-500 text-slate-700 font-bold"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-sky-500" /></div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-500 font-medium">
          No bookings found.
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.data?.map((booking) => (
            <div key={booking.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{booking.purpose}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm font-medium text-slate-600">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-sky-500"/> {new Date(booking.startTime).toLocaleDateString()}</span>
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-sky-500"/> {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider w-full md:w-auto text-center ${
                  booking.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  booking.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {booking.status}
                </span>
                {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                  <button 
                    onClick={() => cancelMutation.mutate(booking.id)}
                    disabled={cancelMutation.isPending}
                    className="flex items-center text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors w-full md:w-auto justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}