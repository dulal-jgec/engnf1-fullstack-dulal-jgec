"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { LogIn, Loader2, User, ShieldCheck } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message || "Invalid credentials",
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill Functions
  const fillAdmin = () => {
    setEmail("admin@triagesync.test");
    setPassword("Admin@123");
    toast.info("Admin credentials filled!");
  };

  const fillUser = () => {
    setEmail("user@triagesync.test");
    setPassword("User@123");
    toast.info("User credentials filled!");
  };

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 border border-white">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          TriageSync
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Sign in to manage your tickets
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all bg-slate-50 focus:bg-white"
            placeholder="admin@triagesync.test"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            className="block w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all bg-slate-50 focus:bg-white"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-200 disabled:opacity-50 transition-all mt-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Auto-Fill Section */}
      <div className="mt-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
          Quick Fill Credentials
        </p>
        <div className="flex gap-3">
          <button
            onClick={fillAdmin}
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors text-sm font-semibold"
          >
            <User className="w-4 h-4" /> Admin
          </button>
          <button
            onClick={fillUser}
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-semibold"
          >
            <User className="w-4 h-4" /> User
          </button>
        </div>
      </div>
    </div>
  );
}
