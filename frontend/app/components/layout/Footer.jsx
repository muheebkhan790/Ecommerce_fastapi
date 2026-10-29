"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="mt-auto w-full border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info (2 cols wide on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                NEX<span className="text-orange-600 dark:text-orange-400">STORE</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Modern fullstack marketplace built with clean surfaces, warm orange highlights, high-concurrency FastAPI async engine, and Next.js 15.
            </p>

            {/* Newsletter input */}
            <div className="pt-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Stay In The Loop
              </span>
              {subscribed ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  ✓ Thanks for subscribing! Special offers are on the way.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all shrink-0 active:scale-95 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Storefront
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-orange-600 dark:hover:text-white transition-colors">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-orange-600 dark:hover:text-white transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/api-test" className="hover:text-orange-600 dark:hover:text-white transition-colors">
                  Diagnostics Test
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Account
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="hover:text-orange-600 dark:hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-orange-600 dark:hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-orange-600 dark:hover:text-white transition-colors">
                  Profile & Orders
                </Link>
              </li>
              <li>
                <Link href="/account/change-password" className="hover:text-orange-600 dark:hover:text-white transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors">
                  ★ Admin Console
                </Link>
              </li>
              <li>
                <Link href="/admin/products/new" className="hover:text-orange-600 dark:hover:text-white transition-colors">
                  Add New Product
                </Link>
              </li>
              <li>
                <Link href="/admin/categories" className="hover:text-orange-600 dark:hover:text-white transition-colors">
                  Categories
                </Link>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                FastAPI Async
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                Next.js 15
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                Tailwind v4
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} NEXSTORE Inc. Designed with Ronas IT clean surfaces & warm accents.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
