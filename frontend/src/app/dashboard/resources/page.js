'use client';

import { useState } from 'react';
import { useResources } from '@/features/resources/hooks/useResources';
import BookingModal from '@/features/resources/components/BookingModal'; // Import the modal
import { Search, Loader2, Box, Users } from 'lucide-react';

export default function ResourcesPage() {
  const [filters, setFilters] = useState({ search: '', type: '' });
  const { data, isLoading } = useResources(filters);
  const [selectedResource, setSelectedResource] = useState(null); // State for modal

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Resources</h1>
          <p className="text-slate-500 font-medium mt-1">Find and book labs, rooms, and equipment.</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
          <input 
            type="text" placeholder="Search resources by name..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <select 
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:ring-2 focus:ring-sky-500 text-slate-700 font-medium"
          onChange={(e) => setFilters({...filters, type: e.target.value})}
        >
          <option value="">All Types</option>
          <option value="ROOM">ROOM</option>
          <option value="LAB">LAB</option>
          <option value="EQUIPMENT">EQUIPMENT</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin mx-auto text-sky-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((resource) => (
            <div key={resource.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                    <Box className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    resource.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {resource.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{resource.name}</h3>
                <p className="text-sm text-slate-500 font-medium mb-4">{resource.description || 'No description provided.'}</p>
                
                <div className="flex items-center justify-between text-sm font-bold text-slate-700 border-t border-slate-100 pt-4">
                  <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-600">{resource.type}</span>
                  <span className="flex items-center"><Users className="w-4 h-4 mr-1 text-slate-400" /> {resource.capacity}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 border-t border-slate-100">
                <button 
                  onClick={() => setSelectedResource(resource)}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 rounded-xl transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Render */}
      {selectedResource && (
        <BookingModal 
          resource={selectedResource} 
          onClose={() => setSelectedResource(null)} 
        />
      )}
    </div>
  );
}