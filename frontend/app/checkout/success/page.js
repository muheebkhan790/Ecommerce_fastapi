"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ordersApi } from "../../../lib/api/orders";
import { formatPrice, getProductImageUrl } from "../../../lib/utils";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await ordersApi.getByOrderNumber(orderNumber);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order receipt:", err);
        setError(err.message || "Could not retrieve order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Order Not Found
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {error || "We could not find an order matching this reference number."}
        </p>
        <Link
          href="/products"
          className="inline-flex px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/30 transition-all"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Success Hero */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-4xl shadow-inner border border-emerald-500/20">
          ✓
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
          Order Confirmed & Stored
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          We received your customer details and order information. A confirmation reference has been recorded in our database.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {/* Header Info Banner */}
        <div className="p-6 bg-slate-50/60 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              Order Number
            </div>
            <div className="text-base font-mono font-bold text-orange-600 dark:text-orange-400">
              {order.order_number}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              Date Placed
            </div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              Payment Status
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {order.payment_method === "cash_on_delivery" ? "Cash on Delivery" : "Card Processed"}
            </span>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">
              Total Amount
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {formatPrice(order.total_amount)}
            </div>
          </div>
        </div>

        {/* Customer & Shipping Summary Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              Customer Information
            </h3>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">
              {order.customer_name}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              📧 {order.customer_email}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              📞 {order.customer_phone}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
              Shipping Destination
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              📍 {order.shipping_address}
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              {order.city}{order.postal_code ? `, ${order.postal_code}` : ""}, {order.country}
            </p>
            {order.order_notes && (
              <p className="text-slate-500 italic mt-2">
                "Note: {order.order_notes}"
              </p>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="p-6 space-y-4">
          <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
            Items Ordered ({order.items?.length || 0})
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {order.items?.map((item) => {
              const imgUrl = getProductImageUrl(item.product_image_url);
              return (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.product_title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm opacity-50">📦</span>
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.product_title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-600 dark:text-slate-400">Total Charged:</span>
            <span className="text-xl font-black text-orange-600 dark:text-orange-400">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          🖨️ Print Receipt
        </button>

        <Link
          href="/products"
          className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/30 transition-all text-center cursor-pointer active:scale-95"
        >
          Continue Shopping →
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-xs">
          Loading order details...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
