'use client';

import { useState } from 'react';
import StatsStrip from '@/features/tickets/components/StatsStrip';
import TicketTable from '@/features/tickets/components/TicketTable';
import { useTickets } from '@/features/tickets/hooks/useTickets';
import { Search, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function TriageQueuePage() {
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', q: '', page: 1 });
  
  const { data, isLoading } = useTickets(filters);

  const handleSearch = (e) => {
    setFilters({ ...filters, q: e.target.value, page: 1 });
  };

  const handleReImport = () => {
    toast.info('Re-Import Feed triggered (Simulation)');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Triage Queue</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and review incoming support tickets.</p>
        </div>
        <button 
          onClick={handleReImport}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 px-5 py-2.5 rounded-xl flex items-center font-bold transition-all shadow-sm"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Re-Import Feed
        </button>
      </div>

      <StatsStrip />

      {/* Dynamic Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search tickets (subject, body)..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-medium"
            onChange={handleSearch}
          />
        </div>

        <select 
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-sky-500 text-slate-700 font-medium"
          onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
        >
          <option value="">All Status</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
        </select>

        <select 
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-sky-500 text-slate-700 font-medium"
          onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
        >
          <option value="">All Categories</option>
          <option value="BILLING">BILLING</option>
          <option value="BUG">BUG</option>
          <option value="LOGIN">LOGIN</option>
        </select>
      </div>

      <TicketTable tickets={data?.data} isLoading={isLoading} />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button 
            disabled={filters.page === 1}
            onClick={() => setFilters({...filters, page: filters.page - 1})}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-50 text-slate-700 hover:bg-slate-50 font-bold shadow-sm transition-all"
          >
            Previous
          </button>
          <span className="px-5 py-2.5 bg-sky-50 text-sky-700 rounded-xl font-bold border border-sky-100">
            Page {data.page} of {data.totalPages}
          </span>
          <button 
            disabled={filters.page === data.totalPages}
            onClick={() => setFilters({...filters, page: filters.page + 1})}
            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-50 text-slate-700 hover:bg-slate-50 font-bold shadow-sm transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}