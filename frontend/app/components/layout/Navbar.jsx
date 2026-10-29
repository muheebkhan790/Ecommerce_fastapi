"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const { cartCount, cartBump, setIsCartOpen, wishlist } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    await logout();
    router.push("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-40 w-full backdrop-blur-xl bg-white/95 dark:bg-slate-950/90 border-b border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-lg dark:shadow-black/20 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/25 group-hover:scale-105 group-active:scale-95 transition-all text-sm sm:text-base">
              ⚡
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              NEX<span className="text-orange-600 dark:text-orange-400">STORE</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className={`ml-1 px-3 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                }`}
              >
                ★ Admin Panel
              </Link>
            )}
          </nav>

          {/* Desktop Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative flex-1 max-w-xs xl:max-w-sm ml-2"
          >
            <span className="absolute left-3.5 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands..."
              className="w-full pl-10 pr-9 py-2 rounded-full text-xs bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-300"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </form>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Wishlist Indicator */}
            {wishlist.length > 0 && (
              <div
                title={`${wishlist.length} item(s) in wishlist`}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-semibold"
              >
                <span className="animate-pulse">❤️</span>
                <span>{wishlist.length}</span>
              </div>
            )}

            {/* Cart Button with animated count */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Open Cart"
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer active:scale-95"
            >
              <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline font-semibold">Cart</span>

              {/* Animated Cart Count Badge */}
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold text-white bg-orange-600 shadow-xs shadow-orange-600/40 transition-transform ${
                  cartBump ? "animate-cart-bump" : ""
                }`}
              >
                {cartCount}
              </span>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Auth section Desktop */}
            {loading ? (
              <div className="w-16 sm:w-20 h-8 bg-slate-200 dark:bg-slate-800/60 animate-pulse rounded-xl" />
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-xs">
                    {user?.email?.charAt(0) || "U"}
                  </div>
                  <span className="max-w-[100px] sm:max-w-[120px] truncate">
                    {user?.email}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Account</span>
                        {/* User ID displayed */}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                          ID: #{user?.id}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-200 truncate">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold">
                          ★ Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      👤 Account Overview
                    </Link>

                    <Link
                      href="/account/change-password"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      🔑 Change Password
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        ⚡ Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 shadow-md shadow-orange-600/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown Panel */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Show User ID in menu when open in mobile view */}
            {isAuthenticated && user && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 dark:from-slate-900 dark:to-slate-850 border border-orange-500/20 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-xs">
                      {user.email?.charAt(0) || "U"}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {user.email}
                    </span>
                  </div>

                  {/* PROMINENT USER ID DISPLAY IN MOBILE VIEW MENU */}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-orange-600 text-white shadow-sm flex items-center gap-1">
                    <span>User ID:</span>
                    <span>#{user.id}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Status: Active</span>
                  {isAdmin ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">★ Admin Role</span>
                  ) : (
                    <span className="text-slate-400">Customer</span>
                  )}
                </div>
              </div>
            )}

            {/* Mobile search bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
              <span className="absolute left-3 top-3 text-slate-400 pointer-events-none">
                🔍
              </span>
            </form>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                >
                  ★ Admin Dashboard
                </Link>
              )}
            </div>

            {/* Auth actions for mobile */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    👤 My Account
                  </Link>
                  <Link
                    href="/account/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    🔑 Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-center rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-center rounded-xl text-xs font-semibold bg-orange-600 text-white shadow-md shadow-orange-600/30"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
