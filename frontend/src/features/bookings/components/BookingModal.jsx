"use client";
import { useState } from "react";
import { useCreateBooking } from "@/features/bookings/hooks/useBookings";
import { X, Calendar, Clock, Loader2 } from "lucide-react";

export default function BookingModal({ resource, onClose }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:30");
  const [purpose, setPurpose] = useState("");
  const createMutation = useCreateBooking();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Combine date and time into ISO 8601 UTC string
    const startDateTime = new Date(`${date}T${startTime}:00Z`).toISOString();
    const endDateTime = new Date(`${date}T${endTime}:00Z`).toISOString();

    createMutation.mutate(
      {
        resourceId: resource.id,
        startTime: startDateTime,
        endTime: endDateTime,
        purpose,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-sky-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Book Resource</h2>
            <p className="text-sm font-medium text-sky-600 mt-1">
              {resource.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sky-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Start Time (UTC)
              </label>
              <div className="relative">
                <Clock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="time"
                  required
                  step="1800" // 30 min steps
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-2 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                End Time (UTC)
              </label>
              <div className="relative">
                <Clock className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="time"
                  required
                  step="1800"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-2 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Purpose
            </label>
            <textarea
              required
              rows="2"
              placeholder="Why do you need this resource?"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-medium resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-md flex justify-center items-center"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Confirm Booking"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
