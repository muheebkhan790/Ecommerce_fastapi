"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CategoryFilter from "../components/CategoryFilter.jsx";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import Pagination from "../components/Pagination.jsx";
import { productsApi } from "../../lib/api/products";
import { categoriesApi } from "../../lib/api/categories";

function ProductsContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 9;

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    productsApi
      .getAll({
        category_names: selectedCategories,
        limit,
        page,
      })
      .then((data) => {
        let items = data.items || [];
        if (queryParam.trim()) {
          const lowerQ = queryParam.toLowerCase();
          items = items.filter(
            (p) =>
              p.title?.toLowerCase().includes(lowerQ) ||
              p.description?.toLowerCase().includes(lowerQ)
          );
        }
        setProducts(items);
        setTotal(queryParam.trim() ? items.length : data.total || 0);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setError("Unable to retrieve catalog products.");
      })
      .finally(() => setLoading(false));
  }, [selectedCategories, page, queryParam]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Marketplace Storefront
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
            {queryParam ? `Results for "${queryParam}"` : "All Products"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore our curated catalog with live category filtering, instant cart addition, and smooth pagination.
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
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl mb-3">
            🔍
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No products matched your search or filters
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search keywords or resetting the category filter to view all products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <Pagination page={page} setPage={setPage} total={total} limit={limit} />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
