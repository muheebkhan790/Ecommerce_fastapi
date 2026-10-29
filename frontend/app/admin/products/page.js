"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { productsApi } from "../../../lib/api/products";
import { formatPrice, getProductImageUrl } from "../../../lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingSlug, setDeletingSlug] = useState(null);

  // Quick stock edit state: { slug, stock, saving }
  const [editingStockSlug, setEditingStockSlug] = useState(null);
  const [editingStockValue, setEditingStockValue] = useState("");
  const [stockUpdating, setStockUpdating] = useState(false);

  const limit = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll({ limit, page });
      setProducts(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStartEditStock = (product) => {
    setEditingStockSlug(product.slug);
    setEditingStockValue(String(product.stock_quantity ?? 0));
  };

  const handleCancelEditStock = () => {
    setEditingStockSlug(null);
    setEditingStockValue("");
  };

  const handleSaveStock = async (slug, title) => {
    const parsedStock = parseInt(editingStockValue, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setError("Please provide a valid stock quantity (0 or greater).");
      return;
    }

    setStockUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await productsApi.updateStock(slug, parsedStock);
      setProducts((prev) =>
        prev.map((p) =>
          p.slug === slug ? { ...p, stock_quantity: updated.stock_quantity } : p
        )
      );
      setSuccess(`Stock updated successfully for "${title}" (${updated.stock_quantity} in stock).`);
      setEditingStockSlug(null);
      setEditingStockValue("");
    } catch (err) {
      console.error("Failed to update stock:", err);
      setError(err.message || "Failed to update product stock");
    } finally {
      setStockUpdating(false);
    }
  };

  const handleDeleteProduct = async (slug, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setError(null);
    setSuccess(null);
    setDeletingSlug(slug);

    try {
      await productsApi.delete(slug);
      setSuccess(`Product "${title}" deleted successfully.`);
      await fetchProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      setError(err.message || "Failed to delete product");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Product Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your store's inventory and update live stock levels
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-4 sm:px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/30 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>+</span>
          <span>Add New Product</span>
        </Link>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
          <span>✓ {success}</span>
          <button onClick={() => setSuccess(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Table Card with Mobile-Responsive Layout */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
        {/* Desktop / Tablet Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Level (Update Option)</th>
                <th className="px-6 py-4">Categories</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                    No products added yet. Click "+ Add New Product" to get started.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const imgUrl = getProductImageUrl(p.image_url);
                  const isEditingStock = editingStockSlug === p.slug;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-slate-400">📦</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{p.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              /{p.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-6 py-4">
                        {isEditingStock ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={editingStockValue}
                              onChange={(e) => setEditingStockValue(e.target.value)}
                              className="w-20 px-2.5 py-1 text-xs font-bold rounded-lg border border-orange-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              disabled={stockUpdating}
                              onClick={() => handleSaveStock(p.slug, p.title)}
                              title="Save stock"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                            >
                              {stockUpdating ? "..." : "✓ Save"}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditStock}
                              title="Cancel"
                              className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {p.stock_quantity > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                {p.stock_quantity} in stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                Out of stock
                              </span>
                            )}

                            {/* Option for admin to update stock */}
                            <button
                              type="button"
                              onClick={() => handleStartEditStock(p)}
                              title="Update stock level"
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200 dark:border-orange-800 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span>✏️</span>
                              <span>Update Stock</span>
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {p.categories?.length > 0 ? (
                            p.categories.map((c) => (
                              <span
                                key={c.id || c.name}
                                className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                {c.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[10px]">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p.slug}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            Live ↗
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.slug, p.title)}
                            disabled={deletingSlug === p.slug}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-500/30 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {deletingSlug === p.slug ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {total > limit && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total: {total} items</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
