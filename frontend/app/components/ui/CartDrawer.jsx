"use client";

import { useCart } from "../../../context/CartContext";
import { formatPrice, getProductImageUrl } from "../../../lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const router = useRouter();
  const { isCartOpen, setIsCartOpen, cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
              🛒
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Your Shopping Cart
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {cartItems.length} {cartItems.length === 1 ? "unique item" : "unique items"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-3xl mb-3">
                🛍️
              </div>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Your cart is empty
              </p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Explore our catalog and discover high-grade products to add to your bag.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/30 transition-all cursor-pointer active:scale-95"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const imageUrl = getProductImageUrl(item.image_url);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg opacity-40">📦</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setIsCartOpen(false)}
                      className="text-sm font-semibold text-slate-900 dark:text-white truncate block hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 font-bold text-slate-800 dark:text-white min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={
                            typeof item.stock_quantity === "number" &&
                            item.quantity >= item.stock_quantity
                          }
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {typeof item.stock_quantity === "number" &&
                        item.quantity >= item.stock_quantity && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            (Max: {item.stock_quantity})
                          </span>
                        )}

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[11px] text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 ml-auto cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">Subtotal:</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Shipping & taxes calculated at checkout.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  router.push("/checkout");
                }}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 shadow-lg shadow-orange-600/30 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
