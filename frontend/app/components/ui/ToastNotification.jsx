"use client";

import { useCart } from "../../../context/CartContext";

export default function ToastNotification() {
  const { toast, hideToast } = useCart();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-orange-500/10 dark:shadow-black/50 text-slate-800 dark:text-slate-100">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
            toast.type === "wishlist"
              ? "bg-rose-500/15 text-rose-500"
              : toast.type === "info"
              ? "bg-blue-500/15 text-blue-500"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {toast.type === "wishlist" ? "❤️" : toast.type === "info" ? "ℹ️" : "✓"}
        </div>
        <div className="text-xs font-medium leading-snug flex-1">
          {toast.message}
        </div>
        <button
          onClick={hideToast}
          aria-label="Close notification"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
