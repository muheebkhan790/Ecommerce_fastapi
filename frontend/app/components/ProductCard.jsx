"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice, getProductImageUrl } from "../../lib/utils";
import { useCart } from "../../context/CartContext";
import ImageLightbox from "./ui/ImageLightbox";

export default function ProductCard({ product, isHomePage = false }) {
  const router = useRouter();
  const { id, title, price, image_url, slug, categories = [], stock_quantity, images = [] } = product;
  const fullImageUrl = getProductImageUrl(image_url);
  const { addToCart, toggleWishlist, isWishlisted, cartItems } = useCart();
  const [heartPulsing, setHeartPulsing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const wishlisted = isWishlisted(id);

  // Check if user already added max available stock into cart
  const inCartItem = cartItems.find((item) => item.id === id);
  const inCartQty = inCartItem?.quantity || 0;
  const isOutOfStock = typeof stock_quantity === "number" && stock_quantity <= 0;
  const isMaxInCart = typeof stock_quantity === "number" && stock_quantity > 0 && inCartQty >= stock_quantity;

  // Derive synthetic rating
  const ratingScore = (4.5 + ((id * 7) % 5) * 0.1).toFixed(1);
  const reviewCount = 18 + ((id * 13) % 45);
  const originalPrice = price ? price * 1.15 : 0;

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartPulsing(true);
    toggleWishlist(product);
    setTimeout(() => setHeartPulsing(false), 400);
  };

  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isHomePage) {
      // "when i click on image og product it open the product listing"
      router.push("/products");
    } else {
      // "and when i click on image in product listing or detail page it open the images on screen"
      setLightboxOpen(true);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Image list for lightbox: prioritize images array, fallback to image_url
  const allImages = Array.isArray(images) && images.length > 0 ? images : (image_url ? [image_url] : []);

  return (
    <>
      <div className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/40 p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-500/10 dark:hover:shadow-black/60 flex flex-col justify-between">
        <div>
          {/* Product Image Container with Click Navigation / Lightbox */}
          <div
            onClick={handleImageClick}
            role="button"
            tabIndex={0}
            title={isHomePage ? "Click to open product listing" : "Click to view image on screen"}
            className="relative w-full h-52 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 mb-3.5 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center cursor-pointer group/img"
          >
            {fullImageUrl ? (
              <img
                src={fullImageUrl}
                alt={title}
                className="w-full h-full object-cover group-hover/img:scale-108 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 text-slate-400 dark:text-slate-600">
                <svg className="w-10 h-10 mb-1 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[11px] font-medium">No Image</span>
              </div>
            )}

            {/* Hover Action Badge Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-black/70 backdrop-blur-sm border border-white/20 shadow-lg">
                {isHomePage ? "Browse Catalog →" : "🔍 View on Screen"}
              </span>
            </div>

            {/* Badges Overlay: Sale Badge & Stock Badge */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 shadow-xs backdrop-blur-xs">
                SALE -15%
              </span>

              {stock_quantity > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 backdrop-blur-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {stock_quantity} in stock
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={handleHeartClick}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer z-20 ${
                wishlisted
                  ? "bg-rose-50 text-rose-500 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-200 dark:border-rose-800 scale-105"
                  : "bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
              } ${heartPulsing ? "animate-heart-pop" : "active:scale-75"}`}
            >
              <svg
                className={`w-4 h-4 transition-colors ${wishlisted ? "fill-current" : "fill-none stroke-current"}`}
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

          {/* Categories Chips */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {categories.slice(0, 2).map((c) => (
                <span
                  key={c.id || c.name}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}

          {/* Product Title */}
          <Link href={`/products/${slug}`}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1 mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {title}
            </h3>
          </Link>

          {/* Star Ratings */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex items-center text-amber-400 text-xs">
              {"★".repeat(4)}
              <span className="text-amber-400/80">★</span>
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {ratingScore}
            </span>
            <span className="text-[11px] text-slate-400">
              ({reviewCount})
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-extrabold text-[#EA580C] dark:text-orange-400">
              {formatPrice(price)}
            </span>
            {price > 0 && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Details & Add to Cart */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            href={`/products/${slug}`}
            className="py-2 px-3 rounded-xl text-center text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95 border border-slate-200 dark:border-slate-700/60 block"
          >
            Details
          </Link>

          <button
            type="button"
            disabled={isOutOfStock || isMaxInCart}
            onClick={handleAddToCart}
            className="py-2 px-3 rounded-xl text-center text-xs font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] active:bg-[#9A3412] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs shadow-orange-600/30 transition-all duration-150 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>🛒</span>
            <span>
              {isOutOfStock ? "Out of Stock" : isMaxInCart ? "Max in Cart" : "Add"}
            </span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal on Screen */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={allImages}
        title={title}
      />
    </>
  );
}
