'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Ticket, Box, CalendarDays, LogOut, Hexagon } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;

  const navItems = [
    { name: 'Triage Queue', href: '/dashboard', icon: Ticket, roles: ['ADMIN', 'USER'] },
    { name: 'Resources', href: '/dashboard/resources', icon: Box, roles: ['ADMIN', 'USER'] },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: CalendarDays, roles: ['ADMIN', 'USER'] },
    { name: 'Admin Analytics', href: '/dashboard/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  ];

  return (
    <div className="min-h-screen flex bg-sky-50">
      {/* Sidebar - Light Green Theme */}
      <aside className="w-64 bg-green-500 text-white flex flex-col hidden md:flex shadow-lg z-10">
        <div className="h-20 flex items-center px-6 border-b border-green-400">
          <Hexagon className="w-8 h-8 text-yellow-300 mr-3 fill-yellow-300" />
          <span className="text-2xl font-extrabold tracking-tight">TriageSync</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            if (!item.roles.includes(user.role)) return null;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all font-semibold ${
                  isActive ? 'bg-sky-500 text-white shadow-md' : 'text-green-50 hover:bg-green-600 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-green-400">
          <div className="mb-4 bg-green-600 p-3 rounded-xl">
            <p className="text-sm font-bold text-white">{user.name}</p>
            <p className="text-xs text-yellow-300 font-bold tracking-wider">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-bold text-green-600 bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
           <span className="text-xl font-bold text-slate-800 md:hidden">TriageSync</span>
           <div className="hidden md:block text-sm font-bold text-slate-500 bg-sky-50 px-4 py-2 rounded-full border border-sky-100">
             Welcome back, <span className="text-sky-600">{user.name}</span>
           </div>
        </header>
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}