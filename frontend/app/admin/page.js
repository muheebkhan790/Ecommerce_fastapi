"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productsApi } from "../../lib/api/products";
import { categoriesApi } from "../../lib/api/categories";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [prodData, catData] = await Promise.all([
          productsApi.getAll({ limit: 1 }),
          categoriesApi.getAll(),
        ]);
        setStats({
          totalProducts: prodData.total || 0,
          totalCategories: Array.isArray(catData) ? catData.length : 0,
        });
      } catch (err) {
        console.error("Error loading admin stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="flex-1 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor your store metrics and manage database records
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Products
            </span>
            <span className="text-2xl">📦</span>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : stats.totalProducts}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
            >
              View all products →
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Categories
            </span>
            <span className="text-2xl">🏷️</span>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-slate-900 dark:text-white">
              {loading ? "..." : stats.totalCategories}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/admin/categories"
              className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
            >
              Manage categories →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/products/new"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
              +
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Add New Product</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload product image & set inventory</p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              🏷
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Create Category</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add or remove product categories</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
