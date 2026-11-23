"use client";
import { useState } from "react";
import { useUpdateTicket } from "../hooks/useTickets";
import TicketDetailModal from "./TicketDetailModal";
import { Loader2 } from "lucide-react";

export default function TicketTable({ tickets, isLoading }) {
  const updateMutation = useUpdateTicket();
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  if (isLoading)
    return (
      <div className="text-center py-20">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-sky-500" />
      </div>
    );

  if (!tickets?.length)
    return (
      <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200 font-medium">
        No tickets found matching your filters.
      </div>
    );

  const handleCategoryChange = (id, newCategory) => {
    updateMutation.mutate({ id, data: { category: newCategory } });
  };

  const handleStatusChange = (id, newStatus) => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200 tracking-wider">
            <tr>
              <th className="px-6 py-4">Ticket Info</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-sky-50/50 transition-colors cursor-pointer"
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-800 text-base">
                    {ticket.subject}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate max-w-xs font-medium">
                    {ticket.body}
                  </div>
                  {ticket.isHumanOverride && (
                    <span className="inline-block mt-2 text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                      Human Override
                    </span>
                  )}
                </td>

                {/* Stop propagation jate dropdown e click korle modal na khule */}
                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={ticket.category}
                    onChange={(e) =>
                      handleCategoryChange(ticket.id, e.target.value)
                    }
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer"
                  >
                    <option value="BILLING">BILLING</option>
                    <option value="BUG">BUG</option>
                    <option value="FEATURE_REQUEST">FEATURE</option>
                    <option value="LOGIN">LOGIN</option>
                    <option value="DELIVERY">DELIVERY</option>
                  </select>
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wide uppercase ${
                      ticket.priority === "URGENT"
                        ? "bg-red-100 text-red-700"
                        : ticket.priority === "HIGH"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-sky-100 text-sky-700"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>

                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      handleStatusChange(ticket.id, e.target.value)
                    }
                    className={`font-bold rounded-lg p-2 text-sm border focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer transition-all ${
                      ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : ticket.status === "IN_PROGRESS"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
        />
      )}
    </>
  );
}
