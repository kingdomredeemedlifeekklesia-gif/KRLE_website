"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ADMIN_PASSWORD = "admin123";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user has auth token in localStorage
    const isAuthenticated = localStorage.getItem("krle_admin_auth") === "true";
    setAuthenticated(isAuthenticated);
  }, []);

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "🏠" },
    { href: "/admin/emails", label: "Emails", icon: "📧" },
    { href: "/admin/community", label: "Community", icon: "👥" },
    { href: "/admin/gallery", label: "Gallery", icon: "🖼️" },
    { href: "/admin/payments", label: "Payments", icon: "💳" },
    { href: "/admin/expenses", label: "Expenses", icon: "💰" },
    { href: "/admin/records", label: "Records", icon: "📊" },
  ];

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("krle_admin_auth", "true");
      setAuthenticated(true);
      setError("");
      return;
    }
    setError("Invalid admin password. Please try again.");
  };

  const handleLogout = () => {
    localStorage.removeItem("krle_admin_auth");
    setAuthenticated(false);
    setPassword("");
    router.push("/");
  };

  // Temporarily disable authentication for easier access
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
              Admin Login
            </h1>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  placeholder="Enter admin password"
                />
              </div>
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 bg-primary text-white">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${pathname === item.href ? 'bg-primary text-white' : ''}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow">
          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-gray-700 dark:text-gray-200 font-medium">Welcome, Admin</span>
          </div>
          <div className="flex-1 lg:flex-none"></div>
          <div className="flex items-center space-x-4">
            <span className="lg:hidden text-gray-700 dark:text-gray-200 font-medium text-sm">Welcome, Admin</span>
            <button 
              onClick={handleLogout} 
              className="px-3 py-2 lg:px-4 lg:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm text-sm"
            >
              Logout
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;