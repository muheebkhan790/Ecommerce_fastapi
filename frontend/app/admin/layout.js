"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { accountApi } from "../../lib/api/account";

export default function AdminLayout({ children }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminError, setAdminError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Verify admin endpoint from backend
    accountApi
      .checkAdmin()
      .then(() => {
        setIsAdminVerified(true);
      })
      .catch((err) => {
        console.error("Admin verification failed:", err);
        setAdminError(err.message || "You do not have administrative permissions.");
      })
      .finally(() => setChecking(false));
  }, [user, authLoading, router]);

  if (authLoading || checking) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Verifying administrative credentials...</p>
      </main>
    );
  }

  if (adminError || !isAdminVerified) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl mb-4">
            🚫
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400 mb-6">
            {adminError || "You must be an administrator to access this area."}
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            ← Return to Storefront
          </Link>
        </div>
      </main>
    );
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Orders", href: "/admin/orders", icon: "📑" },
    { label: "Products", href: "/admin/products", icon: "📦" },
    { label: "Create Product", href: "/admin/products/new", icon: "➕" },
    { label: "Categories", href: "/admin/categories", icon: "🏷️" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row gap-8">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">★</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Admin Console
            </span>
          </div>
          <p className="text-[11px] text-amber-200/70 mt-1 truncate">
            {user?.email}
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-[#EA580C] text-white shadow-md shadow-orange-600/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/account"
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1.5 transition-colors font-medium"
          >
            ← Back to Account
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
