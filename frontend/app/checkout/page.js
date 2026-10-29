"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ordersApi } from "../../lib/api/orders";
import { formatPrice, getProductImageUrl } from "../../lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States",
    order_notes: "",
    payment_method: "cash_on_delivery",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fill user email if authenticated
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({
        ...prev,
        customer_email: prev.customer_email || user.email,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError("Your cart is empty. Please add items to checkout.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderPayload = {
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone.trim(),
        shipping_address: `${formData.shipping_address.trim()}${formData.state ? `, ${formData.state.trim()}` : ""}`,
        city: formData.city.trim(),
        postal_code: formData.postal_code.trim() || null,
        country: formData.country.trim() || "United States",
        order_notes: formData.order_notes.trim() || null,
        payment_method: formData.payment_method,
        items: cartItems.map((item) => ({
          product_id: item.id || null,
          product_title: item.title,
          product_slug: item.slug || null,
          product_image_url: item.image_url || null,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const createdOrder = await ordersApi.create(orderPayload);
      clearCart();
      router.push(`/checkout/success?order_number=${encodeURIComponent(createdOrder.order_number)}`);
    } catch (err) {
      console.error("Failed to place order:", err);
      setError(err.message || "Failed to process your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center text-4xl">
            🛍️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Your cart is empty
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              You need items in your cart before you can proceed to checkout.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-600/30 transition-all cursor-pointer active:scale-95"
          >
            ← Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Checkout Progress / Breadcrumbs */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-orange-500 transition-colors">Store</Link>
            <span>/</span>
            <span className="text-orange-500 font-medium">Checkout</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Customer Details & Checkout
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Please enter your contact and shipping information to finalize your order.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-slate-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Customer Details Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Contact Information */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <span className="w-7 h-7 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Contact Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  name="customer_email"
                  required
                  placeholder="john@example.com"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Shipping Address */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <span className="w-7 h-7 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Shipping Address
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="shipping_address"
                  required
                  placeholder="123 Innovation Way, Apt 4B"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  State / Province
                </label>
                <input
                  type="text"
                  name="state"
                  placeholder="California"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  name="postal_code"
                  placeholder="94105"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Country <span className="text-rose-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white outline-none transition-all cursor-pointer"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Order Notes / Delivery Instructions (Optional)
                </label>
                <textarea
                  name="order_notes"
                  rows={2}
                  placeholder="Special instructions for delivery (e.g. gate code, leave at front door)..."
                  value={formData.order_notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Payment Method */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <span className="w-7 h-7 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Payment Option
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`relative flex items-center p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.payment_method === "cash_on_delivery"
                    ? "border-orange-500 bg-orange-500/5 dark:bg-orange-500/10"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="cash_on_delivery"
                  checked={formData.payment_method === "cash_on_delivery"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
                    💵
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Cash on Delivery
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pay with cash when package arrives
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`relative flex items-center p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.payment_method === "credit_card"
                    ? "border-orange-500 bg-orange-500/5 dark:bg-orange-500/10"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="credit_card"
                  checked={formData.payment_method === "credit_card"}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-lg">
                    💳
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Credit / Debit Card
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Instant simulated checkout
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right column: Order Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Order Summary
              </h2>
              <span className="text-xs text-slate-400">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items
              </span>
            </div>

            {/* Cart Items List */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {cartItems.map((item) => {
                const img = getProductImageUrl(item.image_url);
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center">
                      {img ? (
                        <img src={img} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm opacity-50">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & Handling</span>
                <span className="font-semibold text-emerald-500">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax</span>
                <span className="font-semibold text-slate-900 dark:text-white">$0.00</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-black text-orange-600 dark:text-orange-400">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 shadow-xl shadow-orange-600/30 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order Now</span>
                  <span>→</span>
                </>
              )}
            </button>

            {/* Badges */}
            <div className="pt-3 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">🔒 256-Bit SSL Encrypted</span>
              <span className="flex items-center gap-1">✨ Guaranteed Delivery</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
