"use client";
import { useStats } from "../hooks/useTickets";
import { AlertCircle, CheckCircle2, TrendingUp, Ticket } from "lucide-react";

export default function StatsStrip() {
  const { data: stats, isLoading } = useStats();

  if (isLoading)
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-slate-200 animate-pulse rounded-2xl"
          ></div>
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Open Tickets
          </p>
          <p className="text-2xl font-extrabold text-slate-800">
            {stats?.byStatus?.OPEN || 0}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Reviewed
          </p>
          <p className="text-2xl font-extrabold text-slate-800">
            {stats?.reviewedCount || 0}
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Model Agreement
          </p>
          <p className="text-2xl font-extrabold text-slate-800">
            {stats?.modelAgreementRate || 0}%
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
          <Ticket className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Total Tickets
          </p>
          <p className="text-2xl font-extrabold text-slate-800">
            {Object.values(stats?.byStatus || {}).reduce((a, b) => a + b, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
