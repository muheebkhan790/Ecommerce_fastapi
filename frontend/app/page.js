"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import CategoryFilter from "./components/CategoryFilter.jsx";
import ProductCard from "./components/ProductCard.jsx";
import ProductCardSkeleton from "./components/ProductCardSkeleton.jsx";
import Pagination from "./components/Pagination.jsx";
import { productsApi } from "../lib/api/products";
import { categoriesApi } from "../lib/api/categories";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 6;

  // Load categories
  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll({
        category_names: selectedCategories,
        limit,
        page,
      });
      setProducts(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to fetch products from backend.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategories, page, limit]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-12">
      {/* Large Promotional Hero Section (Marketplace Concept by Ronas IT & 2026 Conversion Best Practices) */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 lg:p-14 shadow-sm dark:shadow-2xl">
        {/* Soft Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-96 h-96 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-amber-400/10 dark:bg-amber-400/10 blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Promo Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              🔥 2026 Collection • Limited Time Flash Deals
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Elevate Your Lifestyle with <br />
              <span className="gradient-warm-text">Premium Essentials.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Discover verified high-performance products with interactive light and dark modes, live category filtering, and instant FastAPI shopping cart.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#catalog"
                className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] shadow-lg shadow-orange-600/30 transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Catalog</span>
                <span className="text-base">↓</span>
              </a>
              <Link
                href="/products"
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                All Products ({total || "Storefront"})
              </Link>
            </div>
          </div>

          {/* Hero Right Visual Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800/80 dark:to-slate-900 border border-orange-200/60 dark:border-slate-700/80 p-6 shadow-md dark:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 shadow-xs">
                  ★ Deal of the Day
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Ends in 08:42:15
                </span>
              </div>

              <Link
                href="/products"
                title="Click image to open product listing"
                className="relative h-44 rounded-xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center mb-4 group cursor-pointer block"
              >
                {products[0]?.image_url ? (
                  <img
                    src={products[0].image_url}
                    alt={products[0]?.title || "Spotlight Product"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <span className="text-4xl mb-1">⚡</span>
                    <span className="text-xs font-semibold">Featured Selection</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-600 text-white shadow-xs">
                  HOT DEAL
                </div>
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-black/70 backdrop-blur-sm border border-white/20">
                    View Catalog Listing →
                  </span>
                </div>
              </Link>


              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {products[0]?.title || "Ultra Modern Smart Hardware"}
                </h3>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-2">
                      $129.00
                    </span>
                    <span className="text-xl font-black text-[#EA580C] dark:text-orange-400">
                      $89.00
                    </span>
                  </div>
                  <a
                    href="#catalog"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] active:scale-95 transition-all shadow-xs"
                  >
                    Claim Offer →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Conversion Trust Badges (Medium 2026 E-Commerce UI/UX Tips) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-slate-200/90 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg shrink-0">
              🚚
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Free Express Shipping</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">On all orders over $49</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
              🛡️
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">30-Day Guarantee</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Hassle-free money back</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
              🔒
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Secure FastAPI JWT</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Encrypted transactions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg shrink-0">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">24/7 Priority Care</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Dedicated support team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="catalog" className="space-y-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Featured Catalog
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live asynchronous queries backed by FastAPI <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-orange-600 dark:text-orange-400 font-mono">/api/products/</code>
            </p>
          </div>

          <CategoryFilter
            categories={categories}
            selected={selectedCategories}
            setSelected={(newSelected) => {
              setSelectedCategories(newSelected);
              setPage(1);
            }}
          />
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setPage(1)}
              className="text-xs font-semibold underline hover:text-rose-900 dark:hover:text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Skeleton Loaders while products load */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-2xl mb-3">
              📦
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No products found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are no products matching your selected category. Try selecting a different filter.
            </p>
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#EA580C] text-white hover:bg-[#C2410C] active:scale-95 transition-all cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isHomePage={true} />
            ))}
          </div>

        )}

        <Pagination page={page} setPage={setPage} total={total} limit={limit} />
      </section>
    </main>
  );
}
