"use client";

import { useEffect, useState } from "react";
import { categoriesApi } from "../../../lib/api/categories";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      await categoriesApi.create({ name: newCategoryName.trim() });
      setSuccess(`Category "${newCategoryName}" created successfully!`);
      setNewCategoryName("");
      await fetchCategories();
    } catch (err) {
      console.error("Create category error:", err);
      setError(err.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    setError(null);
    setSuccess(null);
    setDeletingId(id);

    try {
      await categoriesApi.delete(id);
      setSuccess(`Category "${name}" deleted.`);
      await fetchCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      setError(err.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Category Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Add new product categories or delete existing ones
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          {success}
        </div>
      )}

      {/* Create Category Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Add New Category
        </h2>
        <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Smart Watches, Audio, Accessories"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-600/30 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            {submitting ? "Adding..." : "+ Add Category"}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Existing Categories ({categories.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No categories created yet. Use the form above to add your first category.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-400">
                    #{cat.id}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {cat.name}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  disabled={deletingId === cat.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-600/80 border border-rose-500/30 transition-all disabled:opacity-50"
                >
                  {deletingId === cat.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
