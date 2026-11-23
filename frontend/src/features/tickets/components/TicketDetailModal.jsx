"use client";
import { useTicketDetails } from "../hooks/useTickets";
import { X, Clock, User, ShieldAlert } from "lucide-react";

export default function TicketDetailModal({ ticketId, onClose }) {
  const { data, isLoading } = useTicketDetails(ticketId);

  if (!ticketId) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Ticket Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">
              Loading details...
            </div>
          ) : data ? (
            <>
              {/* Ticket Info */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {data.ticket.category}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      data.ticket.priority === "URGENT"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {data.ticket.priority}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {data.ticket.subject}
                </h3>
                {/* XSS Safe Render */}
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                  {data.ticket.body}
                </p>
                <div className="text-xs text-slate-400 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Created: {new Date(data.ticket.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Audit Trail */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-2 text-emerald-600" />{" "}
                  Audit Trail
                </h4>
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                  {data.events.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      No changes recorded yet.
                    </p>
                  ) : (
                    data.events.map((event, idx) => (
                      <div
                        key={idx}
                        className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 z-10 ml-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        </div>
                        <div className="w-[calc(100%-3rem)] bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-xs font-bold text-slate-700">
                            Changed{" "}
                            <span className="text-sky-600">{event.field}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="line-through">
                              {event.oldValue || "None"}
                            </span>{" "}
                            &rarr;{" "}
                            <span className="font-semibold text-slate-800">
                              {event.newValue}
                            </span>
                          </p>
                          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-medium">
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" /> {event.actor}
                            </span>
                            <span>
                              {new Date(event.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-red-500">
              Failed to load ticket.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
