"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { productsApi } from "../../../lib/api/products";
import { formatPrice, getProductImageUrl } from "../../../lib/utils";
import { useCart } from "../../../context/CartContext";
import ImageLightbox from "../../components/ui/ImageLightbox";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [heartPulsing, setHeartPulsing] = useState(false);

  const { addToCart, toggleWishlist, isWishlisted, setIsCartOpen, cartItems } = useCart();

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const data = await productsApi.getBySlug(slug);
      setProduct(data);
      setSelectedImageIndex(0);
    } catch (err) {
      console.error("Error fetching product by slug:", err);
      setError(err.message || "Product not found");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="h-96 rounded-3xl skeleton-shimmer" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 skeleton-shimmer rounded-xl" />
            <div className="h-6 w-1/4 skeleton-shimmer rounded-lg" />
            <div className="h-32 w-full skeleton-shimmer rounded-xl mt-6" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center text-2xl mb-4 border border-rose-200 dark:border-rose-800">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">{error || "The requested item does not exist."}</p>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-xs shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
          >
            ← Back to Catalog
          </button>
        </div>
      </main>
    );
  }

  const { id, title, description, price, stock_quantity = 0, categories = [], image_url, images = [] } = product;

  // Prepare images list
  const allImages = Array.isArray(images) && images.length > 0 ? images : (image_url ? [image_url] : []);
  const activeImageRaw = allImages[selectedImageIndex] || image_url;
  const fullImageUrl = getProductImageUrl(activeImageRaw);

  const wishlisted = isWishlisted(id);
  const originalPrice = price ? price * 1.15 : 0;

  // Stock calculations
  const inCartItem = cartItems.find((item) => item.id === id);
  const inCartQty = inCartItem?.quantity || 0;
  const isOutOfStock = stock_quantity <= 0;
  const remainingStock = Math.max(0, stock_quantity - inCartQty);
  const isMaxInCart = stock_quantity > 0 && inCartQty >= stock_quantity;

  const handleHeartClick = () => {
    setHeartPulsing(true);
    toggleWishlist(product);
    setTimeout(() => setHeartPulsing(false), 400);
  };

  const handleAddToCart = () => {
    if (isOutOfStock || isMaxInCart) return;
    const addQty = Math.min(quantity, remainingStock);
    if (addQty > 0) {
      addToCart(product, addQty);
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock || isMaxInCart) return;
    const addQty = Math.min(quantity, remainingStock);
    if (addQty > 0) {
      addToCart(product, addQty);
      setIsCartOpen(true);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-orange-600 dark:hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-orange-600 dark:hover:text-white transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-orange-600 dark:text-orange-400 font-bold truncate max-w-[240px]">{title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Product Media Column with Multiple Images & Lightbox */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl p-6 space-y-4">
          {/* Main Display Stage */}
          <div
            onClick={() => setLightboxOpen(true)}
            role="button"
            tabIndex={0}
            title="Click to view image on screen"
            className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center group cursor-pointer"
          >
            {fullImageUrl ? (
              <img
                src={fullImageUrl}
                alt={title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="text-center text-slate-400 dark:text-slate-600">
                <svg className="w-20 h-20 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-medium">No product image uploaded</p>
              </div>
            )}

            {/* Click to open on screen badge */}
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-black/75 backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-1.5">
                <span>🔍</span>
                <span>Click to View on Screen</span>
              </span>
            </div>

            {/* Sale Badge */}
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 shadow-xs">
              SAVE 15%
            </span>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleHeartClick();
              }}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer z-10 ${
                wishlisted
                  ? "bg-rose-50 text-rose-500 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800 scale-105"
                  : "bg-white text-slate-400 hover:text-rose-500 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
              } ${heartPulsing ? "animate-heart-pop" : "active:scale-75"}`}
            >
              <svg
                className={`w-5 h-5 ${wishlisted ? "fill-current" : "fill-none stroke-current"}`}
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Multiple Images Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Product Views ({allImages.length} images)
              </span>
              <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                {allImages.map((img, idx) => {
                  const thumb = getProductImageUrl(img);
                  const isSelected = idx === selectedImageIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 bg-slate-50 dark:bg-slate-950 ${
                        isSelected
                          ? "border-orange-500 scale-105 shadow-md shadow-orange-500/25 ring-2 ring-orange-500/20"
                          : "border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={thumb} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="space-y-6">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <span
                  key={c.id || c.name}
                  className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {title}
          </h1>

          {/* Ratings */}
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400 text-sm">
              {"★".repeat(5)}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              4.9
            </span>
            <span className="text-xs text-slate-400">
              • Verified Customer Choice
            </span>
          </div>

          {/* Pricing & Stock Indicator */}
          <div className="flex items-center gap-5 py-4 border-y border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#EA580C] dark:text-orange-400">
                  {formatPrice(price)}
                </span>
                {price > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              {stock_quantity > 0 ? (
                <div className="space-y-0.5">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({stock_quantity} available)
                  </span>
                  {inCartQty > 0 && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                      ({inCartQty} currently in your cart)
                    </p>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              About this item
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              {description || "No description provided for this product."}
            </p>
          </div>

          {/* Quantity selector (Clamped to remaining available stock) */}
          {stock_quantity > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isMaxInCart}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-slate-900 dark:text-white min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isMaxInCart || quantity >= remainingStock}
                    onClick={() => setQuantity((q) => Math.min(remainingStock, q + 1))}
                    className="px-3.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {isMaxInCart && (
                  <span className="text-xs font-semibold text-rose-500">
                    Maximum available stock in your cart!
                  </span>
                )}
              </div>
              {remainingStock > 0 && inCartQty > 0 && (
                <p className="text-[11px] text-slate-400">
                  You can add up to {remainingStock} more before reaching the stock limit.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isOutOfStock || isMaxInCart}
                onClick={handleAddToCart}
                className="py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed shadow-md shadow-orange-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>🛒</span>
                <span>
                  {isOutOfStock
                    ? "Out of Stock"
                    : isMaxInCart
                    ? "Max in Cart"
                    : "Add to Cart"}
                </span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock || isMaxInCart}
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-2xl font-bold text-sm text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 border border-slate-200 dark:border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>⚡</span>
                <span>Buy Now</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => router.push("/products")}
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              ← Back to Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal on Screen */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={allImages}
        initialIndex={selectedImageIndex}
        title={title}
      />
    </main>
  );
}
