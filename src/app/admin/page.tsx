"use client";

import { FormEvent, useEffect, useState } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

interface DashboardStats {
  totalDonations: number;
  totalUsers: number;
  unreadMessages: number;
  recentActivities: Array<{
    id: string;
    action: string;
    time: string;
  }>;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalDonations: 0,
    totalUsers: 0,
    unreadMessages: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);

  const getApiUrl = (path: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl("/api/dashboard"), { cache: "no-store" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to load stats");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Dashboard Header */}
      <section className="rounded-3xl border border-body-color/10 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Admin Dashboard</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Church Financial Control Center</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Monitor donations, manage expenses, and keep your church accounts transparent with a modern, organized overview of all administrative actions.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latest update</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{new Date().toLocaleTimeString()}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active admins</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">1</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pending tasks</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{stats.unreadMessages}</p>
              </div>
            </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Donations</p>
            <p className="mt-4 text-4xl font-bold text-emerald-600">GHS {stats.totalDonations.toLocaleString()}</p>
            <p className="mt-3 text-sm text-slate-500">All church income from tithe, offerings, and thanksgiving gifts.</p>
          </div>
          <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Registered Users</p>
            <p className="mt-4 text-4xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="mt-3 text-sm text-slate-500">Members, volunteers, and visitors currently tracked.</p>
          </div>
          <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Unread Messages</p>
            <p className="mt-4 text-4xl font-bold text-sky-600">{stats.unreadMessages}</p>
            <p className="mt-3 text-sm text-slate-500">Contact form submissions waiting for a response.</p>
          </div>
          <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Quick Actions</p>
            <div className="mt-4 grid gap-3">
              <a href="/admin/payments" className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors">Payments & Expenses</a>
              <button
                onClick={() => window.location.href = '/admin/payments'}
                className="rounded-2xl border border-body-color/10 px-4 py-3 text-sm font-semibold text-slate-900 hover:border-primary hover:text-primary transition-colors"
              >
                Add Expense
              </button>
              <a href="/admin/emails" className="rounded-2xl border border-body-color/10 px-4 py-3 text-sm font-semibold text-slate-900 hover:border-primary hover:text-primary transition-colors">Review Messages</a>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-body-color/10 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
              <p className="mt-2 text-sm text-slate-500">Latest changes and administrative actions in your church dashboard.</p>
            </div>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-green-600">Live</span>
          </div>
          <div className="mt-6 space-y-4">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-800">{activity.action}</p>
                <p className="mt-1 text-xs text-slate-500">{activity.time}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-900">Need a quick reminder?</p>
            <p className="mt-2 text-sm text-slate-600">Use the expense and payments section to keep the balance accurate and track all financial activity in one place.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("krle_admin_auth") : null;
    if (saved === "true") setAuthenticated(true);
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("krle_admin_auth", "true");
      setAuthenticated(true);
      setError("");
      return;
    }
    setError("Invalid admin password. Please try again.");
  };

  if (authenticated) {
    return <AdminDashboard />;
  }

  return (
    <section className="relative z-10 py-24 md:py-28 lg:py-32">
      <div className="container">
        <div className="mx-auto max-w-xl rounded-3xl border border-body-color/10 bg-white p-8 shadow-three">
          <h1 className="mb-4 text-3xl font-bold text-dark">Admin Access</h1>
          <p className="mb-8 text-body-color">
            This area is reserved for administrators only. Enter the admin password to continue.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xs border border-body-color/10 bg-[#FCFCFC] px-4 py-3 text-body-color outline-none focus:border-primary"
                placeholder="Enter admin password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="rounded-xs bg-primary px-6 py-3 text-white transition hover:bg-primary/90"
            >
              Enter Admin Area
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminPage;
