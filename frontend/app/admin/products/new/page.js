"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { productsApi } from "../../../../lib/api/products";
import { categoriesApi } from "../../../../lib/api/categories";

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("10");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  // 1 mandatory primary image
  const [primaryImageFile, setPrimaryImageFile] = useState(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState(null);

  // Optional additional images
  const [additionalImages, setAdditionalImages] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryImageFile(file);
      setPrimaryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      setAdditionalImages((prev) => [...prev, ...newItems]);
    }
    // reset input
    e.target.value = "";
  };

  const removeAdditionalImage = (id) => {
    setAdditionalImages((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleCategory = (catId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Please provide a valid price greater than 0.");
      return;
    }

    const parsedStock = parseInt(stockQuantity, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setError("Please provide a valid stock quantity (0 or more).");
      return;
    }

    // One image for product is mandatory
    if (!primaryImageFile) {
      setError("One primary image is mandatory for every product. Please upload a primary image.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      formData.append("price", String(parsedPrice));
      formData.append("stock_quantity", String(parsedStock));

      selectedCategoryIds.forEach((catId) => {
        formData.append("category_ids", String(catId));
      });

      // Mandatory primary image
      formData.append("image_url", primaryImageFile);

      // Optional additional images
      additionalImages.forEach((item) => {
        formData.append("additional_images", item.file);
      });

      await productsApi.create(formData);
      router.push("/admin/products");
    } catch (err) {
      console.error("Create product failed:", err);
      setError(err.message || "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create New Product
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Add a new item to your store's inventory with primary and gallery images
          </p>
        </div>

        <Link
          href="/admin/products"
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold transition-colors"
        >
          ← Cancel
        </Link>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Product Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide key details, specifications, and features..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
          />
        </div>

        {/* Price and Stock row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Price (USD $) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="99.99"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Initial Stock Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="10"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Categories selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Categories
          </label>
          {categories.length === 0 ? (
            <p className="text-xs text-slate-500">
              No categories exist yet. You can create categories in the{" "}
              <Link href="/admin/categories" className="text-orange-600 dark:text-orange-400 underline">
                Category Manager
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const isSelected = selectedCategoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#EA580C] text-white border-orange-500 shadow-sm shadow-orange-600/30"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* MANDATORY Primary Image Upload */}
        <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-slate-950 border border-orange-200/60 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Primary Image <span className="text-rose-500 font-extrabold">* (Mandatory)</span>
            </label>
            <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
              Required for storefront display
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {primaryImagePreview ? (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-orange-500 shrink-0">
                <img
                  src={primaryImagePreview}
                  alt="Primary Preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-600 text-white">
                  MAIN
                </span>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-orange-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 text-xs shrink-0">
                <span className="text-2xl mb-1">📸</span>
                <span>Main Image</span>
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left flex-1">
              <input
                type="file"
                required
                accept="image/*"
                onChange={handlePrimaryImageChange}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#EA580C] file:text-white hover:file:bg-[#C2410C] cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Upload the main product photo (PNG, JPG, WebP). 1 image is mandatory.
              </p>
            </div>
          </div>
        </div>

        {/* OPTIONAL Additional Images Upload */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Additional Images <span className="text-slate-400 font-normal">(Optional Gallery)</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {additionalImages.length} additional image(s) selected
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Optional: Select multiple photos for additional angles, colors, and close-up views.
            </p>

            {additionalImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {additionalImages.map((img) => (
                  <div
                    key={img.id}
                    className="group relative w-full aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <img
                      src={img.preview}
                      alt="Additional view"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(img.id)}
                      title="Remove image"
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-600/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Product...</span>
              </>
            ) : (
              <span>Create Product</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
